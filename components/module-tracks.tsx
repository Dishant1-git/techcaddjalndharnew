"use client"

import { useState } from "react"
import type { ModuleTrack } from "@/lib/course-pages"

/**
 * Duration switcher over the homepage's sticky module stack.
 *
 * Each card pins a little lower than the one before, so a card scrolling up
 * covers its predecessor while leaving that card's top edge visible. The cards
 * must stay opaque — a translucent surface would show the card underneath and
 * the deck would read as a smear.
 *
 * The section wrapping this must use `overflow-clip`, never `overflow-hidden`:
 * `hidden` makes an element a scroll container, which silently disables
 * `position: sticky` on everything inside it.
 */
export function ModuleTracks({ tracks }: { tracks: ModuleTrack[] }) {
  const [active, setActive] = useState(
    // Default to 6 months — the track most students actually take.
    Math.max(0, tracks.findIndex((t) => t.months === 6)),
  )
  const track = tracks[active] ?? tracks[0]
  if (!track) return null

  return (
    <>
      <div
        role="tablist"
        aria-label="Course duration"
        className="mt-10 flex flex-wrap gap-2"
      >
        {tracks.map((option, i) => {
          const selected = i === active
          return (
            <button
              key={option.months}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                selected
                  ? "bg-white text-ink shadow-[0_14px_34px_-14px_rgba(255,255,255,0.5)]"
                  : "border border-white/20 bg-white/5 text-white/70 hover:bg-white/12 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/65 lg:text-base">
        {track.summary}
      </p>

      <div className="mt-10 lg:mt-14">
        {track.modules.map((module, i) => (
          <div
            key={`${track.months}-${module.title}`}
            className="sticky"
            style={{ top: `calc(6.5rem + ${i * 1.1}rem)` }}
          >
            <article
              className={`group relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#33366f] p-7 shadow-[0_30px_70px_-30px_rgba(6,10,35,0.95)] transition-colors duration-500 hover:border-white/25 sm:p-9 ${
                i === track.modules.length - 1 ? "mb-0" : "mb-6"
              }`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"
              />

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 font-mono text-sm font-semibold text-white transition-colors duration-500 group-hover:bg-white group-hover:text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-bold tracking-tight lg:text-2xl">
                    {module.title}
                  </h3>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {module.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-sm leading-relaxed text-white/65"
                      >
                        <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-white/40" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </>
  )
}
