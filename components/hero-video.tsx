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

      {/* Legibility scrim and blue wash in one layer rather than two: a flat
          `bg-ink/80` plus a separate tint is a second full-screen composite for
          no reason, and a diagonal gradient across brand navy → ink → brand
          blue holds the type just as well while giving the panel the gradient.
          Deepest at the top-left, where the eyebrow and headline sit; lightest
          at the bottom-right, so the footage still reads through it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-brand-900/90 via-ink/80 to-brand-700/65"
      />

      {/* Vertical blend only: keeps the top edge under the navbar dark and
          lands the foot on flat `ink`, so the section meets its neighbour
          without a seam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink/55 via-brand-600/10 to-ink"
      />
    </>
  )
}
