import type { Request } from 'express'

export interface ListParams {
  page: number
  pageSize: number
  search?: string
  sort?: { field: string; dir: 'asc' | 'desc' }
  filters: Record<string, string | string[]>
}

export interface ListResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

const MAX_PAGE_SIZE = 200
const RESERVED = new Set(['page', 'pageSize', 'q', 'search', 'sort', 'dir'])

function toInt(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

/**
 * Reads the query string the CMS produces. Everything here arrives from the
 * client, so nothing is trusted — `sort` in particular is only accepted after
 * the caller checks it against a whitelist (see `resolveSort`).
 */
export function parseListParams(req: Request): ListParams {
  const query = req.query as Record<string, unknown>

  const filters: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(query)) {
    if (RESERVED.has(key) || value === undefined || value === '') continue
    if (Array.isArray(value)) filters[key] = value.map(String)
    else filters[key] = String(value)
  }

  const sortField = query.sort ? String(query.sort) : undefined

  return {
    page: toInt(query.page, 1),
    // Capped so a client cannot ask for the whole table in one request.
    pageSize: Math.min(toInt(query.pageSize, 25), MAX_PAGE_SIZE),
    search: query.q ? String(query.q) : query.search ? String(query.search) : undefined,
    sort: sortField ? { field: sortField, dir: query.dir === 'desc' ? 'desc' : 'asc' } : undefined,
    filters,
  }
}

/**
 * Maps a client-supplied sort field to a real column, or falls back.
 *
 * This is the whole defence against `ORDER BY ${req.query.sort}` — column names
 * cannot be parameterised, so the only safe approach is to never interpolate a
 * value that did not come from this table.
 */
export function resolveSort(
  sort: ListParams['sort'],
  allowed: Record<string, string>,
  fallback: { column: string; dir: 'asc' | 'desc' },
): { column: string; dir: 'ASC' | 'DESC' } {
  const column = sort ? allowed[sort.field] : undefined
  if (!column) return { column: fallback.column, dir: fallback.dir === 'desc' ? 'DESC' : 'ASC' }
  return { column, dir: sort?.dir === 'desc' ? 'DESC' : 'ASC' }
}

/**
 * Builds a WHERE fragment from filters the caller has declared safe.
 *
 * `<field>From` / `<field>To` become range comparisons, matching the date-range
 * filter the enquiries list already sends.
 */
export function buildFilters(
  filters: Record<string, string | string[]>,
  allowed: Record<string, string>,
): { sql: string; params: unknown[] } {
  const clauses: string[] = []
  const params: unknown[] = []

  for (const [key, value] of Object.entries(filters)) {
    const range = /^(.+)(From|To)$/.exec(key)

    if (range) {
      const column = allowed[range[1] as string]
      if (!column) continue
      clauses.push(`${column} ${range[2] === 'From' ? '>=' : '<='} ?`)
      params.push(value)
      continue
    }

    const column = allowed[key]
    if (!column) continue

    if (Array.isArray(value)) {
      if (value.length === 0) continue
      clauses.push(`${column} IN (${value.map(() => '?').join(',')})`)
      params.push(...value)
    } else {
      clauses.push(`${column} = ?`)
      params.push(value)
    }
  }

  return { sql: clauses.length ? ` AND ${clauses.join(' AND ')}` : '', params }
}
