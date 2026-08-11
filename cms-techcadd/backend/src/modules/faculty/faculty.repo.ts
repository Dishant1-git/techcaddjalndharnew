import { randomUUID } from 'node:crypto'
import type { ExecuteValues, PoolConnection, ResultSetHeader } from 'mysql2/promise'

import { query, queryOne, transaction, type Row } from '../../db/pool.js'
import { badRequest, notFound } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { FacultyInput, FacultyPatch } from './faculty.schema.js'

const SORTABLE: Record<string, string> = {
  name: 'f.name',
  order: 'f.sort_order',
  experienceYears: 'f.experience_years',
  status: 'f.status',
  createdAt: 'f.created_at',
  updatedAt: 'f.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'f.status',
  branchId: 'f.branch_id',
  createdAt: 'f.created_at',
  updatedAt: 'f.updated_at',
}

function toFaculty(row: Row, expertise: string[]): unknown {
  return {
    id: row.id,
    name: row.name,
    photo: row.photo_id
      ? { id: row.photo_id, url: row.photo_url, alt: row.photo_alt ?? '' }
      : undefined,
    designation: row.designation,
    qualifications: row.qualifications,
    expertise,
    experienceYears: Number(row.experience_years),
    bio: row.bio,
    branchId: row.branch_id ?? undefined,
    email: row.email ?? undefined,
    // JSON comes back parsed from mysql2; guard anyway in case of a legacy row.
    social: typeof row.social === 'string' ? JSON.parse(row.social) : (row.social ?? {}),
    order: Number(row.sort_order),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** One query for the whole page rather than one per trainer. */
async function loadExpertise(ids: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>()
  if (ids.length === 0) return map
  for (const id of ids) map.set(id, [])

  const rows = await query<Row>(
    `SELECT faculty_id, skill FROM faculty_expertise
      WHERE faculty_id IN (${ids.map(() => '?').join(',')}) ORDER BY position`,
    ids,
  )
  for (const row of rows) map.get(row.faculty_id as string)?.push(row.skill as string)

  return map
}

const SELECT_FACULTY = `
  SELECT f.*, m.url AS photo_url, m.alt AS photo_alt
    FROM faculty f
    LEFT JOIN media m ON m.id = f.photo_id
`

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'f.sort_order', dir: 'asc' })

  // Expertise lives in a child table, so the search has to reach into it —
  // "React" should find a trainer even when it is only listed as a skill.
  const searchSql = params.search
    ? ` AND (f.name LIKE ? OR f.designation LIKE ? OR f.qualifications LIKE ?
             OR EXISTS (SELECT 1 FROM faculty_expertise fe
                         WHERE fe.faculty_id = f.id AND fe.skill LIKE ?))`
    : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like, like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM faculty f ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `${SELECT_FACULTY} ${where} ORDER BY ${column} ${dir}, f.name ASC LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  const expertise = await loadExpertise(rows.map((row) => row.id as string))

  return {
    items: rows.map((row) => toFaculty(row, expertise.get(row.id as string) ?? [])),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`${SELECT_FACULTY} WHERE f.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Faculty member')

  const expertise = await loadExpertise([id])
  return toFaculty(row, expertise.get(id) ?? [])
}

async function writeExpertise(
  connection: PoolConnection,
  facultyId: string,
  skills: string[],
): Promise<void> {
  await connection.execute<ResultSetHeader>('DELETE FROM faculty_expertise WHERE faculty_id = ?', [
    facultyId,
  ])
  for (const [index, skill] of skills.entries()) {
    await connection.execute<ResultSetHeader>(
      'INSERT INTO faculty_expertise (faculty_id, skill, position) VALUES (?, ?, ?)',
      [facultyId, skill, index],
    )
  }
}

const COLUMNS = `name, photo_id, designation, qualifications, experience_years, bio,
  branch_id, email, social, sort_order, status`

function values(input: FacultyInput): unknown[] {
  return [
    input.name,
    input.photo?.id ?? null,
    input.designation,
    input.qualifications,
    input.experienceYears,
    input.bio,
    input.branchId || null,
    input.email || null,
    JSON.stringify(input.social ?? {}),
    input.order,
    input.status,
  ]
}

export async function create(input: FacultyInput): Promise<unknown> {
  const id = randomUUID()

  await transaction(async (connection) => {
    const count = COLUMNS.split(',').length
    await connection.execute<ResultSetHeader>(
      `INSERT INTO faculty (id, ${COLUMNS}, created_at, updated_at)
       VALUES (?, ${Array(count).fill('?').join(', ')}, NOW(3), NOW(3))`,
      [id, ...values(input)] as ExecuteValues,
    )
    await writeExpertise(connection, id, input.expertise)
  })

  return get(id)
}

/**
 * Columns where '' means "clear this".
 *
 * Only these: the other text columns are NOT NULL with a '' default, so
 * blanket-converting every empty string to NULL makes clearing an optional
 * field fail with "Column 'qualifications' cannot be null".
 */
const NULLABLE = new Set(['photo_id', 'branch_id', 'email'])

export async function update(id: string, patch: FacultyPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM faculty WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Faculty member')

  const mapping: Record<string, string> = {
    name: 'name',
    designation: 'designation',
    qualifications: 'qualifications',
    experienceYears: 'experience_years',
    bio: 'bio',
    branchId: 'branch_id',
    email: 'email',
    order: 'sort_order',
    status: 'status',
  }

  await transaction(async (connection) => {
    const assignments: string[] = []
    const params: unknown[] = []

    for (const [key, column] of Object.entries(mapping)) {
      const value = patch[key as keyof FacultyPatch]
      if (value === undefined) continue
      assignments.push(`${column} = ?`)
      params.push(value === '' && NULLABLE.has(column) ? null : value)
    }

    if (patch.photo !== undefined) {
      assignments.push('photo_id = ?')
      params.push(patch.photo?.id ?? null)
    }
    if (patch.social !== undefined) {
      assignments.push('social = ?')
      params.push(JSON.stringify(patch.social))
    }

    if (assignments.length > 0) {
      await connection.execute<ResultSetHeader>(
        `UPDATE faculty SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
        [...params, id] as ExecuteValues,
      )
    }

    if (patch.expertise !== undefined) await writeExpertise(connection, id, patch.expertise)
  })

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const placeholders = ids.map(() => '?').join(',')

  // A trainer who manages a branch cannot simply vanish — the branch would be
  // left pointing at nothing. Say so rather than letting the FK null it out.
  const [managed] = await query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM branches WHERE manager_id IN (${placeholders})`,
    ids,
  )
  if ((managed?.n ?? 0) > 0) {
    throw badRequest(
      `${managed?.n} branch${managed?.n === 1 ? ' is' : 'es are'} managed by this trainer. Reassign first.`,
    )
  }

  await query(`DELETE FROM faculty WHERE id IN (${placeholders})`, ids)
}
