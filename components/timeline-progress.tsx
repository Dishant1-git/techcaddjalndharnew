"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/**
 * How much of the viewport is trimmed off the top and bottom to leave the band
 * a milestone counts as "current" inside. 0.38 leaves the middle ~24%, which is
 * tall enough that one milestone is almost always lit and short enough that two
 * rarely are.
 */
const BAND = 0.38

/**
 * Scroll position → timeline state.
 *
 * Every milestone carries `data-timeline-item`, and this sets `data-state` on
 * it to `upcoming`, `current` or `passed` as it crosses the band. All the
 * styling lives in globals.css against those values, so the timeline itself
 * stays a Server Component — the same division ScrollReveal uses.
 *
 * Unlike ScrollReveal this is a scrub, not a one-shot: nothing is ever
 * unobserved, so scrolling back up returns milestones to `upcoming` and the
 * cycle repeats in both directions.
 *
 * `timeline-ready` on <html> gates the dimmed state in CSS. The markup renders
 * every milestone lit, so if this component never runs the list is plain and
 * fully readable rather than stuck behind a blur.
 */
export function TimelineProgress() {
  // Same reasoning as ScrollReveal: the layout does not remount on client-side
  // navigation, so without this the next page's items are never observed.
  const pathname = usePathname()

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-timeline-item]")
    if (!targets.length) return

    const root = document.documentElement
    root.classList.add("timeline-ready")

    const done = () => {
      root.classList.remove("timeline-ready")
    }

    // Without IntersectionObserver every milestone reads as reached. That is
    // the legible fallback — the alternative leaves the whole list blurred.
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => {
        el.dataset.state = "passed"
      })
      return done
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement

          if (entry.isIntersecting) {
            el.dataset.state = "current"
            continue
          }

          /*
            Which side it left on. IntersectionObserver reports only whether an
            element intersects, not where it went, so the two are told apart by
            comparing the element against the top edge of the band.

            `rootBounds` is null in some cross-origin cases, so the edge is
            recomputed from the viewport rather than trusted blindly.
          */
          const bandTop = entry.rootBounds?.top ?? window.innerHeight * BAND
          el.dataset.state =
            entry.boundingClientRect.top < bandTop ? "passed" : "upcoming"
        }
      },
      /*
        The milestones scroll inside their own panel on large screens. The root
        stays the viewport regardless: IntersectionObserver already accounts for
        clipping by an intervening scroll container, and the panel is a full
        viewport tall, so its middle and the viewport's middle coincide. Using
        the panel as root would break the small-screen case, where it is not a
        scroll container at all and every item would intersect permanently.
      */
      { rootMargin: `-${BAND * 100}% 0px -${BAND * 100}% 0px`, threshold: 0 },
    )

    targets.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      done()
    }
  }, [pathname])

  return null
}
