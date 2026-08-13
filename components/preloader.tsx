"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { PanelTexture } from "./panel-texture"

/** Where the bar parks while it waits for the window `load` event. */
const HOLD_AT = 92

/** Never hold the page hostage to a slow asset beyond this. */
const MAX_WAIT_MS = 4000

/**
 * Easing time constant, in milliseconds — the bar closes ~63% of the remaining
 * distance every TAU. Expressed in time rather than frames on purpose: see the
 * note on the animation loop.
 */
const TAU_MS = 180

/** Once `load` has fired there is nothing left to wait for. */
const FINISH_MS = 320

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
  const [done, setDone] = useState(false)
  const [removed, setRemoved] = useState(false)
  const ceiling = useRef(HOLD_AT)
  const bar = useRef<HTMLDivElement>(null)
  const readout = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Nothing to watch if the page is already loaded by the time we hydrate.
    let releasedAt = 0
    const release = () => {
      if (!releasedAt) releasedAt = performance.now()
      ceiling.current = 100
    }
    if (document.readyState === "complete") release()
    else window.addEventListener("load", release)
    const failsafe = window.setTimeout(release, MAX_WAIT_MS)

    let frame = 0
    let current = 0
<<<<<<< Updated upstream
    let last = performance.now()
=======
    let shown = -1
>>>>>>> Stashed changes

    /*
      Time-based easing, not per-frame.

      This used to close a fixed 6% of the remaining distance on every
      animation frame, which paced the splash by frame count — and frames are
      scarcest exactly while the page is hydrating and the splash is up. The
      result was backwards: the heavier the page, the longer its boot screen.
      On the homepage `load` fired at 457ms and the overlay stayed until
      ~7.9s, because the main thread was too busy to hand out frames.

      Driving it from elapsed time makes the duration the same on a fast
      machine and a slow one, and `FINISH_MS` puts a ceiling on the whole
      thing: once `load` has fired there is nothing left to wait for, so the
      bar runs to 100 within a third of a second however the frames land.
    */
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(now - last, 100)
      last = now

      if (releasedAt) {
        // Linear run-out from wherever the bar had reached.
        current += ((100 - current) * dt) / Math.max(FINISH_MS, 1)
        if (100 - current < 0.5 || now - releasedAt > FINISH_MS) current = 100
      } else {
        const k = 1 - Math.exp(-dt / (reduced ? TAU_MS / 2 : TAU_MS))
        current += (ceiling.current - current) * k
      }

      /*
        Written to the nodes rather than held in state.

        This bar animates for as long as the page is still loading — up to
        MAX_WAIT_MS. A setState per frame re-rendered the whole overlay, the
        logo <Image> and PanelTexture included, sixty times a second during
        the exact window the browser is trying to parse, fetch and hydrate
        everything else. Two direct writes cost nothing and look identical.
      */
      bar.current?.style.setProperty("width", `${current}%`)

      // The label only changes 100 times over the whole run, not every frame.
      const percent = Math.round(current)
      if (percent !== shown) {
        shown = percent
        if (readout.current) readout.current.textContent = `${percent}%`
      }

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

  return (
    <>
      {/*
        The overlay is server-rendered so it covers the page from the very
        first paint — but only JavaScript can ever dismiss it. Without this,
        a visitor with JS disabled (or blocked by an extension) stares at a
        splash screen forever.
      */}
      <noscript>
        <style>{`.preloader{display:none!important}`}</style>
      </noscript>

      {/* A fixed label rather than one carrying the percentage. This is a live
          region, so a label that counted 0 → 100 queued a hundred separate
          announcements at a screen reader for a splash screen that dismisses
          itself. The number stays on screen for everyone who can see it. */}
      <div
        className="preloader"
        data-done={done}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
      <PanelTexture />

      <div className="relative w-[min(22rem,80vw)] text-center">
        {/* Inverted to white — the source artwork is navy on transparent. */}
        <Image
          src="/assets/icon/tce.png"
          alt="Techcadd"
          width={952}
          height={262}
          priority
          className="mx-auto h-auto w-[min(17rem,70vw)] brightness-0 invert"
        />

        <div className="mt-8 h-px w-full overflow-hidden bg-white/15">
          <div
            ref={bar}
            className="h-full bg-linear-to-r from-brand-500 via-brand-400 to-accent-glow transition-[width] duration-200 ease-out"
            style={{ width: "0%" }}
          />
        </div>

        <p className="mt-5 font-mono text-[11px] tracking-[0.22em] text-white/60 uppercase">
          Booting up experience{" "}
          <span
            ref={readout}
            aria-hidden="true"
            className="text-accent-glow tabular-nums"
          >
            0%
          </span>
          </p>
        </div>
      </div>
    </>
  )
}
