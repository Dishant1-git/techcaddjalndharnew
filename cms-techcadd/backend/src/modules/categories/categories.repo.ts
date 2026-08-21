import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { badRequest, notFound, unprocessable } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { CategoryInput, CategoryPatch } from './categories.schema.js'

/** Whitelists — nothing from the query string reaches SQL directly. */
const SORTABLE: Record<string, string> = {
  name: 'name',
  order: 'sort_order',
  status: 'status',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'status',
  parentId: 'parent_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}

function toCategory(row: Row): unknown {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id ?? undefined,
    icon: row.icon ?? undefined,
    accentColor: row.accent_color ?? undefined,
    description: row.description ?? undefined,
    order: Number(row.sort_order),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'sort_order', dir: 'asc' })

  // LIKE rather than FULLTEXT here: a category list is dozens of rows, not
  // thousands, so the index would cost more to maintain than it saves.
  const searchSql = params.search ? ' AND (name LIKE ? OR slug LIKE ? OR description LIKE ?)' : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM categories ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `SELECT * FROM categories ${where} ORDER BY ${column} ${dir}, name ASC LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  return {
    items: rows.map(toCategory),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>('SELECT * FROM categories WHERE id = ? LIMIT 1', [id])
  if (!row) throw notFound('Category')
  return toCategory(row)
}

async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM categories WHERE slug = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [slug, exceptId] : [slug],
  )
  if (clash) throw unprocessable({ slug: 'This slug is already in use.' })
}

/**
 * Nesting is capped at two levels, and a category can never be its own parent.
 * Both would otherwise produce a tree the UI cannot render.
 */
async function assertParentValid(parentId: string | undefined, id?: string): Promise<void> {
  if (!parentId) return
  if (parentId === id) throw unprocessable({ parentId: 'A category cannot be its own parent.' })

  const parent = await queryOne<{ parent_id: string | null }>(
    'SELECT parent_id FROM categories WHERE id = ? LIMIT 1',
    [parentId],
  )
  if (!parent) throw unprocessable({ parentId: 'That parent category no longer exists.' })
  if (parent.parent_id) {
    throw unprocessable({ parentId: 'Categories can only be nested two levels deep.' })
  }
}

const COLUMNS = 'name, slug, parent_id, icon, accent_color, description, sort_order, status'

function values(input: CategoryInput): unknown[] {
  return [
    input.name,
    input.slug,
    input.parentId || null,
    input.icon ?? null,
    input.accentColor ?? null,
    input.description ?? null,
    input.order,
    input.status,
  ]
}

export async function create(input: CategoryInput): Promise<unknown> {
  await assertSlugFree(input.slug)
  await assertParentValid(input.parentId)

  const id = randomUUID()
  await execute(
    `INSERT INTO categories (id, ${COLUMNS}, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
    [id, ...values(input)],
  )

  return get(id)
}

/**
 * Accepts a partial body: the drag-reorder action sends `{ order }` alone, so
 * requiring the whole record would make reordering rewrite every field.
 */
/** Columns where '' means "clear this" — see the note in categories.repo.ts. */
const NULLABLE = new Set(['parent_id', 'icon', 'accent_color', 'description'])

export async function update(id: string, patch: CategoryPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT * FROM categories WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Category')

  if (patch.slug !== undefined) await assertSlugFree(patch.slug, id)
  if (patch.parentId !== undefined) await assertParentValid(patch.parentId, id)

  const mapping: Record<string, string> = {
    name: 'name',
    slug: 'slug',
    parentId: 'parent_id',
    icon: 'icon',
    accentColor: 'accent_color',
    description: 'description',
    order: 'sort_order',
    status: 'status',
  }

  const assignments: string[] = []
  const params: unknown[] = []

  for (const [key, column] of Object.entries(mapping)) {
    const value = patch[key as keyof CategoryPatch]
    if (value === undefined) continue
    assignments.push(`${column} = ?`)
    params.push(value === '' && NULLABLE.has(column) ? null : value)
  }

  if (assignments.length === 0) return toCategory(existing)

  await execute(
    `UPDATE categories SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
    [...params, id],
  )

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return

  const placeholders = ids.map(() => '?').join(',')

  // Check before deleting so the message names what is blocking it. The foreign
  // keys are RESTRICT, so the database would refuse anyway — but with a generic
  // error the UI could not tell the user *why*.
  const [courses] = await query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM courses WHERE category_id IN (${placeholders})`,
    ids,
  )
  if ((courses?.n ?? 0) > 0) {
    throw badRequest(
      `${courses?.n} course${courses?.n === 1 ? ' still uses' : 's still use'} this category. Move ${courses?.n === 1 ? 'it' : 'them'} first.`,
    )
  }

  const [children] = await query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM categories WHERE parent_id IN (${placeholders})`,
    ids,
  )
  if ((children?.n ?? 0) > 0) {
    throw badRequest(
      `${children?.n} sub-categor${children?.n === 1 ? 'y still sits' : 'ies still sit'} under this. Move ${children?.n === 1 ? 'it' : 'them'} first.`,
    )
  }

  await query(`DELETE FROM categories WHERE id IN (${placeholders})`, ids)
}
