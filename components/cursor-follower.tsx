"use client"

import { useEffect, useRef } from "react"

/** Fraction of the remaining distance covered each frame — the trail's weight. */
const EASE = 0.18

/** Elements the ring should open up over. */
const INTERACTIVE = 'a, button, [role="tab"], input, textarea, select, summary'

/**
 * A ring that trails the pointer.
 *
 * The native cursor is left alone — this rides alongside it as an accent
 * rather than replacing it, so precision and text carets are never lost.
 *
 * Position is written straight to the node's transform inside a rAF loop; it
 * never touches React state, so a pointer sweep costs no re-renders.
 */
export function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ring = ref.current
    if (!ring) return

    // Pointless on touch, and unwelcome when motion is reduced.
    const fine = window.matchMedia("(pointer: fine)")
    const still = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (!fine.matches || still.matches) return

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let x = targetX
    let y = targetY
    let frame = 0

    /*
      The loop parks itself once the ring has caught up.

      It used to run for as long as the tab was open, re-writing an identical
      transform sixty times a second at a pointer that had not moved since —
      on every page, for every visitor with a mouse. Now a still pointer costs
      nothing and the next movement wakes it. `frame = 0` is the parked marker:
      requestAnimationFrame never returns 0, so it can't collide with a real id.
    */
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      ring.dataset.visible = "true"

      const el = event.target as Element | null
      ring.dataset.active = String(Boolean(el?.closest(INTERACTIVE)))
      // Ink panels are too dark for the brand-blue ring to register.
      ring.dataset.invert = String(Boolean(el?.closest("[data-cursor='light']")))

      wake()
    }

    const onLeave = () => {
      ring.dataset.visible = "false"
    }

    const tick = () => {
      const dx = targetX - x
      const dy = targetY - y

      // Sub-pixel: snap to the target and stop rather than easing forever
      // towards a distance the screen cannot show.
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        x = targetX
        y = targetY
        ring.style.transform = `translate3d(${x}px, ${y}px, 0)`
        frame = 0
        return
      }

      x += dx * EASE
      y += dy * EASE
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeave)
    window.addEventListener("blur", onLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("blur", onLeave)
    }
  }, [])

  return <div ref={ref} aria-hidden="true" className="cursor-ring" />
}
