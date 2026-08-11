import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, type Row } from '../../db/pool.js'
import { notFound, unprocessable } from '../../http/errors.js'
import {
  buildFilters,
  resolveSort,
  type ListParams,
  type ListResult,
} from '../../http/listParams.js'
import type { RedirectInput, RedirectPatch } from './redirects.schema.js'

const SORTABLE: Record<string, string> = {
  from: 'r.from_path',
  to: 'r.to_path',
  type: 'r.type',
  enabled: 'r.enabled',
  createdAt: 'r.created_at',
  updatedAt: 'r.updated_at',
}

const FILTERABLE: Record<string, string> = {
  type: 'r.type',
  enabled: 'r.enabled',
  createdAt: 'r.created_at',
  updatedAt: 'r.updated_at',
}

function toRedirect(row: Row): unknown {
  return {
    id: row.id,
    from: row.from_path,
    to: row.to_path,
    type: Number(row.type),
    enabled: Boolean(row.enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, FILTERABLE)
  const { column, dir } = resolveSort(params.sort, SORTABLE, { column: 'r.from_path', dir: 'asc' })

  const searchSql = params.search ? ' AND (r.from_path LIKE ? OR r.to_path LIKE ?)' : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? [like, like] : []

  const where = `WHERE 1=1${filterSql}${searchSql}`
  const whereParams = [...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM redirects r ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `SELECT r.* FROM redirects r ${where} ORDER BY ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  return {
    items: rows.map(toRedirect),
    total: Number(totalRow?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function get(id: string): Promise<unknown> {
  const row = await queryOne<Row>('SELECT * FROM redirects WHERE id = ? LIMIT 1', [id])
  if (!row) throw notFound('Redirect')
  return toRedirect(row)
}

/** Two rules for the same path would make which one wins arbitrary. */
async function assertFromFree(from: string, exceptId?: string): Promise<void> {
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM redirects WHERE from_path = ?${exceptId ? ' AND id <> ?' : ''} LIMIT 1`,
    exceptId ? [from, exceptId] : [from],
  )
  if (clash) throw unprocessable({ from: 'A redirect for this path already exists.' })
}

/**
 * Refuses a rule that would send a visitor back where they came from.
 *
 * Only one hop is checked. A longer chain is still possible, but catching the
 * common A→B, B→A case is worth the single query — the browser's own loop
 * detection is the backstop.
 */
async function assertNoImmediateLoop(from: string, to: string, exceptId?: string): Promise<void> {
  const back = await queryOne<{ id: string }>(
    `SELECT id FROM redirects
      WHERE from_path = ? AND to_path = ? AND enabled = 1${exceptId ? ' AND id <> ?' : ''}
      LIMIT 1`,
    exceptId ? [to, from, exceptId] : [to, from],
  )
  if (back) throw unprocessable({ to: 'That path already redirects back here, which would loop.' })
}

export async function create(input: RedirectInput): Promise<unknown> {
  await assertFromFree(input.from)
  await assertNoImmediateLoop(input.from, input.to)

  const id = randomUUID()
  await execute(
    `INSERT INTO redirects (id, from_path, to_path, type, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(3), NOW(3))`,
    [id, input.from, input.to, input.type, input.enabled ? 1 : 0],
  )

  return get(id)
}

export async function update(id: string, patch: RedirectPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT * FROM redirects WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Redirect')

  if (patch.from !== undefined) await assertFromFree(patch.from, id)

  // Either side of the pair may be the one changing, so check the result.
  const from = patch.from ?? (existing.from_path as string)
  const to = patch.to ?? (existing.to_path as string)
  if (patch.from !== undefined || patch.to !== undefined) {
    if (from === to) throw unprocessable({ to: 'A redirect cannot point at itself.' })
    await assertNoImmediateLoop(from, to, id)
  }

  const mapping: Record<string, string> = {
    from: 'from_path',
    to: 'to_path',
    type: 'type',
  }

  const assignments: string[] = []
  const params: unknown[] = []

  for (const [key, column] of Object.entries(mapping)) {
    const value = patch[key as keyof RedirectPatch]
    if (value === undefined) continue
    assignments.push(`${column} = ?`)
    params.push(value)
  }

  // A boolean needs its own branch: `false` is a value, not an absence.
  if (patch.enabled !== undefined) {
    assignments.push('enabled = ?')
    params.push(patch.enabled ? 1 : 0)
  }

  if (assignments.length > 0) {
    await execute(
      `UPDATE redirects SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
      [...params, id],
    )
  }

  return get(id)
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await query(`DELETE FROM redirects WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
}
