import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { badRequest, notFound, unprocessable } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { PageInput, PagePatch } from './pages.schema.js'

const SORTABLE: Record<string, string> = {
  title: 'p.title',
  slug: 'p.slug',
  template: 'p.template',
  status: 'p.status',
  publishDate: 'p.publish_date',
  createdAt: 'p.created_at',
  updatedAt: 'p.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'p.status',
  template: 'p.template',
  system: 'p.is_system',
  publishDate: 'p.publish_date',
  createdAt: 'p.created_at',
  updatedAt: 'p.updated_at',
}

function toPage(row: Row): unknown {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    template: row.template,
    content: row.content,
    publishDate: row.publish_date ?? undefined,
    seo: {
      metaTitle: row.meta_title ?? undefined,
      metaDescription: row.meta_description ?? undefined,
      keywords: (row.meta_keywords as string[] | null) ?? [],
      ogImage: row.og_image_id
        ? { id: row.og_image_id, url: row.og_image_url, alt: row.og_image_alt ?? '' }
        : undefined,
      canonicalUrl: row.canonical_url ?? undefined,
    },
    status: row.status,
    system: Boolean(row.is_system),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const SELECT_PAGE = `
  SELECT p.*, m.url AS og_image_url, m.alt AS og_image_alt
    FROM pages p
    LEFT JOIN media m ON m.id = p.og_image_id
`

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'p.updated_at', dir: 'desc' })

  const searchSql = params.search ? ' AND (p.title LIKE ? OR p.slug LIKE ?)' : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM pages p ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `${SELECT_PAGE} ${where} ORDER BY ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  return {
    items: rows.map(toPage),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`${SELECT_PAGE} WHERE p.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Page')
  return toPage(row)
}

/** The slug is the public URL, so a clash would make one page unreachable. */
async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM pages WHERE slug = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [slug, exceptId] : [slug],
  )
  if (clash) throw unprocessable({ slug: 'This slug is already in use.' })
}

const COLUMNS = `title, slug, template, content, publish_date, status, is_system,
  meta_title, meta_description, meta_keywords, og_image_id, canonical_url`

function values(input: PageInput): unknown[] {
  return [
    input.title,
    input.slug,
    input.template,
    input.content,
    // '' means "no date"; DATE columns reject it outright.
    input.publishDate || null,
    input.status,
    input.system ? 1 : 0,
    input.seo.metaTitle ?? null,
    input.seo.metaDescription ?? null,
    JSON.stringify(input.seo.keywords ?? []),
    input.seo.ogImage?.id ?? null,
    input.seo.canonicalUrl ?? null,
  ]
}

export async function create(input: PageInput): Promise<unknown> {
  await assertSlugFree(input.slug)

  const id = randomUUID()
  const count = COLUMNS.split(',').length
  await execute(
    `INSERT INTO pages (id, ${COLUMNS}, created_at, updated_at)
     VALUES (?, ${Array(count).fill('?').join(', ')}, NOW(3), NOW(3))`,
    [id, ...values(input)],
  )

  return get(id)
}

/** Columns where '' means "clear this" — see the note in faculty.repo.ts. */
const NULLABLE = new Set([
  'publish_date', 'meta_title', 'meta_description', 'og_image_id', 'canonical_url',
])

export async function update(id: string, patch: PagePatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id, slug, is_system FROM pages WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Page')
  if (patch.slug !== undefined) await assertSlugFree(patch.slug, id)

  // A system page is reachable at a fixed URL on the public site. Renaming its
  // slug would break that link just as surely as deleting it.
  if (existing.is_system && patch.slug !== undefined && patch.slug !== existing.slug) {
    throw unprocessable({ slug: 'The slug of a system page cannot be changed.' })
  }

  const mapping: Record<string, string> = {
    title: 'title',
    slug: 'slug',
    template: 'template',
    content: 'content',
    publishDate: 'publish_date',
    status: 'status',
  }

  const assignments: string[] = []
  const params: unknown[] = []

  for (const [key, column] of Object.entries(mapping)) {
    const value = patch[key as keyof PagePatch]
    if (value === undefined) continue
    assignments.push(`${column} = ?`)
    params.push(value === '' && NULLABLE.has(column) ? null : value)
  }

  // `system` is deliberately not patchable: it is a property of the deployment,
  // not something an editor should be able to toggle to unlock deletion.

  if (patch.seo !== undefined) {
    assignments.push(
      'meta_title = ?', 'meta_description = ?', 'meta_keywords = ?',
      'og_image_id = ?', 'canonical_url = ?',
    )
    params.push(
      patch.seo.metaTitle || null,
      patch.seo.metaDescription || null,
      JSON.stringify(patch.seo.keywords ?? []),
      patch.seo.ogImage?.id ?? null,
      patch.seo.canonicalUrl || null,
    )
  }

  if (assignments.length > 0) {
    await execute(
      `UPDATE pages SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
      [...params, id],
    )
  }

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const placeholders = ids.map(() => '?').join(',')

  const [system] = await query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM pages WHERE is_system = 1 AND id IN (${placeholders})`,
    ids,
  )
  if ((system?.n ?? 0) > 0) {
    throw badRequest(
      `${system?.n} of these pages ${system?.n === 1 ? 'is a system page' : 'are system pages'} and cannot be deleted.`,
    )
  }

  await query(`DELETE FROM pages WHERE id IN (${placeholders})`, ids)
}
