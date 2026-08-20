import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { notFound } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { ReviewInput, ReviewPatch } from './reviews.schema.js'

const SORTABLE: Record<string, string> = {
  authorName: 'r.author_name',
  rating: 'r.rating',
  order: 'r.sort_order',
  status: 'r.status',
  createdAt: 'r.created_at',
  updatedAt: 'r.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'r.status',
  source: 'r.source',
  rating: 'r.rating',
  createdAt: 'r.created_at',
  updatedAt: 'r.updated_at',
}

function toReview(row: Row): unknown {
  return {
    id: row.id,
    authorName: row.author_name,
    rating: Number(row.rating),
    quote: row.quote,
    reviewedOn: row.reviewed_on ?? undefined,
    courseName: row.course_name ?? undefined,
    source: row.source,
    googleUrl: row.google_url ?? undefined,
    order: Number(row.sort_order),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'r.sort_order', dir: 'asc' })

  const searchSql = params.search ? ' AND (r.author_name LIKE ? OR r.quote LIKE ?)' : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM reviews r ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `SELECT r.* FROM reviews r ${where} ORDER BY ${column} ${dir}, r.created_at DESC LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  return {
    items: rows.map(toReview),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id])
  if (!row) throw notFound('Review')
  return toReview(row)
}

const COLUMNS =
  'author_name, rating, quote, reviewed_on, course_name, source, google_url, sort_order, status'

export async function create(input: ReviewInput): Promise<unknown> {
  const id = randomUUID()
  await execute(
    `INSERT INTO reviews (id, ${COLUMNS}, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
    [
      id,
      input.authorName,
      input.rating,
      input.quote,
      input.reviewedOn || null,
      input.courseName || null,
      input.source,
      input.googleUrl || null,
      input.order,
      input.status,
    ],
  )
  return get(id)
}

/** Columns where '' means "clear this" — see the note in faculty.repo.ts. */
const NULLABLE = new Set(['reviewed_on', 'course_name', 'google_url'])

export async function update(id: string, patch: ReviewPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM reviews WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Review')

  const mapping: Record<string, string> = {
    authorName: 'author_name',
    rating: 'rating',
    quote: 'quote',
    reviewedOn: 'reviewed_on',
    courseName: 'course_name',
    source: 'source',
    googleUrl: 'google_url',
    order: 'sort_order',
    status: 'status',
  }

  const assignments: string[] = []
  const params: unknown[] = []

  for (const [key, column] of Object.entries(mapping)) {
    const value = patch[key as keyof ReviewPatch]
    if (value === undefined) continue
    assignments.push(`${column} = ?`)
    params.push(value === '' && NULLABLE.has(column) ? null : value)
  }

  if (assignments.length > 0) {
    await execute(
      `UPDATE reviews SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
      [...params, id],
    )
  }

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await query(`DELETE FROM reviews WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
}
