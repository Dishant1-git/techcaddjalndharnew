import { lazy } from 'react'

import { Lazy } from './lazyPages'

/**
 * Dev-only proving ground for the shared primitives.
 *
 * The `lazy()` call must sit inside the `DEV` branch, not just the route:
 * a top-level `import()` stays reachable and Vite emits the chunk anyway
 * (it shipped ~594 kB of editor code to production before this was moved).
 */
const Gallery = import.meta.env.DEV
  ? lazy(() => import('../pages/dev/PrimitivesGallery'))
  : null

export function DevGalleryRoute() {
  if (!Gallery) return null

  return (
    <Lazy>
      <Gallery />
    </Lazy>
  )
}
