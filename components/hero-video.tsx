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
 */
export function HeroVideo({ src }: { src: string }) {
  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        /* Metadata only: eager buffering competes with first paint for no
           visible gain on a background loop. */
        preload="metadata"
        aria-hidden="true"
        /* Scaled past the edges so the blur's soft border can't reveal the
           panel behind it. */
        className="pointer-events-none absolute inset-0 size-full scale-105 object-cover blur-[1px]"
      >
        <source src={src} type="video/mp4" />
      </video>

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
