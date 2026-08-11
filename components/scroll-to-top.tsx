"use client"

import { useEffect, useState } from "react"

/** How far down the page the button appears — roughly one screen. */
const SHOW_AFTER = 600

/**
 * Back-to-top button, bottom right of every page.
 *
 * Rendered on every route from the layout, but kept out of the tab order and
 * hidden from screen readers until it is actually on screen: a control that is
 * invisible but focusable is a trap for keyboard users, and one announced while
 * off screen is noise.
 *
 * Sits at z-40 — above the page, below the navbar (z-50) and the enquiry
 * popup (z-90), so it can never cover a dialog.
 */
export function ScrollToTop() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > SHOW_AFTER)

    // Run once on mount: a reload part-way down the page would otherwise leave
    // the button hidden until the first scroll event.
    onScroll()

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toTop = () => {
    // `scroll-behavior: smooth` is not in the stylesheet for the document, so
    // the choice is made here — and skipped for anyone who has asked for less
    // motion, since a full-page glide is exactly what that setting is about.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Scroll back to top"
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={`fixed right-5 bottom-5 z-40 grid size-12 place-items-center rounded-full bg-brand-600 text-white shadow-[0_18px_40px_-14px_rgba(37,99,235,0.9)] transition-all duration-300 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:right-8 lg:bottom-8 ${
        shown
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="size-5"
      >
        <path
          d="M12 19V5m0 0-6 6m6-6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
