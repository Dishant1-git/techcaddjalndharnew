import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { notFound } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { TestimonialInput, TestimonialPatch } from './testimonials.schema.js'

const SORTABLE: Record<string, string> = {
  studentName: 't.student_name',
  rating: 't.rating',
  status: 't.status',
  featured: 't.featured',
  createdAt: 't.created_at',
  updatedAt: 't.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 't.status',
  courseId: 't.course_id',
  rating: 't.rating',
  featured: 't.featured',
  createdAt: 't.created_at',
  updatedAt: 't.updated_at',
}

function toTestimonial(row: Row): unknown {
  return {
    id: row.id,
    studentName: row.student_name,
    photo: row.photo_id
      ? { id: row.photo_id, url: row.photo_url, alt: row.photo_alt ?? '' }
      : undefined,
    courseId: row.course_id ?? undefined,
    batch: row.batch ?? undefined,
    rating: Number(row.rating),
    quote: row.quote,
    videoUrl: row.video_url ?? undefined,
    featured: Boolean(row.featured),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const SELECT_TESTIMONIAL = `
  SELECT t.*, m.url AS photo_url, m.alt AS photo_alt
    FROM testimonials t
    LEFT JOIN media m ON m.id = t.photo_id
`

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 't.updated_at', dir: 'desc' })

  const searchSql = params.search ? ' AND (t.student_name LIKE ? OR t.quote LIKE ?)' : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM testimonials t ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    // Featured first within the chosen sort — that is how the public page reads.
    `${SELECT_TESTIMONIAL} ${where} ORDER BY t.featured DESC, ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  return {
    items: rows.map(toTestimonial),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`${SELECT_TESTIMONIAL} WHERE t.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Testimonial')
  return toTestimonial(row)
}

const COLUMNS = `student_name, photo_id, course_id, batch, rating, quote, video_url,
  featured, status`

function values(input: TestimonialInput): unknown[] {
  return [
    input.studentName,
    input.photo?.id ?? null,
    input.courseId || null,
    input.batch || null,
    input.rating,
    input.quote,
    input.videoUrl || null,
    input.featured ? 1 : 0,
    input.status,
  ]
}

export async function create(input: TestimonialInput): Promise<unknown> {
  const id = randomUUID()
  const count = COLUMNS.split(',').length
  await execute(
    `INSERT INTO testimonials (id, ${COLUMNS}, created_at, updated_at)
     VALUES (?, ${Array(count).fill('?').join(', ')}, NOW(3), NOW(3))`,
    [id, ...values(input)],
  )
  return get(id)
}

/** Columns where '' means "clear this" — see the note in categories.repo.ts. */
const NULLABLE = new Set(['photo_id', 'course_id', 'batch', 'video_url'])

export async function update(id: string, patch: TestimonialPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM testimonials WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Testimonial')

  const mapping: Record<string, string> = {
    studentName: 'student_name',
    courseId: 'course_id',
    batch: 'batch',
    rating: 'rating',
    quote: 'quote',
    videoUrl: 'video_url',
    status: 'status',
  }

  const assignments: string[] = []
  const params: unknown[] = []

  for (const [key, column] of Object.entries(mapping)) {
    const value = patch[key as keyof TestimonialPatch]
    if (value === undefined) continue
    assignments.push(`${column} = ?`)
    params.push(value === '' && NULLABLE.has(column) ? null : value)
  }

  // Booleans and media refs need their own handling: `false` and `undefined`
  // are different answers, and the loop above would treat a media object as a
  // scalar.
  if (patch.featured !== undefined) {
    assignments.push('featured = ?')
    params.push(patch.featured ? 1 : 0)
  }
  if (patch.photo !== undefined) {
    assignments.push('photo_id = ?')
    params.push(patch.photo?.id ?? null)
  }

  if (assignments.length > 0) {
    await execute(
      `UPDATE testimonials SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
      [...params, id],
    )
  }

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  // Nothing references a testimonial; deleting one is always safe.
  await query(`DELETE FROM testimonials WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
}
