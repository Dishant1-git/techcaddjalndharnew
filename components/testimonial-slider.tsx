"use client"

import { useEffect, useRef, type ReactNode } from "react"

/** Travel speed of the auto-slide, in CSS pixels per second. */
const SPEED = 45

/**
 * Auto-advancing testimonial rail.
 *
 * Cards arrive as `children` from a Server Component and are rendered twice —
 * the second copy is `aria-hidden`, purely the runway that makes the loop look
 * endless. Rather than animating a transform, we nudge the scroll container's
 * `scrollLeft` each frame, which keeps native touch-swipe and wheel scrolling
 * working; a drag simply takes over from the animation and the loop carries on
 * from wherever the reader left it.
 *
 * The wrap distance is measured as the gap between the two copies' offsets, so
 * it stays correct across breakpoints without hard-coding card or gutter sizes.
 */
export function TestimonialSlider({
  children,
  className,
  listClassName,
}: {
  children: ReactNode
  className?: string
  listClassName?: string
}) {
  const track = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLUListElement>(null)
  const second = useRef<HTMLUListElement>(null)
  const paused = useRef(false)

  useEffect(() => {
    const el = track.current
    if (!el) return

    // Readers who ask for less motion keep a plain, manually scrollable rail.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    let previous = 0

    const step = (now: number) => {
      frame = requestAnimationFrame(step)

      const elapsed = previous ? now - previous : 0
      previous = now

      // A long gap means the tab was hidden — resume rather than jump.
      if (paused.current || elapsed <= 0 || elapsed > 100) return

      const loop =
        (second.current?.offsetLeft ?? 0) - (first.current?.offsetLeft ?? 0)
      if (loop <= 0) return

      let next = el.scrollLeft + (SPEED * elapsed) / 1000
      if (next >= loop) next -= loop
      else if (next < 0) next += loop

      el.scrollLeft = next
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

  const hold = () => {
    paused.current = true
  }
  const release = () => {
    paused.current = false
  }

  return (
    <div
      ref={track}
      className={`flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className ?? ""}`}
      onPointerEnter={hold}
      onPointerLeave={release}
      onPointerDown={hold}
      onPointerUp={release}
      onFocusCapture={hold}
      onBlurCapture={release}
    >
      <ul ref={first} className={listClassName}>
        {children}
      </ul>
      <ul ref={second} aria-hidden="true" className={listClassName}>
        {children}
      </ul>
    </div>
  )
}
