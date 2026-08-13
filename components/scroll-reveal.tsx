"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/** Everything the observer is looking for that has not yet been revealed. */
const PENDING =
  "[data-reveal]:not([data-revealed]), [data-reveal-words]:not([data-revealed])"

/**
 * One IntersectionObserver for the whole page.
 *
 * Every animated block just carries `data-reveal` (or `data-reveal-words`) and
 * this sets `data-revealed` on it when it scrolls into view — so sections stay
 * Server Components and no per-section client boundary is needed. Elements are
 * unobserved once revealed; the animation is a one-shot, not a scrub.
 *
 * `reveal-ready` on <html> gates the hidden state in CSS: if this component
 * never runs, nothing is hidden in the first place.
 *
 * Two details here are load-bearing, both about hydration. This component
 * lives in the layout while each page is a separate Suspense boundary, so on
 * first load its effect can run while React is still adopting the page's
 * server-rendered nodes. Touching those nodes at that moment fails hydration
 * with "some attributes of the server rendered HTML didn't match the client
 * properties" — React diffs classes and attributes alike, so neither an
 * `is-visible` class nor a `data-revealed` attribute escapes it. Hence:
 *
 *   1. the work is deferred a task, letting React finish hydrating first;
 *   2. `reveal-ready` still goes on <html> synchronously, which is safe
 *      because <html> carries suppressHydrationWarning in the root layout.
 *
 * The delay is a task, not a frame — nothing has been hidden until step 2 has
 * applied and the browser has styled the page, so there is no flash to cover.
 */
export function ScrollReveal() {
  // Re-runs on every route change. This component lives in the layout, which
  // does NOT remount during client-side navigation — without the pathname
  // dependency the next page's elements are never observed and stay hidden at
  // opacity 0 forever.
  const pathname = usePathname()

  useEffect(() => {
    document.documentElement.classList.add("reveal-ready")

    let observer: IntersectionObserver | undefined
    let mutations: MutationObserver | undefined
    let failsafe = 0

    const reveal = (el: Element) => el.setAttribute("data-revealed", "true")
    const revealAll = () =>
      document.querySelectorAll(PENDING).forEach(reveal)

    const start = window.setTimeout(() => {
      // Without IntersectionObserver, reveal everything immediately rather
      // than leaving the page blank.
      if (!("IntersectionObserver" in window)) {
        revealAll()
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            reveal(entry.target)
            observer?.unobserve(entry.target)
          }
        },
        // Fires a little before the block is fully on screen, and forgives
        // elements taller than the viewport via the bottom margin.
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      )

      const observePending = () =>
        document.querySelectorAll(PENDING).forEach((el) => observer?.observe(el))

      observePending()

      // Sections streamed in after this point (Suspense boundaries, late
      // hydration) would otherwise never be picked up.
      mutations = new MutationObserver(observePending)
      mutations.observe(document.body, { childList: true, subtree: true })

      /*
        Circuit breaker. If nothing at all has revealed after two seconds, the
        observer is not doing its job — reveal everything rather than leave the
        page blank. Readable content must never depend on an animation firing.
      */
      failsafe = window.setTimeout(() => {
        if (document.querySelector("[data-revealed]")) return
        revealAll()
      }, 2000)
    }, 0)

    return () => {
      window.clearTimeout(start)
      window.clearTimeout(failsafe)
      observer?.disconnect()
      mutations?.disconnect()
    }
  }, [pathname])

  return null
}
