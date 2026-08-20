"use client"

import { useEffect, useState } from "react"

/**
 * Decides when — and whether — a decorative background loop may download.
 *
 * The two hero loops are 5.5 MB and 2.3 MB. They autoplay, so the browser
 * streams the whole file, and they were doing it during first paint while
 * competing with the JS and the fonts for bandwidth. None of that buys much:
 * both are blurred, scaled past the edges and sitting under a scrim at 80–85%
 * opacity, and both heroes are designed to look correct on their flat `ink`
 * panel with no video at all.
 *
 * So the source is withheld until three things are true:
 *
 *   1. the page has finished loading, so the video never competes with the
 *      content someone actually came for;
 *   2. the element is near the viewport, which keeps the About-page loops off
 *      the wire entirely for anyone who never scrolls to them;
 *   3. the visitor has not asked to save data, and is not on a connection that
 *      would spend a long time on a decoration.
 *
 * Returns true once the video may load. Never returns true on the server, so
 * the markup is identical on both sides and hydration is unaffected.
 */
export function useDeferredVideo(
  ref: React.RefObject<HTMLVideoElement | null>,
) {
  const [allowed, setAllowed] = useState(false)

  // Autoplay does not necessarily restart once a src arrives this late, so the
  // element gets an explicit nudge. Rejection is expected and ignorable: a
  // browser refusing to autoplay a decoration is not an error worth surfacing.
  useEffect(() => {
    if (!allowed) return
    const video = ref.current
    if (!video) return
    void video.play().catch(() => {})
  }, [allowed, ref])

  useEffect(() => {
    // --- Would loading this be rude? ---
    type Conn = { saveData?: boolean; effectiveType?: string }
    const conn = (navigator as Navigator & { connection?: Conn }).connection
    const reducedData =
      window.matchMedia?.("(prefers-reduced-data: reduce)").matches ?? false

    if (conn?.saveData || reducedData) return
    if (conn?.effectiveType && /(^|-)(slow-)?2g$/.test(conn.effectiveType)) return

    /*
      Phones do not get it at all.

      This is the change with the most real-world effect and the least visible
      one. The loop is blurred, scaled past the edges and under a scrim at
      80–85% opacity, so on a 390px screen there is almost nothing of it left
      to see, while the download is the same several megabytes, on the
      connection least able to afford it. The flat panel underneath is the
      design's own fallback, not a degraded version of it.
    */
    if (window.matchMedia("(max-width: 1023px)").matches) return

    let cancelled = false
    let observer: IntersectionObserver | undefined

    const arm = () => {
      if (cancelled) return
      const el = ref.current
      if (!el) return

      if (!("IntersectionObserver" in window)) {
        setAllowed(true)
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return
          setAllowed(true)
          observer?.disconnect()
        },
        // A screen of lead time, so a loop that is about to scroll into view
        // has already started buffering by the time it arrives.
        { rootMargin: "100% 0px" },
      )
      observer.observe(el)
    }

    // Wait for load: a hero loop is never the thing worth blocking on.
    if (document.readyState === "complete") {
      arm()
    } else {
      window.addEventListener("load", arm, { once: true })
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      window.removeEventListener("load", arm)
    }
  }, [ref])

  return allowed
}
