import { randomUUID } from 'node:crypto'
import type { PoolConnection, ResultSetHeader } from 'mysql2/promise'
import type { ExecuteValues } from 'mysql2'

import { query, queryOne, transaction, type Row } from '../../db/pool.js'
import { buildFilters, resolveSort, type ListParams, type ListResult } from '../../http/listParams.js'
import { notFound, unprocessable } from '../../http/errors.js'
import type { CourseInput } from './courses.schema.js'

/**
 * Sortable and filterable columns, whitelisted.
 *
 * Column names cannot be parameterised, so anything reaching an ORDER BY or
 * WHERE clause must come from these maps — never straight from the query string.
 */
const SORTABLE: Record<string, string> = {
  title: 'c.title',
  fee: 'c.fee',
  status: 'c.status',
  createdAt: 'c.created_at',
  updatedAt: 'c.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'c.status',
  mode: 'c.mode',
  level: 'c.level',
  categoryId: 'c.category_id',
  featured: 'c.featured',
  createdAt: 'c.created_at',
  updatedAt: 'c.updated_at',
}

/** DB row → the JSON shape the CMS expects (camelCase, nested SEO). */
function toCourse(row: Row, children: Children): unknown {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    categoryId: row.category_id ?? undefined,
    // The name as well as the id: the website groups courses by category, and
    // making it fetch the category list separately to resolve a label is a
    // round trip for something the join already has.
    categoryName: row.category_name ?? undefined,
    categorySlug: row.category_slug ?? undefined,
    segment: row.segment ?? 'courses',
    tagline: row.tagline ?? undefined,
    demand: row.demand ?? undefined,
    careers: (row.careers as string[] | null) ?? [],
    tools: (row.tools as string[] | null) ?? [],
    salary: row.salary ?? undefined,
    shortDescription: row.short_description,
    description: row.description,
    duration: row.duration,
    // DECIMAL comes back as a string from the driver; the UI expects a number.
    fee: Number(row.fee),
    discountedFee: row.discounted_fee === null ? undefined : Number(row.discounted_fee),
    level: row.level,
    mode: row.mode,
    thumbnail: row.thumbnail_id
      ? { id: row.thumbnail_id, url: row.thumbnail_url, alt: row.thumbnail_alt ?? '' }
      : undefined,
    gallery: children.gallery,
    syllabus: children.syllabus,
    highlights: children.highlights,
    eligibility: row.eligibility ?? undefined,
    certification: row.certification ?? undefined,
    branchIds: children.branchIds,
    featured: Boolean(row.featured),
    seo: {
      metaTitle: row.meta_title ?? undefined,
      metaDescription: row.meta_description ?? undefined,
      keywords: (row.meta_keywords as string[] | null) ?? [],
      canonicalUrl: row.canonical_url ?? undefined,
    },
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

interface Children {
  syllabus: unknown[]
  highlights: string[]
  branchIds: string[]
  gallery: unknown[]
}

const EMPTY: Children = { syllabus: [], highlights: [], branchIds: [], gallery: [] }

/**
 * Loads every child row for a set of courses in four queries rather than four
 * per course — the N+1 that turns a 25-row page into 100+ round trips.
 */
async function loadChildren(ids: string[]): Promise<Map<string, Children>> {
  const map = new Map<string, Children>()
  if (ids.length === 0) return map

  for (const id of ids) map.set(id, { syllabus: [], highlights: [], branchIds: [], gallery: [] })
  const placeholders = ids.map(() => '?').join(',')

  const syllabus = await query<Row>(
    `SELECT id, course_id, title, hours, topics, position
       FROM course_syllabus WHERE course_id IN (${placeholders}) ORDER BY position`,
    ids,
  )
  for (const row of syllabus) {
    map.get(row.course_id as string)?.syllabus.push({
      id: row.id,
      title: row.title,
      hours: row.hours ?? undefined,
      topics: (row.topics as string[] | null) ?? [],
    })
  }

  const highlights = await query<Row>(
    `SELECT course_id, value FROM course_highlights
      WHERE course_id IN (${placeholders}) ORDER BY position`,
    ids,
  )
  for (const row of highlights) {
    map.get(row.course_id as string)?.highlights.push(row.value as string)
  }

  const branches = await query<Row>(
    `SELECT course_id, branch_id FROM course_branches WHERE course_id IN (${placeholders})`,
    ids,
  )
  for (const row of branches) {
    map.get(row.course_id as string)?.branchIds.push(row.branch_id as string)
  }

  const gallery = await query<Row>(
    `SELECT cg.course_id, m.id, m.url, m.alt
       FROM course_gallery cg JOIN media m ON m.id = cg.media_id
      WHERE cg.course_id IN (${placeholders}) ORDER BY cg.position`,
    ids,
  )
  for (const row of gallery) {
    map.get(row.course_id as string)?.gallery.push({ id: row.id, url: row.url, alt: row.alt })
  }

  return map
}

const SELECT_COURSE = `
  SELECT c.*, m.url AS thumbnail_url, m.alt AS thumbnail_alt,
         cat.name AS category_name, cat.slug AS category_slug
    FROM courses c
    LEFT JOIN media m ON m.id = c.thumbnail_id
    LEFT JOIN categories cat ON cat.id = c.category_id
`

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, {
    column: 'c.updated_at',
    dir: 'desc',
  })

  // FULLTEXT where a search term is given, so this keeps using an index as the
  // table grows. LIKE '%term%' cannot.
  const searchSql = params.search ? ' AND MATCH(c.title, c.short_description) AGAINST (? IN NATURAL LANGUAGE MODE)' : ''
  const searchParams = params.search ? [params.search] : []
  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM courses c ${where}`,
    whereParams,
  )
  const total = Number(totalRow?.total ?? 0)

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `${SELECT_COURSE} ${where} ORDER BY ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  const children = await loadChildren(rows.map((row) => row.id as string))

  return {
    items: rows.map((row) => toCourse(row, children.get(row.id as string) ?? EMPTY)),
    total,
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`${SELECT_COURSE} WHERE c.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Course')

  const children = await loadChildren([id])
  return toCourse(row, children.get(id) ?? EMPTY)
}

/** Slugs become public URLs, so a duplicate would shadow an existing page. */
async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM courses WHERE slug = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [slug, exceptId] : [slug],
  )
  if (clash) throw unprocessable({ slug: 'This slug is already in use.' })
}

async function writeChildren(
  connection: PoolConnection,
  courseId: string,
  input: CourseInput,
): Promise<void> {
  // Replace wholesale rather than diffing — the payload is the full desired
  // state, and positions must end up contiguous.
  await connection.execute<ResultSetHeader>('DELETE FROM course_syllabus   WHERE course_id = ?', [courseId])
  await connection.execute<ResultSetHeader>('DELETE FROM course_highlights WHERE course_id = ?', [courseId])
  await connection.execute<ResultSetHeader>('DELETE FROM course_branches   WHERE course_id = ?', [courseId])
  await connection.execute<ResultSetHeader>('DELETE FROM course_gallery    WHERE course_id = ?', [courseId])

  for (const [index, module] of input.syllabus.entries()) {
    await connection.execute<ResultSetHeader>(
      `INSERT INTO course_syllabus (id, course_id, title, hours, topics, position)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [randomUUID(), courseId, module.title, module.hours ?? null, JSON.stringify(module.topics), index],
    )
  }

  for (const [index, value] of input.highlights.entries()) {
    await connection.execute<ResultSetHeader>(
      'INSERT INTO course_highlights (course_id, value, position) VALUES (?, ?, ?)',
      [courseId, value, index],
    )
  }

  for (const branchId of input.branchIds) {
    await connection.execute<ResultSetHeader>(
      'INSERT INTO course_branches (course_id, branch_id) VALUES (?, ?)',
      [courseId, branchId],
    )
  }

  for (const [index, image] of input.gallery.entries()) {
    await connection.execute<ResultSetHeader>(
      'INSERT INTO course_gallery (course_id, media_id, position) VALUES (?, ?, ?)',
      [courseId, image.id, index],
    )
  }
}

