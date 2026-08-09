"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { PanelTexture } from "./panel-texture"

/** Where the bar parks while it waits for the window `load` event. */
const HOLD_AT = 92

/** Never hold the page hostage to a slow asset beyond this. */
const MAX_WAIT_MS = 4000

/** Time the fade-out needs — must match the CSS transition. */
const FADE_MS = 700

/**
 * Boot overlay shown on a full page load.
 *
 * Progress is real rather than a fixed animation: the bar eases toward 92%
 * while assets are still arriving, then completes the moment `load` fires (or
 * when MAX_WAIT_MS runs out, so a stalled request can't strand a visitor).
 *
 * It lives in the root layout, so it mounts once per hard load — client-side
 * navigation never replays it.
 */
export function Preloader() {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [removed, setRemoved] = useState(false)
  const ceiling = useRef(HOLD_AT)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Nothing to watch if the page is already loaded by the time we hydrate.
    const release = () => {
      ceiling.current = 100
    }
    if (document.readyState === "complete") release()
    else window.addEventListener("load", release)
    const failsafe = window.setTimeout(release, MAX_WAIT_MS)

    let frame = 0
    let current = 0

    const tick = () => {
      // Eases toward the ceiling, so it decelerates instead of marching.
      current += (ceiling.current - current) * (reduced ? 0.5 : 0.06)
      if (ceiling.current === 100 && current > 99.4) current = 100

      setProgress(current)

      if (current >= 100) {
        setDone(true)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(failsafe)
      window.removeEventListener("load", release)
    }
  }, [])

  // Hold the page still underneath, then drop the node once it has faded.
  useEffect(() => {
    if (removed) return
    document.body.style.overflow = done ? "" : "hidden"

    if (!done) return
    const timer = window.setTimeout(() => setRemoved(true), FADE_MS)
    return () => window.clearTimeout(timer)
  }, [done, removed])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  if (removed) return null

  const percent = Math.round(progress)

  return (
    <div
      className="preloader"
      data-done={done}
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${percent} percent`}
    >
      <PanelTexture />

      <div className="relative w-[min(22rem,80vw)] text-center">
        {/* Inverted to white — the source artwork is navy on transparent. */}
        <Image
          src="/assets/icon/tce.png"
          alt="TechCadd"
          width={952}
          height={262}
          priority
          className="mx-auto h-auto w-[min(17rem,70vw)] brightness-0 invert"
        />

        <div className="mt-8 h-px w-full overflow-hidden bg-white/15">
          <div
            className="h-full bg-linear-to-r from-brand-500 via-brand-400 to-accent-glow transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-5 font-mono text-[11px] tracking-[0.22em] text-white/60 uppercase">
          Booting up experience{" "}
          <span className="text-accent-glow tabular-nums">{percent}%</span>
        </p>
      </div>
    </div>
  )
}
