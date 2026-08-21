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
import type { PageSectionInput } from '../shared/contentBlock.schema.js'

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

/**
 * The blocks on one page, in order.
 *
 * Fetched separately rather than joined, because a page with six blocks would
 * otherwise multiply its own row six times and every scalar field would have to
 * be de-duplicated back out.
 */
async function sectionsFor(pageId: string): Promise<unknown[]> {
  const rows = await query<Row>(
    `SELECT s.*, m.url AS media_url, m.alt AS media_alt,
            m.width AS media_width, m.height AS media_height
       FROM page_sections s
       LEFT JOIN media m ON m.id = s.media_id
      WHERE s.page_id = ?
      ORDER BY s.position`,
    [pageId],
  )

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title ?? undefined,
    body: row.body ?? undefined,
    media: row.media_id
      ? {
          id: row.media_id,
          url: row.media_url,
          alt: row.media_alt ?? '',
          width: row.media_width ?? undefined,
          height: row.media_height ?? undefined,
        }
      : undefined,
    linkUrl: row.link_url ?? undefined,
    linkLabel: row.link_label ?? undefined,
    linkTarget: row.link_target,
    visible: Boolean(row.visible),
  }))
}

/**
 * Replaces a page's blocks wholesale.
 *
 * The payload is the full desired state — the editor sends the list as it now
 * stands — so diffing would be work in aid of nothing, and positions have to
 * end up contiguous either way.
 */
async function writeSections(pageId: string, sections: PageSectionInput[]): Promise<void> {
  await execute('DELETE FROM page_sections WHERE page_id = ?', [pageId])

  for (const [position, section] of sections.entries()) {
    await execute(
      `INSERT INTO page_sections
         (id, page_id, type, title, body, media_id, link_url, link_label,
          link_target, visible, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
      [
        randomUUID(),
        pageId,
        section.type,
        section.title || null,
        section.body || null,
        section.media?.id ?? null,
        section.linkUrl || null,
        section.linkLabel || null,
        section.linkTarget,
        section.visible ? 1 : 0,
        position,
      ],
    )
  }
}

function toPage(row: Row, sections: unknown[] = []): unknown {
  return {
    id: row.id,
    sections,
    title: row.title,
    slug: row.slug,
    template: row.template,
    navPlacement: row.nav_placement ?? 'none',
    navLabel: row.nav_label ?? undefined,
    navOrder: Number(row.nav_order ?? 0),
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
    // Wrapped rather than passed by reference: map would hand toPage the array
    // index as its second argument, which is the sections parameter.
    items: rows.map((row) => toPage(row)),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`${SELECT_PAGE} WHERE p.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Page')
  // Blocks only on the single-page read. The list view shows a table of titles
  // and statuses; fetching every page's blocks to render that would be a query
  // per row for something nothing displays.
  return toPage(row, await sectionsFor(id))
}

/** The slug is the public URL, so a clash would make one page unreachable. */
async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM pages WHERE slug = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [slug, exceptId] : [slug],
  )
  if (clash) throw unprocessable({ slug: 'This slug is already in use.' })
}

const COLUMNS = `title, slug, template, nav_placement, nav_label, nav_order,
  content, publish_date, status, is_system,
  meta_title, meta_description, meta_keywords, og_image_id, canonical_url`

function values(input: PageInput): unknown[] {
  return [
    input.title,
    input.slug,
    input.template,
    input.navPlacement,
    input.navLabel || null,
    input.navOrder,
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

  await writeSections(id, input.sections)

  return get(id)
}

/** Columns where '' means "clear this" — see the note in categories.repo.ts. */
const NULLABLE = new Set([
  'publish_date', 'meta_title', 'meta_description', 'og_image_id', 'canonical_url',
  'nav_label',
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
    navPlacement: 'nav_placement',
    navLabel: 'nav_label',
    navOrder: 'nav_order',
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

  // Absent means "leave the blocks alone", which is what a patch that only
  // changes the status must do. An empty array is a real instruction: the
  // editor deleted every block.
  if (patch.sections !== undefined) await writeSections(id, patch.sections)

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
