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
      {/* A select rather than a row of pills.
          Three buttons read as three separate syllabuses; a single control
          labelled with the current duration says plainly that one thing is
          being switched. It is a native <select>, so it comes with keyboard
          handling, the platform's own picker on mobile, and no open/close
          state to manage. */}
      <div className="mt-10">
        <label
          htmlFor="module-duration"
          className="block font-mono text-xs tracking-[0.18em] text-white/50 uppercase"
        >
          Choose duration
        </label>

        <div className="relative mt-3 inline-block">
          <select
            id="module-duration"
            value={active}
            onChange={(e) => setActive(Number(e.target.value))}
            /* `appearance-none` drops the platform arrow so the chevron below
               can sit where the design wants it; the right padding reserves
               that space. Options need explicit colours — a dark <select> in
               most browsers still renders its list on the system background. */
            className="w-full min-w-[15rem] appearance-none rounded-full border border-white/25 bg-white/10 py-3.5 pr-14 pl-6 font-display text-base font-bold tracking-tight text-white backdrop-blur-md transition-colors duration-300 hover:border-white/40 hover:bg-white/15 focus-visible:border-white/60 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
          >
            {tracks.map((option, i) => (
              <option key={option.months} value={i} className="bg-ink text-white">
                {option.label}
              </option>
            ))}
          </select>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-white/70"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-4">
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
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
