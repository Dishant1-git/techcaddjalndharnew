import { randomUUID } from 'node:crypto'
import type { ExecuteValues, PoolConnection, ResultSetHeader } from 'mysql2/promise'

import { query, queryOne, transaction, type Row } from '../../db/pool.js'
import { notFound, unprocessable } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { BlogInput, BlogPatch } from './blogs.schema.js'

const SORTABLE: Record<string, string> = {
  title: 'b.title',
  slug: 'b.slug',
  status: 'b.status',
  publishDate: 'b.publish_date',
  createdAt: 'b.created_at',
  updatedAt: 'b.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'b.status',
  categoryId: 'b.category_id',
  authorId: 'b.author_id',
  publishDate: 'b.publish_date',
  createdAt: 'b.created_at',
  updatedAt: 'b.updated_at',
}

function toBlog(row: Row, tags: string[]): unknown {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    authorId: row.author_id ?? undefined,
    categoryId: row.category_id ?? undefined,
    tags,
    coverImage: row.cover_image_id
      ? { id: row.cover_image_id, url: row.cover_url, alt: row.cover_alt ?? '' }
      : undefined,
    excerpt: row.excerpt,
    body: row.body,
    publishDate: row.publish_date ?? undefined,
    seo: {
      metaTitle: row.meta_title ?? undefined,
      metaDescription: row.meta_description ?? undefined,
      keywords: (row.meta_keywords as string[] | null) ?? [],
      ogImage: row.og_image_id
        ? { id: row.og_image_id, url: row.og_url, alt: row.og_alt ?? '' }
        : undefined,
      canonicalUrl: row.canonical_url ?? undefined,
    },
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** One query for the whole page rather than one per post. */
async function loadTags(ids: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>()
  if (ids.length === 0) return map
  for (const id of ids) map.set(id, [])

  const rows = await query<Row>(
    `SELECT blog_id, tag FROM blog_tags
      WHERE blog_id IN (${ids.map(() => '?').join(',')}) ORDER BY position`,
    ids,
  )
  for (const row of rows) map.get(row.blog_id as string)?.push(row.tag as string)

  return map
}

const SELECT_BLOG = `
  SELECT b.*,
         c.url AS cover_url, c.alt AS cover_alt,
         o.url AS og_url,    o.alt AS og_alt
    FROM blogs b
    LEFT JOIN media c ON c.id = b.cover_image_id
    LEFT JOIN media o ON o.id = b.og_image_id
`

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'b.updated_at', dir: 'desc' })

  // Tags live in a child table, so the search has to reach into it — "react"
  // should find a post that only carries it as a tag.
  const searchSql = params.search
    ? ` AND (b.title LIKE ? OR b.slug LIKE ? OR b.excerpt LIKE ?
             OR EXISTS (SELECT 1 FROM blog_tags bt WHERE bt.blog_id = b.id AND bt.tag LIKE ?))`
    : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like, like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM blogs b ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `${SELECT_BLOG} ${where} ORDER BY ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  const tags = await loadTags(rows.map((row) => row.id as string))

  return {
    items: rows.map((row) => toBlog(row, tags.get(row.id as string) ?? [])),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`${SELECT_BLOG} WHERE b.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Post')

  const tags = await loadTags([id])
  return toBlog(row, tags.get(id) ?? [])
}

/** The slug is the public URL, so a clash would make one post unreachable. */
async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM blogs WHERE slug = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [slug, exceptId] : [slug],
  )
  if (clash) throw unprocessable({ slug: 'This slug is already in use.' })
}

async function writeTags(
  connection: PoolConnection,
  blogId: string,
  tags: string[],
): Promise<void> {
  await connection.execute<ResultSetHeader>('DELETE FROM blog_tags WHERE blog_id = ?', [blogId])

  // The primary key is (blog_id, tag), so a repeated tag would abort the
  // insert. Dropping duplicates matches what the tag input shows anyway.
  const seen = new Set<string>()
  let position = 0
  for (const tag of tags) {
    if (seen.has(tag)) continue
    seen.add(tag)
    await connection.execute<ResultSetHeader>(
      'INSERT INTO blog_tags (blog_id, tag, position) VALUES (?, ?, ?)',
      [blogId, tag, position++],
    )
  }
}

const COLUMNS = `title, slug, author_id, category_id, cover_image_id, excerpt, body,
  publish_date, status, meta_title, meta_description, meta_keywords, og_image_id, canonical_url`

function values(input: BlogInput, authorId: string | null): unknown[] {
  return [
    input.title,
    input.slug,
    authorId,
    input.categoryId || null,
    input.coverImage?.id ?? null,
    input.excerpt,
    input.body,
    // '' means "no date"; DATE columns reject it outright.
    input.publishDate || null,
    input.status,
    input.seo.metaTitle || null,
    input.seo.metaDescription || null,
    JSON.stringify(input.seo.keywords ?? []),
    input.seo.ogImage?.id ?? null,
    input.seo.canonicalUrl || null,
  ]
}

/**
 * `signedInUserId` is the fallback author.
 *
 * The form has no author field, so without this every post would be written by
 * nobody. An explicit authorId still wins, which keeps imports possible.
 */
export async function create(input: BlogInput, signedInUserId: string): Promise<unknown> {
  await assertSlugFree(input.slug)

  const id = randomUUID()
  await transaction(async (connection) => {
    const count = COLUMNS.split(',').length
    await connection.execute<ResultSetHeader>(
      `INSERT INTO blogs (id, ${COLUMNS}, created_at, updated_at)
       VALUES (?, ${Array(count).fill('?').join(', ')}, NOW(3), NOW(3))`,
      [id, ...values(input, input.authorId || signedInUserId)] as ExecuteValues,
    )
    await writeTags(connection, id, input.tags)
  })

  return get(id)
}

/** Columns where '' means "clear this" — see the note in categories.repo.ts. */
const NULLABLE = new Set([
  'author_id', 'category_id', 'cover_image_id', 'publish_date',
  'meta_title', 'meta_description', 'og_image_id', 'canonical_url',
])

export async function update(id: string, patch: BlogPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM blogs WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Post')
  if (patch.slug !== undefined) await assertSlugFree(patch.slug, id)

  const mapping: Record<string, string> = {
    title: 'title',
    slug: 'slug',
    authorId: 'author_id',
    categoryId: 'category_id',
    excerpt: 'excerpt',
    body: 'body',
    publishDate: 'publish_date',
    status: 'status',
  }

  await transaction(async (connection) => {
    const assignments: string[] = []
    const params: unknown[] = []

    for (const [key, column] of Object.entries(mapping)) {
      const value = patch[key as keyof BlogPatch]
      if (value === undefined) continue
      assignments.push(`${column} = ?`)
      params.push(value === '' && NULLABLE.has(column) ? null : value)
    }

    if (patch.coverImage !== undefined) {
      assignments.push('cover_image_id = ?')
      params.push(patch.coverImage?.id ?? null)
    }

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
      await connection.execute<ResultSetHeader>(
        `UPDATE blogs SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
        [...params, id] as ExecuteValues,
      )
    }

    if (patch.tags !== undefined) await writeTags(connection, id, patch.tags)
  })

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  // blog_tags cascades; nothing else points at a post.
  await query(`DELETE FROM blogs WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
}
