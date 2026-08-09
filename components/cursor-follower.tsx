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

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      ring.dataset.visible = "true"

      const el = event.target as Element | null
      ring.dataset.active = String(Boolean(el?.closest(INTERACTIVE)))
      // Ink panels are too dark for the brand-blue ring to register.
      ring.dataset.invert = String(Boolean(el?.closest("[data-cursor='light']")))
    }

    const onLeave = () => {
      ring.dataset.visible = "false"
    }

    const tick = () => {
      x += (targetX - x) * EASE
      y += (targetY - y) * EASE
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
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
