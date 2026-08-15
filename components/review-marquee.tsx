import { GoogleBadge } from "./google-mark"
import type { Review } from "@/lib/course-pages"

/**
 * The homepage testimonial treatment, reusable for course-page reviews.
 *
 * Sits on plain white, like its homepage counterpart — the section behind it
 * carries no backdrop of its own.
 *
 * Two rows travel in opposite directions on a CSS-only infinite loop. The
 * track holds each lane exactly twice, so translating -50% lands copy two
 * where copy one began and the seam is invisible; spacing lives on the cards
 * (`mr-6`) rather than a flex `gap`, because a gap would also fall between the
 * two copies and throw that -50% off by half a gap.
 */

/** Cards per copy before a lane reliably outruns a wide viewport. */
const MIN_PER_COPY = 6

function fill(items: Review[]): Review[] {
  if (!items.length) return items
  const out = [...items]
  while (out.length < MIN_PER_COPY) out.push(...items)
  return out
}

export function ReviewMarquee({ items }: { items: Review[] }) {
  const split = Math.ceil(items.length / 2)

  return (
    /* Deliberately not `.marquee-row` — the same choice the gallery made.
       That class exists only to hang the hover-pause off, and it has to sit on
       the wrapper shared by both lanes, so pointing at any one review froze
       the whole section. These lanes run continuously. */
    <div className="mt-12 space-y-6 lg:mt-14 lg:space-y-8">
      <Lane items={items.slice(0, split)} />
      <Lane items={items.slice(split)} reverse />
    </div>
  )
}

function Lane({ items, reverse = false }: { items: Review[]; reverse?: boolean }) {
  const copy = fill(items)
  if (!copy.length) return null

  return (
    <div className="marquee-fade overflow-hidden py-2">
      <ul
        className={`flex w-max ${reverse ? "marquee-right" : "marquee-left"}`}
        style={
          { "--marquee-duration": `${copy.length * 8}s` } as React.CSSProperties
        }
      >
        {[0, 1].map((pass) => (
          <li key={pass} className="flex" aria-hidden={pass === 1}>
            {copy.map((review, i) => (
              <Card key={`${pass}-${i}-${review.name}`} review={review} />
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Card({ review }: { review: Review }) {
  return (
    /* Solid white with a real border. The frosted treatment this had — a
       translucent fill, a white border and a backdrop blur — only read as a
       card against the grain-and-bloom backdrop the section used to carry;
       on plain white it was invisible apart from its shadow. */
    <figure className="group relative mr-6 flex w-[19rem] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-[0_28px_60px_-30px_rgba(37,99,235,0.45)] sm:w-[21rem]">
      <div className="relative">
        {/* Stars and source on one line, replacing the oversized decorative
            quote glyph that used to fill this corner — the same swap the
            homepage card made, so the two read as one treatment. */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} />
            ))}
          </div>

          <GoogleBadge />
        </div>

        <blockquote className="mt-5 text-sm leading-relaxed text-foreground/85">
          {review.quote}
        </blockquote>
      </div>

      <figcaption className="relative mt-8 flex items-center gap-3 border-t border-line/70 pt-5">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-600 to-accent-500 font-display text-xs font-bold text-white"
        >
          {review.initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight">
            {review.name}
          </span>
          <span className="block truncate text-xs text-muted">
            {review.role} · {review.city}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-amber-400" aria-hidden="true">
      <path d="m12 17.27 5.18 3.13-1.37-5.89 4.57-3.96-6.02-.52L12 4.5 9.64 10.03l-6.02.52 4.57 3.96-1.37 5.89L12 17.27Z" />
    </svg>
  )
}
