"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import type { HeroImage } from "@/lib/course-pages"

/** Travel at the far edge of the viewport, in pixels. */
const DRIFT = 12

/** Tilt at the far edge of the viewport, in degrees. */
const TILT = 3

/** Fraction of the remaining distance covered each frame. */
const EASE = 0.09

/**
 * Hero artwork that leans towards the pointer.
 *
 * The cut-outs are flat images sitting on a flat panel, and a little parallax
 * is what stops them reading as stickers. Deliberately slight: this is depth
 * on a course page, not a product showcase, and anything larger competes with
 * the H1 sitting next to it for attention.
 *
 * Follows the same discipline as the cursor ring — the transform is written
 * straight to the node inside a rAF loop that parks itself once the artwork
 * has caught up, so a still pointer costs nothing and React never re-renders
 * on a pointer sweep. The loop is also gated on the hero actually being in
 * view, because the pointer keeps moving long after the reader has scrolled
 * past it.
 */
export function HeroArt({ image }: { image: HeroImage }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const art = ref.current
    if (!art) return

    // Nothing to follow on touch, and unwelcome when motion is reduced.
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let frame = 0
    let onScreen = true

    const apply = () => {
      art.style.transform =
        `translate3d(${(x * DRIFT).toFixed(2)}px, ${(y * DRIFT).toFixed(2)}px, 0) ` +
        `rotateX(${(-y * TILT).toFixed(2)}deg) rotateY(${(x * TILT).toFixed(2)}deg)`
    }

    /* `frame = 0` is the parked marker: requestAnimationFrame never returns 0,
       so it cannot collide with a real id. */
    const tick = () => {
      const dx = targetX - x
      const dy = targetY - y

      // Below a hundredth of the range the transform no longer changes to any
      // resolution the screen has; settle exactly and stop.
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
        x = targetX
        y = targetY
        apply()
        frame = 0
        return
      }

      x += dx * EASE
      y += dy * EASE
      apply()
      frame = requestAnimationFrame(tick)
    }

    const onMove = (event: MouseEvent) => {
      if (!onScreen) return
      targetX = (event.clientX / window.innerWidth) * 2 - 1
      targetY = (event.clientY / window.innerHeight) * 2 - 1
      if (!frame) frame = requestAnimationFrame(tick)
    }

    // Drift home when the pointer leaves the window rather than holding a
    // lean towards a pointer that is no longer there.
    const onLeave = () => {
      targetX = 0
      targetY = 0
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        if (!onScreen) onLeave()
      },
      { rootMargin: "100px" },
    )
    observer.observe(art)

    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeave)
    window.addEventListener("blur", onLeave)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("blur", onLeave)
    }
  }, [])

  return (
    <div className="relative [perspective:1200px]">
      {/* The artwork is a cut-out, so it needs a light source of its own — on
          flat ink it otherwise reads as a sticker. Left out of the transform
          so the art moves against its own glow, which is what sells the
          depth. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 inset-y-8 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.4),transparent_70%)] blur-2xl"
      />
      <div
        ref={ref}
        /* No CSS transition here — the easing lives in the rAF loop, and a
           transition on top of a per-frame write eases the easing. */
        className="relative will-change-transform"
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          priority
          sizes="(min-width: 1024px) 32rem, 90vw"
          className="mx-auto h-auto w-full max-w-md drop-shadow-[0_28px_50px_rgba(2,6,23,0.55)] lg:max-w-none"
        />
      </div>
    </div>
  )
}
