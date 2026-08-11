import { randomBytes, randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { badRequest, forbidden, notFound, unprocessable } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import { hashPassword, type SessionUser, type UserRole } from '../auth/auth.service.js'
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
 * Only a super-admin may create or alter one.
 *
 * Without this an admin could promote themselves and escape every remaining
 * restriction, which makes the role boundary decorative.
 */
function assertMayGrant(role: UserRole, actor: SessionUser): void {
  if (role === 'super-admin' && actor.role !== 'super-admin') {
    throw forbidden('Only a super admin can grant the super admin role.')
  }
}

/** How many active super admins would remain if this one were excluded. */
async function otherActiveSuperAdmins(exceptId: string): Promise<number> {
  const row = await queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM users
      WHERE role = 'super-admin' AND active = 1 AND id <> ?`,
    [exceptId],
  )
  return Number(row?.n ?? 0)
}

/** A temporary password, shown once because there is no mailer yet. */
function generatePassword(): string {
  return randomBytes(12).toString('base64url')
}

export async function create(
  input: UserInput,
  actor: SessionUser,
): Promise<{ user: unknown; temporaryPassword?: string }> {
  const email = input.email.toLowerCase()
  await assertEmailFree(email)
  assertMayGrant(input.role, actor)

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

  // Both directions matter: granting the role, and changing someone who
  // already holds it.
  if (patch.role !== undefined) assertMayGrant(patch.role, actor)
  if (existing.role === 'super-admin' && actor.role !== 'super-admin') {
    throw forbidden('Only a super admin can modify another super admin.')
  }

  // Locking out the last super admin would leave nobody able to restore access.
  const losingLastSuperAdmin =
    existing.role === 'super-admin' &&
    ((patch.role !== undefined && patch.role !== 'super-admin') || patch.active === false) &&
    (await otherActiveSuperAdmins(id)) === 0

  if (losingLastSuperAdmin) {
    throw badRequest('This is the last active super admin. Promote another one first.')
  }

  if (id === actor.userId && patch.active === false) {
    throw badRequest('You cannot deactivate your own account.')
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

  const placeholders = ids.map(() => '?').join(',')
  const targets = await query<{ id: string; role: UserRole }>(
    `SELECT id, role FROM users WHERE id IN (${placeholders})`,
    ids,
  )

  if (targets.some((user) => user.role === 'super-admin') && actor.role !== 'super-admin') {
    throw forbidden('Only a super admin can delete another super admin.')
  }

  // Counting per id would be wrong for a bulk delete: two super admins removed
  // together would each see the other as a survivor.
  const superAdminIds = targets.filter((user) => user.role === 'super-admin').map((user) => user.id)
  if (superAdminIds.length > 0) {
    const remaining = await queryOne<{ n: number }>(
      `SELECT COUNT(*) AS n FROM users
        WHERE role = 'super-admin' AND active = 1
          AND id NOT IN (${superAdminIds.map(() => '?').join(',')})`,
      superAdminIds,
    )
    if (Number(remaining?.n ?? 0) === 0) {
      throw badRequest('That would remove the last super admin. Promote another one first.')
    }
  }

  // sessions cascade; content authored by the user keeps its rows, with the
  // foreign keys nulling the reference.
  await execute(`DELETE FROM users WHERE id IN (${placeholders})`, ids)
}
