"use client"

import { useMemo, useRef, useState } from "react"
import { Container } from "./container"
import { PrefetchLink } from "./prefetch-link"
import type { CourseMark } from "@/lib/course-icons"

/**
 * The searchable index of an entire segment.
 *
 * The card grid lives here rather than in the Server Component above it,
 * because filtering has to happen without a round trip — an index of 35 courses
 * is small enough that the whole list ships with the page and the search is
 * instant.
 *
 * Marks are resolved on the server and arrive as plain path data, which keeps
 * the simple-icons index out of the browser bundle.
 */

export type FinderEntry = {
  slug: string
  segment: string
  label: string
  mark: CourseMark
}

export type FinderGroup = {
  title: string
  /** Anchor id — the footer deep-links to these. */
  id: string
  entries: FinderEntry[]
}

export function CourseFinder({ groups }: { groups: FinderGroup[] }) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const q = query.trim().toLowerCase()

  /*
    Matches the course name or its group, so "cloud" finds both the Cloud
    Computing course and everything filed under Cyber & Cloud. Flattened to one
    list on purpose: once you are searching, which section a result came from
    matters less than seeing all the matches together.
  */
  const results = useMemo(() => {
    if (!q) return []
    return groups.flatMap((group) =>
      group.entries
        .filter(
          (entry) =>
            entry.label.toLowerCase().includes(q) ||
            group.title.toLowerCase().includes(q),
        )
        .map((entry) => ({ entry, group: group.title })),
    )
  }, [groups, q])

  const total = useMemo(
    () => groups.reduce((sum, group) => sum + group.entries.length, 0),
    [groups],
  )

  return (
    <>
      <section className="border-b border-line py-8 lg:py-10">
        <Container>
          <div className="relative mx-auto max-w-2xl">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-muted"
            >
              <SearchIcon />
            </span>

            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              /* Escape clears rather than blurring, which is what the native
                 search-input clear does and what people expect here. */
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("")
              }}
              placeholder={`Search ${total} courses — try "python", "cloud", "marketing"`}
              aria-label="Search courses"
              className="w-full rounded-full border border-line bg-white py-4 pr-12 pl-13 text-sm outline-none transition-colors duration-300 placeholder:text-muted focus-visible:border-brand-600/50 focus-visible:ring-4 focus-visible:ring-brand-600/10"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  inputRef.current?.focus()
                }}
                aria-label="Clear search"
                className="absolute top-1/2 right-4 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors duration-300 hover:bg-subtle hover:text-foreground"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {q && (
            <p
              /* Announced so a screen-reader user hears the count change as
                 they type, rather than having to go hunting for the results. */
              role="status"
              aria-live="polite"
              className="mt-4 text-center text-sm text-muted"
            >
              {results.length === 0
                ? `No courses match “${query.trim()}”.`
                : `${results.length} of ${total} courses match “${query.trim()}”.`}
            </p>
          )}
        </Container>
      </section>

      {/* Searching replaces the grouped sections with one flat list. */}
      {q ? (
        <section className="py-12 lg:py-16">
          <Container>
            {results.length === 0 ? (
              <div className="mx-auto max-w-md rounded-2xl border border-line bg-subtle p-8 text-center">
                <p className="font-display text-lg font-bold tracking-tight text-ink">
                  Nothing found
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Try a broader word — a language, a tool, or a field like
                  “data”, “cloud” or “design”.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-5 inline-flex h-10 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-700"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map(({ entry, group }) => (
                  <Card key={`${entry.segment}-${entry.slug}`} entry={entry} sub={group} />
                ))}
              </div>
            )}
          </Container>
        </section>
      ) : (
        groups.map((group, index) => (
          <section
            key={group.title}
            id={group.id}
            className={`scroll-mt-24 py-16 lg:py-20 ${index % 2 ? "bg-subtle" : ""}`}
          >
            <Container>
              <h2 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
                {group.title}
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.entries.map((entry) => (
                  <Card key={entry.slug} entry={entry} />
                ))}
              </div>
            </Container>
          </section>
        ))
      )}
    </>
  )
}

function Card({ entry, sub }: { entry: FinderEntry; sub?: string }) {
  return (
    <PrefetchLink
      href={`/${entry.segment}/${entry.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.5)]"
    >
      <CourseMarkIcon mark={entry.mark} />

      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-base font-bold tracking-tight">
          {entry.label}
        </span>
        <span className="mt-1 block truncate text-xs text-muted">
          {sub ?? "Jalandhar · Live projects"}
        </span>
      </span>

      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600/10 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
        <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
          <path
            d="M5 12h14m-7-7 7 7-7 7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </PrefetchLink>
  )
}

/**
 * The brand mark, tinted with the brand's own colour at low opacity.
 *
 * Full-strength brand colours across a 35-card grid fight each other and pull
 * the eye away from the names, so the tile is a 10% wash of the mark's hue with
 * the glyph itself at full colour — enough to identify, not enough to shout.
 */
function CourseMarkIcon({ mark }: { mark: CourseMark }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-xl"
      style={{ backgroundColor: `#${mark.hex}1a` }}
    >
      {mark.path ? (
        <svg
          viewBox="0 0 24 24"
          className="size-5.5"
          style={{ fill: `#${mark.hex}` }}
          aria-hidden="true"
        >
          <path d={mark.path} />
        </svg>
      ) : (
        <span
          className="font-display text-xs font-bold tracking-tight"
          style={{ color: `#${mark.hex}` }}
        >
          {mark.mono}
        </span>
      )}
    </span>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m16 16 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
