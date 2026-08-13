"use client"

import { useRef } from "react"
import { useDeferredVideo } from "./use-deferred-video"

/**
 * Ambient background loop for the dark hero panels.
 *
 * The video plus both scrims, kept together because they are only correct
 * together: the footage alone is far too busy to put white type over.
 *
 * The parent must be `relative isolate overflow-hidden`, keep its own `bg-ink`
 * so the panel is the right colour before a frame decodes (and stays right if
 * the file never loads), and place its content above this in the stacking
 * order — a `relative` Container after it is enough.
 *
 * A client component now, only so the source can be withheld until the page
 * has loaded and the visitor is on a connection worth spending 2.3 MB of
 * decoration on. See useDeferredVideo. The scrims stay server-rendered markup
 * either way, so the panel looks finished from the first paint.
 */
export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const load = useDeferredVideo(ref)

  return (
    <>
      {/* `src` on the element rather than a <source> child: appending a source
          to a video that has already settled does not start a load, whereas
          setting src does. */}
      <video
        ref={ref}
        src={load ? src : undefined}
        autoPlay
        muted
        loop
        playsInline
        /* "none", not "metadata": nothing at all should be fetched until
           useDeferredVideo hands over a source. */
        preload="none"
        aria-hidden="true"
        /* Scaled past the edges so the blur's soft border can't reveal the
           panel behind it. */
        className="pointer-events-none absolute inset-0 size-full scale-105 object-cover blur-[1px]"
      />

      {/* Legibility scrim, tinted with `ink` rather than black so the hero
          stays the colour it would be without the video, and deepened at the
          foot so the section still ends on the flat panel colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-ink/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink/60 via-transparent to-ink"
      />
    </>
  )
}