const COLUMNS = `title, slug, segment, category_id, short_description, tagline, demand,
  careers, tools, salary, description, duration, fee,
  discounted_fee, level, mode, thumbnail_id, eligibility, certification, featured, status,
  meta_title, meta_description, meta_keywords, og_image_id, canonical_url`

function columnValues(input: CourseInput): unknown[] {
  return [
    input.title,
    input.slug,
    input.segment,
    input.categoryId || null,
    input.shortDescription,
    input.tagline || null,
    input.demand || null,
    JSON.stringify(input.careers ?? []),
    JSON.stringify(input.tools ?? []),
    input.salary || null,
    input.description,
    input.duration,
    input.fee,
    input.discountedFee ?? null,
    input.level,
    input.mode,
    input.thumbnail?.id ?? null,
    input.eligibility ?? null,
    input.certification ?? null,
    input.featured ? 1 : 0,
    input.status,
    input.seo.metaTitle ?? null,
    input.seo.metaDescription ?? null,
    JSON.stringify(input.seo.keywords ?? []),
    input.seo.ogImage?.id ?? null,
    input.seo.canonicalUrl ?? null,
  ]
}

export async function create(input: CourseInput): Promise<unknown> {
  await assertSlugFree(input.slug)

  const id = randomUUID()
  await transaction(async (connection) => {
    const placeholders = COLUMNS.split(',').length
    await connection.execute<ResultSetHeader>(
      `INSERT INTO courses (id, ${COLUMNS}, created_at, updated_at)
       VALUES (?, ${Array(placeholders).fill('?').join(', ')}, NOW(3), NOW(3))`,
      [id, ...columnValues(input)] as ExecuteValues,
    )
    await writeChildren(connection, id, input)
  })

  return get(id)
}

export async function update(id: string, input: CourseInput): Promise<unknown> {
  const existing = await queryOne<{ id: string }>('SELECT id FROM courses WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Course')

  await assertSlugFree(input.slug, id)

  await transaction(async (connection) => {
    const assignments = COLUMNS.split(',')
      .map((column) => `${column.trim()} = ?`)
      .join(', ')

    await connection.execute<ResultSetHeader>(
      `UPDATE courses SET ${assignments}, updated_at = NOW(3) WHERE id = ?`,
      [...columnValues(input), id] as ExecuteValues,
    )
    await writeChildren(connection, id, input)
  })

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  // Child rows go with them via ON DELETE CASCADE.
  await query(`DELETE FROM courses WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
}
