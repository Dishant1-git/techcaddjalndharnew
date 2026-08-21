import { randomUUID } from 'node:crypto'
import type { ExecuteValues, PoolConnection, ResultSetHeader } from 'mysql2/promise'

import { toStorableId } from '../../db/ids.js'
import { execute, query, queryOne, transaction, type Row } from '../../db/pool.js'
import { notFound } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { EnquiryBulk, EnquiryInput, EnquiryNoteInput, EnquiryPatch } from './enquiries.schema.js'

const SORTABLE: Record<string, string> = {
  studentName: 'e.student_name',
  status: 'e.status',
  source: 'e.source',
  followUpDate: 'e.follow_up_date',
  createdAt: 'e.created_at',
  updatedAt: 'e.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'e.status',
  source: 'e.source',
  courseId: 'e.course_id',
  assigneeId: 'e.assignee_id',
  followUpDate: 'e.follow_up_date',
  createdAt: 'e.created_at',
  updatedAt: 'e.updated_at',
}

function toEnquiry(row: Row, notes: unknown[]): unknown {
  return {
    id: row.id,
    studentName: row.student_name,
    phone: row.phone,
    email: row.email ?? undefined,
    courseId: row.course_id ?? undefined,
    courseName: row.course_name,
    source: row.source,
    formType: row.form_type ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    message: row.message ?? undefined,
    status: row.status,
    assigneeId: row.assignee_id ?? undefined,
    followUpDate: row.follow_up_date ?? undefined,
    notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** One query for the whole page rather than one per enquiry. */
async function loadNotes(ids: string[]): Promise<Map<string, unknown[]>> {
  const map = new Map<string, unknown[]>()
  if (ids.length === 0) return map
  for (const id of ids) map.set(id, [])

  const rows = await query<Row>(
    `SELECT id, enquiry_id, author, body, created_at FROM enquiry_notes
      WHERE enquiry_id IN (${ids.map(() => '?').join(',')}) ORDER BY created_at`,
    ids,
  )
  for (const row of rows) {
    map.get(row.enquiry_id as string)?.push({
      id: row.id,
      author: row.author,
      body: row.body,
      createdAt: row.created_at,
    })
  }

  return map
}

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'e.created_at', dir: 'desc' })

  // Phone is how the front desk finds a caller, so it is part of the search.
  const searchSql = params.search
    ? ' AND (e.student_name LIKE ? OR e.phone LIKE ? OR e.email LIKE ? OR e.course_name LIKE ?)'
    : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like, like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM enquiries e ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `SELECT e.* FROM enquiries e ${where} ORDER BY ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  const notes = await loadNotes(rows.map((row) => row.id as string))

  return {
    items: rows.map((row) => toEnquiry(row, notes.get(row.id as string) ?? [])),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>('SELECT * FROM enquiries WHERE id = ? LIMIT 1', [id])
  if (!row) throw notFound('Enquiry')

  const notes = await loadNotes([id])
  return toEnquiry(row, notes.get(id) ?? [])
}

/**
 * Reconciles the note timeline against what the client sent.
 *
 * Notes are append-only: the drawer posts the existing array plus one new
 * entry. Deleting and reinserting would rewrite every `created_at`, so
 * existing rows are left untouched and only genuinely new notes are inserted.
 */
async function writeNotes(
  connection: PoolConnection,
  enquiryId: string,
  notes: EnquiryNoteInput[],
): Promise<void> {
  const existing = await query<{ id: string }>(
    'SELECT id FROM enquiry_notes WHERE enquiry_id = ?',
    [enquiryId],
  )
  const known = new Set(existing.map((row) => row.id))

  for (const note of notes) {
    if (note.id && known.has(note.id)) continue
    await connection.execute<ResultSetHeader>(
      `INSERT INTO enquiry_notes (id, enquiry_id, author, body, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        toStorableId(note.id),
        enquiryId,
        note.author,
        note.body,
        // Honour a supplied timestamp so an import keeps its history.
        note.createdAt ? new Date(note.createdAt) : new Date(),
      ] as ExecuteValues,
    )
  }
}

const COLUMNS = `student_name, phone, email, course_id, course_name,
  source, form_type, source_url, ip, user_agent, message, status, assignee_id, follow_up_date`

function values(input: EnquiryInput): unknown[] {
  return [
    input.studentName,
    input.phone,
    input.email || null,
    input.courseId || null,
    input.courseName,
    input.source,
    input.formType || null,
    input.sourceUrl || null,
    input.ip || null,
    input.userAgent || null,
    input.message || null,
    input.status,
    input.assigneeId || null,
    // '' means "no date"; DATE columns reject it outright.
    input.followUpDate || null,
  ]
}

export async function create(input: EnquiryInput): Promise<unknown> {
  const id = randomUUID()

  await transaction(async (connection) => {
    const count = COLUMNS.split(',').length
    await connection.execute<ResultSetHeader>(
      `INSERT INTO enquiries (id, ${COLUMNS}, created_at, updated_at)
       VALUES (?, ${Array(count).fill('?').join(', ')}, NOW(3), NOW(3))`,
      [id, ...values(input)] as ExecuteValues,
    )
    await writeNotes(connection, id, input.notes)
  })

  return get(id)
}

/** Columns where '' means "clear this" — see the note in categories.repo.ts. */
const NULLABLE = new Set([
  'email', 'course_id', 'assignee_id', 'follow_up_date', 'message',
])

const MAPPING: Record<string, string> = {
  studentName: 'student_name',
  phone: 'phone',
  email: 'email',
  courseId: 'course_id',
  courseName: 'course_name',
  source: 'source',
  message: 'message',
  status: 'status',
  assigneeId: 'assignee_id',
  followUpDate: 'follow_up_date',
}

export async function update(id: string, patch: EnquiryPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM enquiries WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Enquiry')

  await transaction(async (connection) => {
    const assignments: string[] = []
    const params: unknown[] = []

    for (const [key, column] of Object.entries(MAPPING)) {
      const value = patch[key as keyof EnquiryPatch]
      if (value === undefined) continue
      assignments.push(`${column} = ?`)
      params.push(value === '' && NULLABLE.has(column) ? null : value)
    }

    if (assignments.length > 0) {
      await connection.execute<ResultSetHeader>(
        `UPDATE enquiries SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
        [...params, id] as ExecuteValues,
      )
    }

    if (patch.notes !== undefined) await writeNotes(connection, id, patch.notes)
  })

  return get(id)
}

/**
 * Applies one change to many enquiries.
 *
 * The list offers reassign / restatus / set-follow-up over a selection; doing
 * that as N round trips would be both slow and non-atomic.
 */
export async function bulkUpdate(input: EnquiryBulk): Promise<number> {
  const assignments: string[] = []
  const params: unknown[] = []

  if (input.status !== undefined) {
    assignments.push('status = ?')
    params.push(input.status)
  }
  if (input.assigneeId !== undefined) {
    assignments.push('assignee_id = ?')
    params.push(input.assigneeId || null)
  }
  if (input.followUpDate !== undefined) {
    assignments.push('follow_up_date = ?')
    params.push(input.followUpDate || null)
  }

  if (assignments.length === 0) return 0

  const placeholders = input.ids.map(() => '?').join(',')
  await execute(
    `UPDATE enquiries SET ${assignments.join(', ')}, updated_at = NOW(3)
      WHERE id IN (${placeholders})`,
    [...params, ...input.ids],
  )

  return input.ids.length
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  // enquiry_notes cascades.
  await query(`DELETE FROM enquiries WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
}
