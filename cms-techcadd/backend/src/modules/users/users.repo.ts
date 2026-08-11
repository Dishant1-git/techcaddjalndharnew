import { randomBytes, randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { badRequest, notFound, unprocessable } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import { hashPassword, type SessionUser } from '../auth/auth.service.js'
import type { UserInput, UserPatch } from './users.schema.js'

const SORTABLE: Record<string, string> = {
  name: 'u.name',
  email: 'u.email',
  role: 'u.role',
  active: 'u.active',
  createdAt: 'u.created_at',
  updatedAt: 'u.updated_at',
}

const FILTERABLE: Record<string, string> = {
  role: 'u.role',
  active: 'u.active',
  createdAt: 'u.created_at',
  updatedAt: 'u.updated_at',
}

/**
 * `password_hash` is never selected into this shape.
 *
 * Not merely omitted here — the queries below list their columns explicitly so
 * a hash cannot reach the response by accident, the way `SELECT *` would allow.
 */
function toUser(row: Row): unknown {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar_id
      ? { id: row.avatar_id, url: row.avatar_url, alt: row.avatar_alt ?? '' }
      : undefined,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const SELECT_USER = `
  SELECT u.id, u.name, u.email, u.role, u.avatar_id, u.active, u.created_at, u.updated_at,
         m.url AS avatar_url, m.alt AS avatar_alt
    FROM users u
    LEFT JOIN media m ON m.id = u.avatar_id
`

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'u.name', dir: 'asc' })

  const searchSql = params.search ? ' AND (u.name LIKE ? OR u.email LIKE ?)' : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM users u ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `${SELECT_USER} ${where} ORDER BY ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  return {
    items: rows.map(toUser),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`${SELECT_USER} WHERE u.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('User')
  return toUser(row)
}

/** Email is the sign-in identifier, so a duplicate would make login ambiguous. */
async function assertEmailFree(email: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE email = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [email, exceptId] : [email],
  )
  if (clash) throw unprocessable({ email: 'This email is already registered.' })
}

/**
 * How many active administrators would remain if this one were excluded.
 *
 * There is only one role, so every account is an administrator and this is the
 * whole safety net: locking out the last one leaves nobody able to sign in and
 * no way back without database access.
 */
async function otherActiveAdmins(exceptIds: string[]): Promise<number> {
  const placeholders = exceptIds.map(() => '?').join(',')
  const row = await queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM users
      WHERE active = 1 AND id NOT IN (${placeholders})`,
    exceptIds,
  )
  return Number(row?.n ?? 0)
}

/** A temporary password, shown once because the CMS form does not collect one. */
function generatePassword(): string {
  return randomBytes(12).toString('base64url')
}

export async function create(
  input: UserInput,
): Promise<{ user: unknown; temporaryPassword?: string }> {
  const email = input.email.toLowerCase()
  await assertEmailFree(email)

  const temporary = input.password ? undefined : generatePassword()
  const id = randomUUID()

  await execute(
    `INSERT INTO users (id, name, email, password_hash, role, avatar_id, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
    [
      id,
      input.name,
      email,
      await hashPassword(input.password ?? (temporary as string)),
      input.role,
      input.avatar?.id ?? null,
      input.active ? 1 : 0,
    ],
  )

  return { user: await get(id), temporaryPassword: temporary }
}

export async function update(id: string, patch: UserPatch, actor: SessionUser): Promise<unknown> {
  const existing = await queryOne<Row>(
    'SELECT id, role, active FROM users WHERE id = ? LIMIT 1',
    [id],
  )
  if (!existing) throw notFound('User')

  const email = patch.email?.toLowerCase()
  if (email !== undefined) await assertEmailFree(email, id)

  if (id === actor.userId && patch.active === false) {
    throw badRequest('You cannot deactivate your own account.')
  }

  // Deactivating the last active account would leave nobody able to sign in,
  // and no way back without database access.
  if (patch.active === false && existing.active && (await otherActiveAdmins([id])) === 0) {
    throw badRequest('This is the only active account. Add another one first.')
  }

  const assignments: string[] = []
  const params: unknown[] = []

  if (patch.name !== undefined) {
    assignments.push('name = ?')
    params.push(patch.name)
  }
  if (email !== undefined) {
    assignments.push('email = ?')
    params.push(email)
  }
  if (patch.role !== undefined) {
    assignments.push('role = ?')
    params.push(patch.role)
  }
  if (patch.avatar !== undefined) {
    assignments.push('avatar_id = ?')
    params.push(patch.avatar?.id ?? null)
  }
  if (patch.active !== undefined) {
    assignments.push('active = ?')
    params.push(patch.active ? 1 : 0)
  }
  if (patch.password !== undefined) {
    assignments.push('password_hash = ?')
    params.push(await hashPassword(patch.password))
  }

  if (assignments.length > 0) {
    await execute(
      `UPDATE users SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
      [...params, id],
    )
  }

  // A deactivated or re-credentialled account must not keep working through an
  // existing cookie — the session is what actually grants access.
  if (patch.active === false || patch.password !== undefined) {
    await execute('DELETE FROM sessions WHERE user_id = ?', [id])
  }

  return get(id)
}

export async function remove(ids: string[], actor: SessionUser): Promise<void> {
  if (ids.length === 0) return

  if (ids.includes(actor.userId)) {
    throw badRequest('You cannot delete your own account.')
  }

  // Counted as a set, not per row: two accounts deleted together would each
  // otherwise see the other as a survivor.
  if ((await otherActiveAdmins(ids)) === 0) {
    throw badRequest('That would remove the last account. Add another one first.')
  }

  // sessions cascade; content authored by the user keeps its rows, with the
  // foreign keys nulling the reference.
  const placeholders = ids.map(() => '?').join(',')
  await execute(`DELETE FROM users WHERE id IN (${placeholders})`, ids)
}
