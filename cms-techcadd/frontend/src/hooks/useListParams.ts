import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_PAGE_SIZE, type ListParams, type SortDirection } from '../api'
import type { SortState } from '../components/data/DataTable'
import { useDebounce } from './useDebounce'
import { useUrlState } from './useUrlState'

interface UseListParamsOptions {
  /** Query-string keys this list treats as filters. */
  filterKeys?: readonly string[]
  defaultSort?: SortState
  defaultPageSize?: number
}

/**
 * Turns the query string into `ListParams` and back. Every list view uses this
 * so page, search, sort and filters stay shareable and survive back/forward.
 */
export function useListParams({
  filterKeys = [],
  defaultSort,
  defaultPageSize = DEFAULT_PAGE_SIZE,
}: UseListParamsOptions = {}) {
  const url = useUrlState()

  const page = url.getNumber('page', 1)
  const pageSize = url.getNumber('pageSize', defaultPageSize)
  const committedSearch = url.get('q') ?? ''

  // The input stays responsive while the query waits for the user to pause.
  const [searchDraft, setSearchDraft] = useState(committedSearch)
  const debouncedSearch = useDebounce(searchDraft, 300)

  useEffect(() => {
    if (debouncedSearch !== committedSearch) {
      url.set({ q: debouncedSearch || undefined })
    }
  }, [debouncedSearch, committedSearch, url])

  // When the URL changes from elsewhere (back button, a cleared filter), adjust
  // the draft during render rather than in an effect — an effect here would
  // render once with the stale value and then cascade a second render.
  const [lastCommitted, setLastCommitted] = useState(committedSearch)
  if (lastCommitted !== committedSearch) {
    setLastCommitted(committedSearch)
    setSearchDraft(committedSearch)
  }

  const sortField = url.get('sort') ?? defaultSort?.field
  const sortDir: SortDirection = url.get('dir') === 'desc' ? 'desc' : 'asc'
  const sort = useMemo<SortState | undefined>(
    () => (sortField ? { field: sortField, dir: sortDir } : undefined),
    [sortField, sortDir],
  )

  const filters = useMemo(() => {
    const entries: Record<string, string | undefined> = {}
    for (const key of filterKeys) entries[key] = url.get(key)
    return entries
    // `url.get` is stable for a given search string.
  }, [filterKeys, url])

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const params = useMemo<ListParams>(
    () => ({
      page,
      pageSize,
      search: committedSearch || undefined,
      sort: sort ? { field: sort.field, dir: sort.dir } : undefined,
      filters,
    }),
    [page, pageSize, committedSearch, sort, filters],
  )

  return {
    params,
    page,
    pageSize,
    search: searchDraft,
    sort,
    filters,
    activeFilterCount,

    setSearch: setSearchDraft,
    setPage: (next: number) => url.set({ page: next }, { resetPage: false }),
    setPageSize: (next: number) => url.set({ pageSize: next }),
    setSort: (next: SortState) => url.set({ sort: next.field, dir: next.dir }),
    setFilter: (key: string, value: string | undefined) => url.set({ [key]: value }),
    clearFilters: () => url.clear(),
  }
}
