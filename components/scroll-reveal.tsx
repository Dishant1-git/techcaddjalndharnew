"use client"

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
  useEffect(() => {
    const root = document.documentElement
    root.classList.add("reveal-ready")

    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal], [data-reveal-words]",
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
    return () => observer.disconnect()
  }, [])

  return null
}
