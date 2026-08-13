"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { GalleryLightbox } from "./gallery-lightbox"
import type { GalleryTile } from "@/lib/gallery"

/**
 * Four horizontal lanes of photographs, travelling in alternating directions.
 *
 * Built on the site's existing marquee CSS rather than a new mechanism: the
 * track holds each lane exactly twice, so translating -50% lands copy two where
 * copy one began and the seam is invisible. Spacing lives on the cards (`mr-4`)
 * rather than a flex `gap`, because a gap would also fall between the two copies
 * and throw that -50% off by half a gap.
 *
 * Clicking any photograph opens the same carousel the drifting wall used.
 */

/** A tile plus where it sits in the original list, which the carousel needs. */
type Entry = { tile: GalleryTile; index: number }

const LANES = 4

/** Cards per copy before a lane reliably outruns a wide viewport. */
const MIN_PER_COPY = 8

/** Seconds per card, per lane. Different values stop the four locking into
 *  step and reading as one block sliding. */
const LANE_SECONDS = [7, 9.5, 8, 11]

function fill(items: Entry[]): Entry[] {
  if (!items.length) return items
  const out = [...items]
  while (out.length < MIN_PER_COPY) out.push(...items)
  return out
}

/** Round-robin rather than four contiguous slices: with only a handful of
 *  distinct photographs, dealing them out keeps neighbouring lanes from
 *  showing the same picture side by side. */
function toLanes(tiles: GalleryTile[]): Entry[][] {
  const lanes: Entry[][] = Array.from({ length: LANES }, () => [])
  tiles.forEach((tile, index) => lanes[index % LANES].push({ tile, index }))
  return lanes.map(fill)
}

export function GalleryMarquee({ tiles }: { tiles: GalleryTile[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null)

  /*
    Held across renders, element tree included.

    The rail and the lightbox share this component, so every step through the
    carousel — each arrow key, each thumbnail click — set `openAt` and rebuilt
    all four lanes and their ~64 <Image> cards underneath a full-screen overlay
    that covers them completely. `setOpenAt` is stable, so with the tiles
    unchanged React can skip the whole subtree.
  */
  const rail = useMemo(
    () => (
      /*
        Deliberately not `.marquee-row`.

        That class is what globals.css hangs its hover-pause off, and because it
        has to sit on the wrapper shared by all four lanes, pointing at any one
        photograph froze the entire gallery. The lanes run continuously instead.
        The testimonial and review rows keep the class, so their pause-to-read
        behaviour is unaffected.
      */
      <div className="space-y-4 lg:space-y-5">
        {toLanes(tiles).map((lane, i) => (
          <Lane
            key={i}
            entries={lane}
            /* Alternating: the first travels left to right, the next right to
               left, and so on down the four. */
            reverse={i % 2 === 0}
            seconds={LANE_SECONDS[i % LANE_SECONDS.length]}
            onSelect={setOpenAt}
          />
        ))}
      </div>
    ),
    [tiles],
  )

  return (
    <>
      {rail}

      <GalleryLightbox
        tiles={tiles}
        index={openAt}
        onClose={() => setOpenAt(null)}
        onIndexChange={setOpenAt}
      />
    </>
  )
}

function Lane({
  entries,
  reverse,
  seconds,
  onSelect,
}: {
  entries: Entry[]
  reverse: boolean
  seconds: number
  onSelect: (index: number) => void
}) {
  if (!entries.length) return null

  return (
    <div className="marquee-fade overflow-hidden">
      <ul
        className={`flex w-max ${reverse ? "marquee-right" : "marquee-left"}`}
        style={
          {
            "--marquee-duration": `${entries.length * seconds}s`,
          } as React.CSSProperties
        }
      >
        {[0, 1].map((pass) => (
          <li key={pass} className="flex" aria-hidden={pass === 1}>
            {entries.map((entry, i) => (
              <Card
                key={`${pass}-${i}-${entry.index}`}
                entry={entry}
                /* The duplicate copy exists only to make the loop seamless —
                   it is hidden from assistive tech, so it must be out of the
                   tab order too or keyboard users hit every photo twice. */
                duplicate={pass === 1}
                onSelect={onSelect}
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Card({
  entry,
  duplicate,
  onSelect,
}: {
  entry: Entry
  duplicate: boolean
  onSelect: (index: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry.index)}
      tabIndex={duplicate ? -1 : 0}
      aria-label={`Open ${entry.tile.title} in the gallery viewer`}
      className="group relative mr-4 h-[130px] w-[200px] shrink-0 overflow-hidden rounded-xl border border-line bg-subtle transition-shadow duration-500 hover:shadow-[0_22px_50px_-24px_rgba(15,23,42,0.45)] sm:h-[160px] sm:w-[250px] lg:mr-5 lg:h-[190px] lg:w-[300px]"
    >
      <Image
        src={entry.tile.image}
        alt={entry.tile.title}
        fill
        sizes="(min-width: 1024px) 300px, (min-width: 640px) 250px, 200px"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
    </button>
  )
}
