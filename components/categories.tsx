import Image from "next/image"
import Link from "next/link"
import { Container } from "./container"
import { PanelTexture } from "./panel-texture"
import { ScrollHeading } from "./scroll-heading"
import { COURSE_CATEGORIES, type CourseCategory } from "@/lib/categories"

/**
 * Course categories — a row of tall covers that expand under the pointer.
 *
 * The expansion is pure CSS: every card is `flex-1 basis-0`, and hovering one
 * raises its `flex-grow` while the siblings keep theirs, so the row
 * redistributes without JavaScript. Below `lg` the row becomes a 2-column grid
 * where growth would have nothing to take space from.
 */

const ICONS: Record<string, React.ReactNode> = {
  ai: (
    <path
      d="M12 3a3 3 0 0 0-3 3 3 3 0 0 0-1.5 5.6V15a3 3 0 0 0 4.5 2.6A3 3 0 0 0 16.5 15v-3.4A3 3 0 0 0 15 6a3 3 0 0 0-3-3Zm0 0v18"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "full-stack": (
    <path
      d="M9 7.5 4.5 12 9 16.5M15 7.5 19.5 12 15 16.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  data: (
    <path
      d="M4 19V9m5 10V5m5 14v-7m5 7V8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  ),
  security: (
    <path
      d="M12 3.5 5 6.5V12c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6.5l-7-3Zm-2.5 8.5 2 2 4-4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  marketing: (
    <path
      d="M4 10v4h3l5 3.5v-11L7 10H4Zm12.5-2a5 5 0 0 1 0 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  cloud: (
    <path
      d="M7 18a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17 9.5a3.75 3.75 0 0 1 .3 7.5H7Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

export function Categories() {
  return (
    <section
      id="categories"
      data-cursor="light"
      className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28"
    >
      <PanelTexture />

      {/* Full-bleed surface, contained content — the panel spans the viewport
          while the copy stays on the same 1240px column as every other
          section, so headings line up down the whole page. */}
      <Container className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
              Categories
            </span>
            <ScrollHeading
              lines={["Crafting careers with technology", "that works for you"]}
              className="mt-6 font-display text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-5xl"
            />
          </div>

          <Link
            href="/courses"
            className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full bg-white py-2 pr-2 pl-7 text-sm font-semibold text-brand-700 transition-colors duration-300 hover:bg-brand-50 lg:self-auto"
          >
            All categories
            <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-white transition-transform duration-300 group-hover:translate-x-0.5">
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

        <div
          data-reveal
          suppressHydrationWarning
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-14 lg:flex lg:h-[34rem] lg:gap-4"
        >
          {COURSE_CATEGORIES.map((category) => (
            <Card key={category.id} category={category} />
          ))}
        </div>
      </Container>
    </section>
  )
}

function Card({ category }: { category: CourseCategory }) {
  return (
    <Link
      href={category.href}
      /* basis-0 makes flex-grow the sole width authority, so the hover state
         is a clean 1 -> 2.4 ratio rather than content-dependent. */
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl transition-[flex-grow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:aspect-auto lg:min-w-0 lg:grow lg:basis-0 lg:hover:grow-[2.4]"
    >
      {category.image ? (
        <Image
          src={category.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 420px, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <Cover category={category} />
      )}

      {/* Floor gradient keeps the label readable over any cover. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-black/45"
      />

      <div className="absolute inset-0 flex flex-col justify-between p-4 lg:p-5">
        <h3 className="font-display text-sm leading-snug font-bold tracking-tight text-balance lg:text-base">
          {category.label}
        </h3>

        {/* Held back until hover so the collapsed cards stay as quiet as the
            reference; on touch there is no hover, so it rides in on focus too. */}
        <div className="translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <p className="text-xs leading-relaxed text-white/80 lg:text-sm">
            {category.blurb}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold lg:text-sm">
            Explore
            <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden="true">
              <path
                d="M5 12h14m-7-7 7 7-7 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

/** Fallback cover: gradient, corner glow, grid rule and a ghosted glyph. */
function Cover({ category }: { category: CourseCategory }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-0 bg-linear-to-br ${category.from} ${category.to} transition-transform duration-700 group-hover:scale-110`}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.4),transparent_55%)]" />
      <span className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="absolute bottom-[-8%] left-1/2 size-[70%] -translate-x-1/2 text-white/25"
      >
        {ICONS[category.id]}
      </svg>
    </span>
  )
}
