import { createId } from '../../lib/id'
import { ApiError, type ListParams, type ListResult, type Resource } from '../types'
import { simulateNetwork } from './latency'
import { readCollection, writeCollection, type CollectionKey, type Database } from './store'

interface BaseRecord {
  id: string
  createdAt: string
  updatedAt: string
}

export interface MockResourceConfig<T> {
  key: CollectionKey
  /** Human label used in error messages, e.g. "Course". */
  label: string
  idPrefix: string
  /** Fields scanned by the free-text search box. */
  searchFields: (keyof T)[]
  defaultSort?: { field: keyof T & string; dir: 'asc' | 'desc' }
  /** Rejects a create/update before it is written, e.g. duplicate slugs. */
  validate?: (input: Partial<T>, existing: T[], id?: string) => Record<string, string> | undefined
}

function matchesSearch<T>(item: T, fields: (keyof T)[], search: string): boolean {
  const needle = search.trim().toLowerCase()
  if (!needle) return true

  return fields.some((field) => {
    const value = item[field]
    if (typeof value === 'string') return value.toLowerCase().includes(needle)
    if (Array.isArray(value)) {
      return value.some((entry) => typeof entry === 'string' && entry.toLowerCase().includes(needle))
    }
    return false
  })
}

/**
 * Range filters are expressed as `<field>From` / `<field>To`, e.g. `createdAtFrom`.
 * Returns null when the key is not a range against a field the record has.
 */
function matchesRange<T extends Record<string, unknown>>(
  item: T,
  field: string,
  expected: string | string[],
): boolean | null {
  const match = /^(.+)(From|To)$/.exec(field)
  if (!match) return null

  const [, base, bound] = match
  if (!(base in item)) return null

  const raw = String(item[base] ?? '')
  if (!raw) return false

  const limit = String(Array.isArray(expected) ? expected[0] : expected)
  // A date-only bound compares against the date part of an ISO timestamp,
  // otherwise "…T10:00:00Z" <= "2026-08-08" is wrongly false.
  const value = limit.length === 10 ? raw.slice(0, 10) : raw

  return bound === 'From' ? value >= limit : value <= limit
}

function matchesFilters<T extends Record<string, unknown>>(
  item: T,
  filters: ListParams['filters'],
): boolean {
  if (!filters) return true

  return Object.entries(filters).every(([field, expected]) => {
    if (expected === undefined || expected === '') return true

    const range = matchesRange(item, field, expected)
    if (range !== null) return range

    const actual = item[field]
    const wanted = Array.isArray(expected) ? expected : [expected]
    if (wanted.length === 0) return true

    // Array-valued fields (branchIds, tags) match if any entry is wanted.
    if (Array.isArray(actual)) {
      return actual.some((entry) => wanted.includes(String(entry)))
    }
    return wanted.includes(String(actual))
  })
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a ?? '').localeCompare(String(b ?? ''), 'en', { numeric: true })
}

/**
 * Builds a full CRUD resource backed by the localStorage database. All 13
 * modules share this implementation so pagination, search, sorting and
 * filtering behave identically everywhere.
 */
export function createMockResource<T extends BaseRecord, TCreate, TUpdate = Partial<TCreate>>(
  config: MockResourceConfig<T>,
): Resource<T, TCreate, TUpdate> {
  const read = () => readCollection(config.key) as unknown as T[]
  const write = (items: T[]) => writeCollection(config.key, items as unknown as Database[CollectionKey])

  function requireRecord(items: T[], id: string): T {
    const found = items.find((item) => item.id === id)
    if (!found) throw new ApiError(404, `${config.label} not found.`)
    return found
  }

  return {
    async list(params: ListParams): Promise<ListResult<T>> {
      await simulateNetwork()

      const all = read()
      const filtered = all
        .filter((item) => matchesSearch(item, config.searchFields, params.search ?? ''))
        .filter((item) => matchesFilters(item as unknown as Record<string, unknown>, params.filters))

      const sort = params.sort ?? config.defaultSort
      if (sort) {
        const direction = sort.dir === 'desc' ? -1 : 1
        filtered.sort(
          (a, b) =>
            direction *
            compare(
              (a as unknown as Record<string, unknown>)[sort.field],
              (b as unknown as Record<string, unknown>)[sort.field],
            ),
        )
      }

      const page = Math.max(1, params.page)
      const start = (page - 1) * params.pageSize

      return {
        items: filtered.slice(start, start + params.pageSize),
        total: filtered.length,
        page,
        pageSize: params.pageSize,
      }
    },

    async get(id: string): Promise<T> {
      await simulateNetwork()
      return requireRecord(read(), id)
    },

    async create(input: TCreate): Promise<T> {
      await simulateNetwork()

      const items = read()
      const fieldErrors = config.validate?.(input as Partial<T>, items)
      if (fieldErrors) throw new ApiError(422, 'Please fix the highlighted fields.', fieldErrors)

      const now = new Date().toISOString()
      const record = {
        ...(input as object),
        id: createId(config.idPrefix),
        createdAt: now,
        updatedAt: now,
      } as T

      write([record, ...items])
      return record
    },

    async update(id: string, input: TUpdate): Promise<T> {
      await simulateNetwork()

      const items = read()
      requireRecord(items, id)

      const fieldErrors = config.validate?.(input as Partial<T>, items, id)
      if (fieldErrors) throw new ApiError(422, 'Please fix the highlighted fields.', fieldErrors)

      let updated!: T
      const next = items.map((item) => {
        if (item.id !== id) return item
        updated = { ...item, ...(input as object), updatedAt: new Date().toISOString() } as T
        return updated
      })

      write(next)
      return updated
    },

    async remove(ids: string[]): Promise<void> {
      await simulateNetwork()
      const removing = new Set(ids)
      write(read().filter((item) => !removing.has(item.id)))
    },
  }
}
