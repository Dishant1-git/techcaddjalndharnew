"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Pauses a `.marquee-left` / `.marquee-right` row (globals.css) while the
 * page itself is being scrolled, resuming shortly after it stops.
 *
 * A row that keeps racing past while the user is actively scrolling reads as
 * visual noise fighting the thing they're doing; freezing it during the
 * scroll keeps the motion out of the way until they've settled somewhere.
 *
 * This is the one client boundary in an otherwise server-rendered section —
 * `children` (the marquee lanes and their cards) is still built once on the
 * server and passed straight through, so toggling `scrolling` here only
 * re-renders this wrapper's own `<div>`, not the card list inside it.
 */
export function MarqueeScrollPause({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const [scrolling, setScrolling] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onScroll() {
      setScrolling(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      // Resumes a beat after the last scroll event rather than the instant
      // scrolling stops — a string of quick, separate scrolls should read as
      // one continuous pause, not a flicker of resume-pause-resume between
      // them.
      timeoutRef.current = setTimeout(() => setScrolling(false), 200)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      className={`marquee-scroll-pause ${scrolling ? "is-scrolling" : ""} ${className}`}
    >
      {children}
    </div>
  )
}
