import Link from "next/link"
import { GoogleBadge, GoogleMark } from "./google-mark"
import { ScrollHeading } from "./scroll-heading"
import { loadTestimonials } from "@/lib/content"
import { TESTIMONIAL_META, type Testimonial } from "@/lib/testimonials"

/**
 * The track is padded to the same gutter the header uses, which keeps the
 * first card flush with the heading while the rest bleed off the right edge.
 */
const GUTTER = "px-[max(1rem,calc((100%-1240px)/2))] lg:px-[max(2rem,calc((100%-1240px)/2))]"

export async function Testimonials() {
  const testimonials = await loadTestimonials()

  return (
    /* Plain white — the texture, the colour blooms under the cards and the
       white-to-transparent wash over them are all gone. With nothing behind
       the cards to separate them, they carry their own border and shadow
       instead of the frosted-glass treatment they had. */
    <section
      id="testimonials"
      className="relative overflow-hidden bg-white py-20 lg:py-28"
    >
      <div className={GUTTER}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <ScrollHeading
              lines={["What our students say", "about Techcadd"]}
              className="font-display text-4xl leading-[1.05] font-bold tracking-tight lg:text-5xl"
            />

            {/* The rating now leads with the Google mark: it is a Business
                Profile score, and saying so is most of its weight. */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <Meta icon={<GoogleMark className="size-4" />}>
                {TESTIMONIAL_META.rating}
              </Meta>
              <Divider />
              <Meta icon={<HeartIcon className="size-4 text-rose-500" />}>
                {TESTIMONIAL_META.count}
              </Meta>
              <Divider />
              <Meta icon={<UsersIcon className="size-4 text-brand-600" />}>
                {TESTIMONIAL_META.community}
              </Meta>
            </div>
          </div>

          <Link
            href="/contact"
            className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full bg-ink py-2 pr-2 pl-7 text-sm font-semibold text-white shadow-[0_14px_34px_-14px_rgba(42,44,94,0.9)] transition-colors duration-300 hover:bg-brand-600 lg:self-auto"
          >
            Get started today
            <span className="grid size-8 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
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
          </Link>
        </div>
      </div>

      {/* Two rows travelling in opposite directions. Splitting the list means
          the same quote never appears on both rows at the same moment. */}
      <div className="marquee-row mt-14 space-y-6 lg:mt-20 lg:space-y-8">
        <Row items={testimonials.slice(0, Math.ceil(testimonials.length / 2))} />
        <Row
          items={testimonials.slice(Math.ceil(testimonials.length / 2))}
          reverse
        />
      </div>
    </section>
  )
}

/**
 * Cards per copy needed before a row is reliably wider than the viewport.
 *
 * A card is ~21rem plus its margin, so six clears roughly 2100px. Without this
 * the shorter row (three quotes) would run out of cards on a wide monitor and
 * the loop would show a blank stretch.
 */
const MIN_PER_COPY = 6

function fill(items: Testimonial[]): Testimonial[] {
  if (!items.length) return items
  const out = [...items]
  while (out.length < MIN_PER_COPY) out.push(...items)
  return out
}

/**
 * One infinitely scrolling row.
 *
 * The track holds the list exactly twice, so translating -50% lands copy two
 * where copy one began and the seam is invisible. Spacing lives on the cards
 * (`mr-6`) rather than as a flex `gap`: a gap would also fall between the two
 * copies and throw that -50% off by half a gap, which shows up as a stutter
 * once per loop.
 */
function Row({
  items,
  reverse = false,
}: {
  items: Testimonial[]
  reverse?: boolean
}) {
  const copy = fill(items)

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
            {copy.map((t, i) => (
              <Card key={`${pass}-${i}-${t.name}`} testimonial={t} />
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Card({ testimonial }: { testimonial: Testimonial }) {
  return (
    /* Solid white on a white section, so the edge has to come from the border
       and shadow — the old translucent fill and backdrop-blur had nothing left
       to work against once the texture went. */
    <figure className="group relative mr-6 flex w-[19rem] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-[0_28px_60px_-30px_rgba(37,99,235,0.45)] sm:w-[21rem]">
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} className="size-4 text-amber-400" />
            ))}
          </div>

          {/* Marks the quote as a Google Business Profile review. Replaces the
              decorative quote glyph that used to sit in this corner. */}
          <GoogleBadge />
        </div>

        <blockquote className="mt-5 text-sm leading-relaxed text-foreground/85">
          {testimonial.quote}
        </blockquote>
      </div>

      <figcaption className="relative mt-8 flex items-center gap-3 border-t border-line/70 pt-5">
        <span
          aria-hidden="true"
          className={`grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br ${testimonial.from} ${testimonial.to} font-display text-xs font-bold text-white`}
        >
          {testimonial.initials}
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-tight">
            {testimonial.name}
          </span>
          <span className="block text-xs text-muted">{testimonial.role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

function Meta({ icon, children }: { icon: React.ReactNode; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {children}
    </span>
  )
}

function Divider() {
  return (
    <span aria-hidden="true" className="h-4 w-px bg-foreground/15" />
  )
}

/**
 * The Google "G", in its four brand colours.
 *
 * Drawn rather than imported: the CSP pins every asset to 'self', so the mark
 * cannot be pulled from a Google CDN, and it is small enough that a file would
 * cost a request for no benefit. Fixed colours, so it takes no className tint.
 */
function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="m12 17.27 5.18 3.13-1.37-5.89 4.57-3.96-6.02-.52L12 4.5 9.64 10.03l-6.02.52 4.57 3.96-1.37 5.89L12 17.27Z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 20.7 3.9 12.9a5 5 0 0 1 7.07-7.07L12 6.86l1.03-1.03A5 5 0 0 1 20.1 12.9L12 20.7Z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.87 0-7 1.94-7 4.33V20h14v-2.67C16 14.94 12.87 13 9 13Zm8.5-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm.5 2c-.83 0-1.6.12-2.3.34A6.3 6.3 0 0 1 18 17.33V20h4v-2.4C22 15.2 20.2 13 18 13Z" />
    </svg>
  )
}
