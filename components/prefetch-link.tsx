"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, type ComponentProps } from "react"

type Props = Omit<ComponentProps<typeof Link>, "prefetch">

/**
 * A Link that warms its route on intent rather than on sight.
 *
 * `<Link>` defaults to prefetching every link the moment it enters the
 * viewport. On a mega menu of ~26 courses, or an index of 35 cards, that fires
 * a wave of RSC requests nobody asked for, so those lists used
 * `prefetch={false}`. But `prefetch={false}` does not mean "prefetch later" —
 * next/dist/client/app-dir/link.js bails out of its own onMouseEnter handler
 * whenever the prop is false, so those links were never prefetched at all and
 * every click paid the full round trip before the page could render.
 *
 * This keeps viewport prefetching off and puts it back on hover, focus and
 * touch, where it costs one request for the route the user is actually heading
 * to. `router.prefetch()` de-dupes internally, but the ref stops us queuing
 * work on every mousemove-triggered re-enter.
 *
 * Prefetching is disabled entirely in development (createPrefetchURL returns
 * null before it does anything), so the win only shows in a production build.
 */
export function PrefetchLink({
  href,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...rest
}: Props) {
  const router = useRouter()
  const warmed = useRef(false)

  const warm = () => {
    if (warmed.current) return
    warmed.current = true
    // Objects are valid hrefs for Link but not for router.prefetch, and none of
    // our lists use them — skip rather than throw if that ever changes.
    if (typeof href === "string") router.prefetch(href)
  }

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        warm()
        onMouseEnter?.(e)
      }}
      onFocus={(e) => {
        warm()
        onFocus?.(e)
      }}
      onTouchStart={(e) => {
        warm()
        onTouchStart?.(e)
      }}
      {...rest}
    />
  )
}
