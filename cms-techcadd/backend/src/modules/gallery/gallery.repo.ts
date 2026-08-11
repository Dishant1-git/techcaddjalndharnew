import { randomUUID } from 'node:crypto'
import type { ExecuteValues, PoolConnection, ResultSetHeader } from 'mysql2/promise'

import { toStorableId } from '../../db/ids.js'
import { query, queryOne, transaction, type Row } from '../../db/pool.js'
import { notFound, unprocessable } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { AlbumInput, AlbumPatch, GalleryImageInput } from './gallery.schema.js'

const SORTABLE: Record<string, string> = {
  title: 'a.title',
  slug: 'a.slug',
  status: 'a.status',
  eventDate: 'a.event_date',
  createdAt: 'a.created_at',
  updatedAt: 'a.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'a.status',
  eventDate: 'a.event_date',
  createdAt: 'a.created_at',
  updatedAt: 'a.updated_at',
}

function toAlbum(row: Row, images: unknown[]): unknown {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover: row.cover_id
      ? { id: row.cover_id, url: row.cover_url, alt: row.cover_alt ?? '' }
      : undefined,
    eventDate: row.event_date ?? undefined,
    description: row.description ?? undefined,
    images,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** One query for every album on the page, not one per album. */
async function loadImages(albumIds: string[]): Promise<Map<string, unknown[]>> {
  const map = new Map<string, unknown[]>()
  if (albumIds.length === 0) return map
  for (const id of albumIds) map.set(id, [])

  const rows = await query<Row>(
    `SELECT gi.id, gi.album_id, gi.caption, gi.position,
            m.id AS media_id, m.url, m.alt, m.width, m.height
       FROM gallery_images gi
       JOIN media m ON m.id = gi.media_id
      WHERE gi.album_id IN (${albumIds.map(() => '?').join(',')})
      ORDER BY gi.position`,
    albumIds,
  )

  for (const row of rows) {
    map.get(row.album_id as string)?.push({
      id: row.id,
      media: {
        id: row.media_id,
        url: row.url,
        alt: row.alt ?? '',
        width: row.width === null ? undefined : Number(row.width),
        height: row.height === null ? undefined : Number(row.height),
      },
      caption: row.caption ?? undefined,
      order: Number(row.position),
    })
  }

  return map
}

const SELECT_ALBUM = `
  SELECT a.*, m.url AS cover_url, m.alt AS cover_alt
    FROM gallery_albums a
    LEFT JOIN media m ON m.id = a.cover_id
`

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'a.event_date', dir: 'desc' })

  const searchSql = params.search ? ' AND (a.title LIKE ? OR a.slug LIKE ?)' : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM gallery_albums a ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    // event_date is nullable, so undated albums would sort first on DESC.
    // Push them to the end and fall back to when they were created.
    `${SELECT_ALBUM} ${where}
      ORDER BY a.event_date IS NULL, ${column} ${dir}, a.created_at DESC
      LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  const images = await loadImages(rows.map((row) => row.id as string))

  return {
    items: rows.map((row) => toAlbum(row, images.get(row.id as string) ?? [])),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`${SELECT_ALBUM} WHERE a.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Album')

  const images = await loadImages([id])
  return toAlbum(row, images.get(id) ?? [])
}

/** The slug is the public URL, so a clash would make one album unreachable. */
async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM gallery_albums WHERE slug = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [slug, exceptId] : [slug],
  )
  if (clash) throw unprocessable({ slug: 'This slug is already in use.' })
}

/**
 * Replaces the album's images.
 *
 * Rewriting the whole set keeps this simple and makes reordering fall out for
 * free: `position` is the array index, so whatever order the client sent is
 * what comes back.
 */
async function writeImages(
  connection: PoolConnection,
  albumId: string,
  images: GalleryImageInput[],
): Promise<void> {
  await connection.execute<ResultSetHeader>('DELETE FROM gallery_images WHERE album_id = ?', [
    albumId,
  ])

  for (const [index, image] of images.entries()) {
    await connection.execute<ResultSetHeader>(
      `INSERT INTO gallery_images (id, album_id, media_id, caption, position)
       VALUES (?, ?, ?, ?, ?)`,
      [toStorableId(image.id), albumId, image.media.id, image.caption || null, index] as ExecuteValues,
    )
  }
}

const COLUMNS = `title, slug, cover_id, event_date, description, status`

function values(input: AlbumInput): unknown[] {
  return [
    input.title,
    input.slug,
    input.cover?.id ?? null,
    // '' means "no date"; DATE columns reject it outright.
    input.eventDate || null,
    input.description || null,
    input.status,
  ]
}

export async function create(input: AlbumInput): Promise<unknown> {
  await assertSlugFree(input.slug)

  const id = randomUUID()
  await transaction(async (connection) => {
    const count = COLUMNS.split(',').length
    await connection.execute<ResultSetHeader>(
      `INSERT INTO gallery_albums (id, ${COLUMNS}, created_at, updated_at)
       VALUES (?, ${Array(count).fill('?').join(', ')}, NOW(3), NOW(3))`,
      [id, ...values(input)] as ExecuteValues,
    )
    await writeImages(connection, id, input.images)
  })

  return get(id)
}

/** Columns where '' means "clear this" — see the note in faculty.repo.ts. */
const NULLABLE = new Set(['cover_id', 'event_date', 'description'])

export async function update(id: string, patch: AlbumPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM gallery_albums WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Album')
  if (patch.slug !== undefined) await assertSlugFree(patch.slug, id)

  const mapping: Record<string, string> = {
    title: 'title',
    slug: 'slug',
    eventDate: 'event_date',
    description: 'description',
    status: 'status',
  }

  await transaction(async (connection) => {
    const assignments: string[] = []
    const params: unknown[] = []

    for (const [key, column] of Object.entries(mapping)) {
      const value = patch[key as keyof AlbumPatch]
      if (value === undefined) continue
      assignments.push(`${column} = ?`)
      params.push(value === '' && NULLABLE.has(column) ? null : value)
    }

    if (patch.cover !== undefined) {
      assignments.push('cover_id = ?')
      params.push(patch.cover?.id ?? null)
    }

    if (assignments.length > 0) {
      await connection.execute<ResultSetHeader>(
        `UPDATE gallery_albums SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
        [...params, id] as ExecuteValues,
      )
    }

    // Only rewrite the images when the caller actually sent them — a status
    // toggle must not empty the album.
    if (patch.images !== undefined) await writeImages(connection, id, patch.images)
  })

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  // gallery_images cascades; the media files themselves are left alone.
  await query(`DELETE FROM gallery_albums WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
}
