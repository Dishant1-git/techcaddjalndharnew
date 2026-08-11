"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/**
 * One IntersectionObserver for the whole page.
 *
 * Every animated block just carries `data-reveal` (or `data-reveal-words`) and
 * this adds `is-visible` when it scrolls into view — so sections stay Server
 * Components and no per-section client boundary is needed. Elements are
 * unobserved once revealed; the animation is a one-shot, not a scrub.
 *
 * `reveal-ready` on <html> gates the hidden state in CSS: if this component
 * never runs, nothing is hidden in the first place.
 */
export function ScrollReveal() {
  // Re-runs on every route change. This component lives in the layout, which
  // does NOT remount during client-side navigation — without the pathname
  // dependency the next page's elements are never observed and stay hidden at
  // opacity 0 forever.
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    root.classList.add("reveal-ready")

    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not(.is-visible), [data-reveal-words]:not(.is-visible)",
    )

    // Without IntersectionObserver, reveal everything immediately rather than
    // leaving the page blank.
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add("is-visible")
          observer.unobserve(entry.target)
        }
      },
      // Fires a little before the block is fully on screen, and forgives
      // elements taller than the viewport via the bottom margin.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )

    targets.forEach((el) => observer.observe(el))

    // Sections streamed in after this effect (Suspense boundaries, late
    // hydration) would otherwise never be picked up.
    const mutations = new MutationObserver(() => {
      document
        .querySelectorAll<HTMLElement>(
          "[data-reveal]:not(.is-visible), [data-reveal-words]:not(.is-visible)",
        )
        .forEach((el) => observer.observe(el))
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    /*
      Circuit breaker. If nothing at all has revealed after two seconds, the
      observer is not doing its job — reveal everything rather than leave the
      page blank. Readable content must never depend on an animation firing.
    */
    const failsafe = window.setTimeout(() => {
      if (document.querySelector("[data-reveal].is-visible, [data-reveal-words].is-visible")) {
        return
      }
      document
        .querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-words]")
        .forEach((el) => el.classList.add("is-visible"))
    }, 2000)

    return () => {
      observer.disconnect()
      mutations.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [pathname])

  return null
}
