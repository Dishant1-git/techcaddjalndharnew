import { useSyncExternalStore } from 'react'

/** Reactive `matchMedia`. Pass a raw query, e.g. `'(min-width: 768px)'`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    // No SSR here, but the server snapshot is required by the hook contract.
    () => false,
  )
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
