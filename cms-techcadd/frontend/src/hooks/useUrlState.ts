import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type UrlValue = string | number | string[] | undefined

/**
 * Reads and writes list state (page, search, sort, filters) through the query
 * string so every list view is shareable and survives back/forward.
 *
 * Writes `replace` history by default — a pushed entry per keystroke would make
 * the back button useless.
 */
export function useUrlState() {
  const [params, setParams] = useSearchParams()

  const get = useCallback((key: string) => params.get(key) ?? undefined, [params])

  const getAll = useCallback((key: string) => params.getAll(key), [params])

  const getNumber = useCallback(
    (key: string, fallback: number) => {
      const raw = params.get(key)
      const parsed = raw === null ? Number.NaN : Number(raw)
      return Number.isFinite(parsed) ? parsed : fallback
    },
    [params],
  )

  const set = useCallback(
    (patch: Record<string, UrlValue>, options?: { replace?: boolean; resetPage?: boolean }) => {
      const next = new URLSearchParams(params)

      for (const [key, value] of Object.entries(patch)) {
        next.delete(key)

        if (Array.isArray(value)) {
          value.forEach((entry) => next.append(key, entry))
        } else if (value !== undefined && value !== '') {
          next.set(key, String(value))
        }
      }

      // Changing a filter while on page 5 usually lands on an empty page.
      if (options?.resetPage !== false) next.delete('page')

      setParams(next, { replace: options?.replace ?? true })
    },
    [params, setParams],
  )

  const clear = useCallback(
    (keep: string[] = []) => {
      const next = new URLSearchParams()
      keep.forEach((key) => {
        params.getAll(key).forEach((value) => next.append(key, value))
      })
      setParams(next, { replace: true })
    },
    [params, setParams],
  )

  return useMemo(
    () => ({ params, get, getAll, getNumber, set, clear }),
    [params, get, getAll, getNumber, set, clear],
  )
}
