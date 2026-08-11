import { randomUUID } from 'node:crypto'
import type { ExecuteValues, PoolConnection, ResultSetHeader } from 'mysql2/promise'

import { query, queryOne, transaction, type Row } from '../../db/pool.js'
import { badRequest, notFound, unprocessable } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { BranchInput, BranchPatch } from './branches.schema.js'

const SORTABLE: Record<string, string> = {
  name: 'b.name',
  code: 'b.code',
  city: 'b.city',
  status: 'b.status',
  createdAt: 'b.created_at',
  updatedAt: 'b.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'b.status',
  city: 'b.city',
  state: 'b.state',
  managerId: 'b.manager_id',
  createdAt: 'b.created_at',
  updatedAt: 'b.updated_at',
}

interface Children {
  phones: string[]
  hours: unknown[]
  photos: unknown[]
}

const EMPTY: Children = { phones: [], hours: [], photos: [] }

function toBranch(row: Row, children: Children): unknown {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2 ?? undefined,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    phones: children.phones,
    email: row.email ?? undefined,
    mapEmbedUrl: row.map_embed_url ?? undefined,
    latitude: row.latitude === null ? undefined : Number(row.latitude),
    longitude: row.longitude === null ? undefined : Number(row.longitude),
    hours: children.hours,
    photos: children.photos,
    managerId: row.manager_id ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Three queries for the whole page, not three per branch. */
async function loadChildren(ids: string[]): Promise<Map<string, Children>> {
  const map = new Map<string, Children>()
  if (ids.length === 0) return map
  for (const id of ids) map.set(id, { phones: [], hours: [], photos: [] })

  const placeholders = ids.map(() => '?').join(',')

  const phones = await query<Row>(
    `SELECT branch_id, phone FROM branch_phones
      WHERE branch_id IN (${placeholders}) ORDER BY position`,
    ids,
  )
  for (const row of phones) map.get(row.branch_id as string)?.phones.push(row.phone as string)

  const hours = await query<Row>(
    `SELECT branch_id, day, open_time, close_time, closed FROM branch_hours
      WHERE branch_id IN (${placeholders})`,
    ids,
  )
  for (const row of hours) {
    map.get(row.branch_id as string)?.hours.push({
      day: row.day,
      // TIME comes back as HH:MM:SS; the <input type="time"> wants HH:MM.
      open: row.open_time ? String(row.open_time).slice(0, 5) : undefined,
      close: row.close_time ? String(row.close_time).slice(0, 5) : undefined,
      closed: Boolean(row.closed),
    })
  }

  const photos = await query<Row>(
    `SELECT bp.branch_id, m.id, m.url, m.alt FROM branch_photos bp
       JOIN media m ON m.id = bp.media_id
      WHERE bp.branch_id IN (${placeholders}) ORDER BY bp.position`,
    ids,
  )
  for (const row of photos) {
    map.get(row.branch_id as string)?.photos.push({ id: row.id, url: row.url, alt: row.alt })
  }

  return map
}

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'b.name', dir: 'asc' })

  const searchSql = params.search ? ' AND (b.name LIKE ? OR b.code LIKE ? OR b.city LIKE ?)' : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM branches b ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `SELECT b.* FROM branches b ${where} ORDER BY ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  const children = await loadChildren(rows.map((row) => row.id as string))

  return {
    items: rows.map((row) => toBranch(row, children.get(row.id as string) ?? EMPTY)),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>('SELECT * FROM branches b WHERE b.id = ? LIMIT 1', [id])
  if (!row) throw notFound('Branch')

  const children = await loadChildren([id])
  return toBranch(row, children.get(id) ?? EMPTY)
}

/** The code appears on enquiry records, so it has to stay unique. */
async function assertCodeFree(code: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM branches WHERE code = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [code, exceptId] : [code],
  )
  if (clash) throw unprocessable({ code: 'This branch code is already in use.' })
}

async function writeChildren(
  connection: PoolConnection,
  branchId: string,
  input: Pick<BranchInput, 'phones' | 'hours' | 'photos'>,
): Promise<void> {
  await connection.execute<ResultSetHeader>('DELETE FROM branch_phones WHERE branch_id = ?', [branchId])
  await connection.execute<ResultSetHeader>('DELETE FROM branch_hours  WHERE branch_id = ?', [branchId])
  await connection.execute<ResultSetHeader>('DELETE FROM branch_photos WHERE branch_id = ?', [branchId])

  for (const [index, phone] of input.phones.entries()) {
    await connection.execute<ResultSetHeader>(
      'INSERT INTO branch_phones (branch_id, phone, position) VALUES (?, ?, ?)',
      [branchId, phone, index],
    )
  }

  for (const entry of input.hours) {
    await connection.execute<ResultSetHeader>(
      `INSERT INTO branch_hours (branch_id, day, open_time, close_time, closed)
       VALUES (?, ?, ?, ?, ?)`,
      [branchId, entry.day, entry.open ?? null, entry.close ?? null, entry.closed ? 1 : 0] as ExecuteValues,
    )
  }

  for (const [index, photo] of input.photos.entries()) {
    await connection.execute<ResultSetHeader>(
      'INSERT INTO branch_photos (branch_id, media_id, position) VALUES (?, ?, ?)',
      [branchId, photo.id, index],
    )
  }
}

const COLUMNS = `name, code, address_line1, address_line2, city, state, pincode, email,
  map_embed_url, latitude, longitude, manager_id, status`

function values(input: BranchInput): unknown[] {
  return [
    input.name,
    input.code,
    input.addressLine1,
    input.addressLine2 ?? null,
    input.city,
    input.state,
    input.pincode,
    input.email || null,
    input.mapEmbedUrl ?? null,
    input.latitude ?? null,
    input.longitude ?? null,
    input.managerId || null,
    input.status,
  ]
}

export async function create(input: BranchInput): Promise<unknown> {
  await assertCodeFree(input.code)

  const id = randomUUID()
  await transaction(async (connection) => {
    const count = COLUMNS.split(',').length
    await connection.execute<ResultSetHeader>(
      `INSERT INTO branches (id, ${COLUMNS}, created_at, updated_at)
       VALUES (?, ${Array(count).fill('?').join(', ')}, NOW(3), NOW(3))`,
      [id, ...values(input)] as ExecuteValues,
    )
    await writeChildren(connection, id, input)
  })

  return get(id)
}

/** Columns where '' means "clear this" — see the note in faculty.repo.ts. */
const NULLABLE = new Set([
  'address_line2', 'email', 'map_embed_url', 'latitude', 'longitude', 'manager_id',
])

export async function update(id: string, patch: BranchPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM branches WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Branch')
  if (patch.code !== undefined) await assertCodeFree(patch.code, id)

  const mapping: Record<string, string> = {
    name: 'name',
    code: 'code',
    addressLine1: 'address_line1',
    addressLine2: 'address_line2',
    city: 'city',
    state: 'state',
    pincode: 'pincode',
    email: 'email',
    mapEmbedUrl: 'map_embed_url',
    latitude: 'latitude',
    longitude: 'longitude',
    managerId: 'manager_id',
    status: 'status',
  }

  await transaction(async (connection) => {
    const assignments: string[] = []
    const params: unknown[] = []

    for (const [key, column] of Object.entries(mapping)) {
      const value = patch[key as keyof BranchPatch]
      if (value === undefined) continue
      assignments.push(`${column} = ?`)
      params.push(value === '' && NULLABLE.has(column) ? null : value)
    }

    if (assignments.length > 0) {
      await connection.execute<ResultSetHeader>(
        `UPDATE branches SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
        [...params, id] as ExecuteValues,
      )
    }

    // Only rewrite children when the caller actually sent them.
    if (patch.phones || patch.hours || patch.photos) {
      const current = (await loadChildren([id])).get(id) ?? EMPTY
      await writeChildren(connection, id, {
        phones: patch.phones ?? current.phones,
        hours: (patch.hours ?? current.hours) as BranchInput['hours'],
        photos: (patch.photos ?? current.photos) as BranchInput['photos'],
      })
    }
  })

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const placeholders = ids.map(() => '?').join(',')

  const [courses] = await query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM course_branches WHERE branch_id IN (${placeholders})`,
    ids,
  )
  if ((courses?.n ?? 0) > 0) {
    throw badRequest(
      `${courses?.n} course${courses?.n === 1 ? ' is' : 's are'} offered at this branch. Remove the link first.`,
    )
  }

  await query(`DELETE FROM branches WHERE id IN (${placeholders})`, ids)
}
