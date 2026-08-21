import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { notFound } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { MediaPatch } from './media.schema.js'
import { removeStoredFile } from './storage.js'

const SORTABLE: Record<string, string> = {
  filename: 'm.filename',
  size: 'm.size',
  mimeType: 'm.mime_type',
  folder: 'm.folder',
  createdAt: 'm.created_at',
  updatedAt: 'm.updated_at',
}

const FILTERABLE: Record<string, string> = {
  folder: 'm.folder',
  mimeType: 'm.mime_type',
  createdAt: 'm.created_at',
  updatedAt: 'm.updated_at',
}

function toMedia(row: Row): unknown {
  return {
    id: row.id,
    filename: row.filename,
    url: row.url,
    mimeType: row.mime_type,
    size: Number(row.size),
    width: row.width === null ? undefined : Number(row.width),
    height: row.height === null ? undefined : Number(row.height),
    alt: row.alt,
    folder: row.folder ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'm.created_at', dir: 'desc' })

  const searchSql = params.search
    ? ' AND (m.filename LIKE ? OR m.alt LIKE ? OR m.folder LIKE ?)'
    : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM media m ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `SELECT m.* FROM media m ${where} ORDER BY ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  // How many records show each file, so the library can say "used on 3 pages"
  // beside it and warn before a delete blanks them. One extra query per
  // referencing column for the page being viewed, not for the whole table.
  const counts = await usage(rows.map((row) => String(row.id)))

  return {
    items: rows.map((row) => ({
      ...(toMedia(row) as Record<string, unknown>),
      usageCount: counts.get(String(row.id)) ?? 0,
    })),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>('SELECT * FROM media WHERE id = ? LIMIT 1', [id])
  if (!row) throw notFound('File')
  return toMedia(row)
}

export interface StoredFile {
  filename: string
  url: string
  mimeType: string
  size: number
  width?: number
  height?: number
  folder?: string
}

/** Records a file that has already been written to disk. */
export async function recordUpload(file: StoredFile): Promise<unknown> {
  const id = randomUUID()
  await execute(
    `INSERT INTO media (id, filename, url, mime_type, size, width, height, alt, folder, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, NOW(3), NOW(3))`,
    [
      id,
      file.filename,
      file.url,
      file.mimeType,
      file.size,
      file.width ?? null,
      file.height ?? null,
      file.folder || null,
    ],
  )
  return get(id)
}

/** Only the metadata is editable — the bytes are immutable once uploaded. */
export async function update(id: string, patch: MediaPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM media WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('File')

  const mapping: Record<string, string> = {
    filename: 'filename',
    alt: 'alt',
    folder: 'folder',
  }

  const assignments: string[] = []
  const params: unknown[] = []

  for (const [key, column] of Object.entries(mapping)) {
    const value = patch[key as keyof MediaPatch]
    if (value === undefined) continue
    assignments.push(`${column} = ?`)
    // folder is nullable — '' means "no folder". alt is NOT NULL and '' is a
    // legitimate value for a decorative image.
    params.push(value === '' && column === 'folder' ? null : value)
  }

  if (assignments.length > 0) {
    await execute(
      `UPDATE media SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
      [...params, id],
    )
  }

  return get(id)
}

/**
 * Deletes files and the rows that point at them.
 *
 * The database goes first: several tables reference media, and the foreign
 * keys decide what happens to them. If that fails there is nothing to undo.
 * Only once the rows are gone are the bytes removed, so a failure can never
 * leave a row pointing at a file that no longer exists.
 */
/**
 * Every column that points at a media row, read from the schema itself.
 *
 * Derived from the foreign keys rather than listed by hand: seventeen columns
 * reference media today, across courses, pages, blogs, banners, settings and
 * the two block tables. A hand-kept list would be wrong the first time a table
 * gained an image, and wrong in the direction that matters — reporting a file
 * as unused while something still shows it.
 *
 * Cached for the life of the process: foreign keys only change with a
 * migration, and this would otherwise run on every media page load.
 */
let referencingColumns: { table: string; column: string }[] | undefined

async function mediaReferences(): Promise<{ table: string; column: string }[]> {
  if (referencingColumns) return referencingColumns

  const rows = await query<Row>(
    `SELECT TABLE_NAME AS t, COLUMN_NAME AS c
       FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = 'media'`,
  )

  referencingColumns = rows.map((row) => ({ table: String(row.t), column: String(row.c) }))
  return referencingColumns
}

/**
 * How many records use each of these media ids.
 *
 * Deleting an image cannot be undone — the row goes and so does the file on
 * disk — and every reference to it is ON DELETE SET NULL, so the picture simply
 * disappears from whatever was showing it with nothing to say why. Counting
 * first is what lets the CMS warn before that happens rather than after.
 */
export async function usage(ids: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>(ids.map((id) => [id, 0]))
  if (ids.length === 0) return counts

  const placeholders = ids.map(() => '?').join(',')

  for (const { table, column } of await mediaReferences()) {
    // Identifiers come from information_schema, not from a request, so they
    // cannot carry anything a caller chose.
    const rows = await query<Row>(
      'SELECT `' + column + '` AS id, COUNT(*) AS n FROM `' + table + '`' +
        ' WHERE `' + column + '` IN (' + placeholders + ') GROUP BY `' + column + '`',
      ids,
    )

    for (const row of rows) {
      const id = String(row.id)
      counts.set(id, (counts.get(id) ?? 0) + Number(row.n))
    }
  }

  return counts
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const placeholders = ids.map(() => '?').join(',')

  const rows = await query<{ url: string }>(
    `SELECT url FROM media WHERE id IN (${placeholders})`,
    ids,
  )

  await execute(`DELETE FROM media WHERE id IN (${placeholders})`, ids)

  await Promise.all(rows.map((row) => removeStoredFile(row.url)))
}
