import Link from "next/link"
import { Container } from "./container"
import { ScrollHeading } from "./scroll-heading"
import { CONTACT } from "@/lib/navigation"

/**
 * Why us — an oversized statement on the left, a divided 2x2 matrix of
 * differentiators on the right.
 *
 * Each right-hand column is its own `divide-y` stack rather than a shared
 * grid row, so the rules sit under whatever that column's copy actually
 * needs and never stretch to match the taller neighbour.
 */

type Reason = {
  title: string
  icon: "curriculum" | "trainers" | "placement" | "batches"
  body: React.ReactNode
}

const REASONS: Reason[] = [
  {
    title: "Industry-Built Curriculum",
    icon: "curriculum",
    body: (
      <>
        We teach from the same stack we ship client work on — so the syllabus
        moves the moment the industry does.
      </>
    ),
  },
  {
    title: "Certified Trainers",
    icon: "trainers",
    body: (
      <>
        Learn from engineers who still write production code, not from career
        instructors reading a decade-old slide deck.
      </>
    ),
  },
  {
    title: "Placement Support",
    icon: "placement",
    body: (
      <>
        500+ hiring partners, mock interviews and on-campus drives, run by our
        placement cell.
      </>
    ),
  },
  {
    title: "Flexible Batches",
    icon: "batches",
    body: (
      <>
        45-day, 6-week, 6-month and weekend formats, with fee{" "}
        <Inline href="/contact">EMI options</Inline> so cost never decides it.
      </>
    ),
  },
]

export function WhyUs() {
  const [left, right] = [REASONS.slice(0, 2), REASONS.slice(2)]

  return (
    <section id="why-us" className="py-20 lg:py-28">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        {/* --- Statement --- */}
        <div>
          <p className="text-sm font-medium">
            <span className="text-brand-600">/</span> Why Techcadd?
          </p>

          <ScrollHeading
            lines={["The Techcadd", "Difference"]}
            className="mt-6 font-display text-[clamp(2.75rem,7vw,4.75rem)] leading-[0.95] font-bold tracking-tight"
          />

          <p className="mt-7 max-w-md text-base leading-relaxed text-muted">
            For nearly two decades we&apos;ve been the training partner students
            and employers in Jalandhar keep coming back to — 25,000+ engineers
            trained, and a hiring network that answers when we call.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Cta href={CONTACT.phoneHref}>Call Now</Cta>
            <Cta href="/contact">Book a Free Demo</Cta>
          </div>
        </div>

        {/* --- Differentiators --- */}
        <div data-reveal className="grid gap-x-12 sm:grid-cols-2">
          <div className="divide-y divide-line">
            {left.map((r) => (
              <Item key={r.title} reason={r} />
            ))}
          </div>
          <div className="divide-y divide-line sm:border-l sm:border-line sm:pl-12">
            {right.map((r) => (
              <Item key={r.title} reason={r} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

function Item({ reason }: { reason: Reason }) {
  return (
    <div className="flex gap-5 py-8 first:pt-0 last:pb-0">
      <span className="shrink-0 text-brand-600">{ICONS[reason.icon]}</span>
      <div>
        <h3 className="font-display text-lg font-bold tracking-tight">
          {reason.title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">
          {reason.body}
        </p>
      </div>
    </div>
  )
}

/** Inline link inside body copy — underlined, as in the reference. */
function Inline({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-brand-600 underline underline-offset-2 transition-colors duration-200 hover:text-brand-700"
    >
      {children}
    </Link>
  )
}

function Cta({ href, children }: { href: string; children: React.ReactNode }) {
  // "Call Now" is a tel: link, so only in-app routes get client navigation.
  const Tag = href.startsWith("/") ? Link : "a"

  return (
    <Tag
      href={href}
      className="group inline-flex items-center gap-1.5 text-base font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700"
    >
      {children}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      >
        <path
          d="m9 5 7 7-7 7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Tag>
  )
}

/**
 * Two-tone glyphs: a soft brand-tinted body carrying `currentColor` strokes,
 * which reads as illustration rather than UI iconography at this size.
 */
const ICONS: Record<Reason["icon"], React.ReactNode> = {
  curriculum: (
    <svg viewBox="0 0 48 48" className="size-11" fill="none" aria-hidden="true">
      <path d="M6 10.5A2.5 2.5 0 0 1 8.5 8H21a3 3 0 0 1 3 3v27a3 3 0 0 0-3-3H6V10.5Z" className="fill-brand-600/15" />
      <path d="M42 10.5A2.5 2.5 0 0 0 39.5 8H27a3 3 0 0 0-3 3v27a3 3 0 0 1 3-3h15V10.5Z" className="fill-brand-600/30" />
      <path
        d="M24 11v27M6 10.5A2.5 2.5 0 0 1 8.5 8H21a3 3 0 0 1 3 3v27a3 3 0 0 0-3-3H6V10.5Zm36 0A2.5 2.5 0 0 0 39.5 8H27a3 3 0 0 0-3 3v27a3 3 0 0 1 3-3h15V10.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M11 16h7M11 22h7M30 16h7M30 22h7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  trainers: (
    <svg viewBox="0 0 48 48" className="size-11" fill="none" aria-hidden="true">
      <circle cx="24" cy="18" r="12" className="fill-brand-600/20" />
      <path d="m16 28-4 14 12-5 12 5-4-14" className="fill-brand-600/30" />
      <path
        d="m16 28-4 14 12-5 12 5-4-14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="18" r="12" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="m19 18 3.5 3.5L29 15"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  placement: (
    <svg viewBox="0 0 48 48" className="size-11" fill="none" aria-hidden="true">
      <rect x="5" y="15" width="38" height="26" rx="4" className="fill-brand-600/15" />
      <path d="M5 22h38v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6Z" className="fill-brand-600/30" />
      <rect x="5" y="15" width="38" height="26" rx="4" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M18 15v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4M5 26h38"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M24 34v-9m0 0-3.5 3.5M24 25l3.5 3.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  batches: (
    <svg viewBox="0 0 48 48" className="size-11" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="36" height="32" rx="4" className="fill-brand-600/15" />
      <path d="M6 14a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v5H6v-5Z" className="fill-brand-600/30" />
      <rect x="6" y="10" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M6 19h36M16 6v8M32 6v8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="31" cy="31" r="8" className="fill-background" stroke="currentColor" strokeWidth="2.2" />
      <path d="M31 27v4.5l3 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}
