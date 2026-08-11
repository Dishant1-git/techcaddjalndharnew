import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { notFound } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { BannerInput, BannerPatch } from './banners.schema.js'

const SORTABLE: Record<string, string> = {
  title: 'b.title',
  placement: 'b.placement',
  order: 'b.sort_order',
  status: 'b.status',
  startsAt: 'b.starts_at',
  endsAt: 'b.ends_at',
  createdAt: 'b.created_at',
  updatedAt: 'b.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'b.status',
  placement: 'b.placement',
  startsAt: 'b.starts_at',
  endsAt: 'b.ends_at',
  createdAt: 'b.created_at',
  updatedAt: 'b.updated_at',
}

function toBanner(row: Row): unknown {
  return {
    id: row.id,
    title: row.title,
    desktopImage: row.desktop_image_id
      ? { id: row.desktop_image_id, url: row.desktop_url, alt: row.desktop_alt ?? '' }
      : undefined,
    mobileImage: row.mobile_image_id
      ? { id: row.mobile_image_id, url: row.mobile_url, alt: row.mobile_alt ?? '' }
      : undefined,
    altText: row.alt_text,
    linkUrl: row.link_url ?? undefined,
    ctaText: row.cta_text ?? undefined,
    placement: row.placement,
    order: Number(row.sort_order),
    startsAt: row.starts_at ?? undefined,
    endsAt: row.ends_at ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const SELECT_BANNER = `
  SELECT b.*,
         d.url AS desktop_url, d.alt AS desktop_alt,
         m.url AS mobile_url,  m.alt AS mobile_alt
    FROM banners b
    LEFT JOIN media d ON d.id = b.desktop_image_id
    LEFT JOIN media m ON m.id = b.mobile_image_id
`

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  // Banners are hand-ordered within a placement, so that is the natural order.
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'b.sort_order', dir: 'asc' })

  const searchSql = params.search ? ' AND (b.title LIKE ? OR b.alt_text LIKE ?)' : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM banners b ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `${SELECT_BANNER} ${where} ORDER BY ${column} ${dir}, b.created_at ASC LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  return {
    items: rows.map(toBanner),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>(`${SELECT_BANNER} WHERE b.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Banner')
  return toBanner(row)
}

const COLUMNS = `title, desktop_image_id, mobile_image_id, alt_text, link_url, cta_text,
  placement, sort_order, starts_at, ends_at, status`

function values(input: BannerInput): unknown[] {
  return [
    input.title,
    input.desktopImage?.id ?? null,
    input.mobileImage?.id ?? null,
    input.altText,
    input.linkUrl || null,
    input.ctaText || null,
    input.placement,
    input.order,
    // '' means "no date"; DATE columns reject it outright.
    input.startsAt || null,
    input.endsAt || null,
    input.status,
  ]
}

export async function create(input: BannerInput): Promise<unknown> {
  const id = randomUUID()
  const count = COLUMNS.split(',').length
  await execute(
    `INSERT INTO banners (id, ${COLUMNS}, created_at, updated_at)
     VALUES (?, ${Array(count).fill('?').join(', ')}, NOW(3), NOW(3))`,
    [id, ...values(input)],
  )
  return get(id)
}

/** Columns where '' means "clear this" — see the note in faculty.repo.ts. */
const NULLABLE = new Set([
  'desktop_image_id', 'mobile_image_id', 'link_url', 'cta_text', 'starts_at', 'ends_at',
])

export async function update(id: string, patch: BannerPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM banners WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Banner')

  const mapping: Record<string, string> = {
    title: 'title',
    altText: 'alt_text',
    linkUrl: 'link_url',
    ctaText: 'cta_text',
    placement: 'placement',
    order: 'sort_order',
    startsAt: 'starts_at',
    endsAt: 'ends_at',
    status: 'status',
  }

  const assignments: string[] = []
  const params: unknown[] = []

  for (const [key, column] of Object.entries(mapping)) {
    const value = patch[key as keyof BannerPatch]
    if (value === undefined) continue
    assignments.push(`${column} = ?`)
    params.push(value === '' && NULLABLE.has(column) ? null : value)
  }

  if (patch.desktopImage !== undefined) {
    assignments.push('desktop_image_id = ?')
    params.push(patch.desktopImage?.id ?? null)
  }
  if (patch.mobileImage !== undefined) {
    assignments.push('mobile_image_id = ?')
    params.push(patch.mobileImage?.id ?? null)
  }

  if (assignments.length > 0) {
    await execute(
      `UPDATE banners SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
      [...params, id],
    )
  }

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  // Nothing references a banner; deleting one is always safe.
  await query(`DELETE FROM banners WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
}
