import type { Metadata } from "next"
import { loadContact } from "@/lib/content"
import Link from "next/link"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"

import { OFFERINGS, PARTNERSHIP_STATS, PROCESS, type Offering } from "@/lib/partnerships"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "College Partnerships — Workshops, Training and Placement Drives",
  description:
    "Techcadd partners with colleges and universities on campus workshops, industrial training, faculty development and joint placement drives across Punjab.",
  alternates: { canonical: `${SITE.url}/college-partnerships` },
}

export default async function CollegePartnershipsPage() {
  const contact = await loadContact()

  return (
    <main>
      <section
        data-cursor="light"
        className="bg-ink pt-32 pb-16 text-white lg:pt-40 lg:pb-20"
      >
        <Container>
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            College Partnerships
          </span>

          <h1
            data-reveal
            className="mt-7 max-w-4xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            Bringing <span className="text-white">industry practice</span> onto
            your <span className="text-white">campus.</span>
          </h1>

          <p
            data-reveal
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 lg:text-lg"
          >
            Workshops, mandated industrial training, faculty development and
            joint placement drives — run with your departments, on your
            timetable.
          </p>

          <dl
            data-reveal
            className="mt-14 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
          >
            {PARTNERSHIP_STATS.map((stat) => (
              <div key={stat.label} className="relative flex flex-col-reverse pl-5">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-linear-to-b from-accent-400 to-brand-600"
                />
                <dt className="mt-2 text-sm text-white/55">{stat.label}</dt>
                <dd className="font-display text-3xl leading-none font-bold tracking-tight lg:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-subtle py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              What we run
            </p>
            <h2
              data-reveal
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Six ways we work with institutions
            </h2>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {OFFERINGS.map((offering, index) => (
              <li
                key={offering.title}
                data-reveal
                style={
                  { "--reveal-delay": `${index * 70}ms` } as React.CSSProperties
                }
                className="rounded-2xl border border-line bg-background p-6 lg:p-7"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white shadow-[0_14px_32px_-14px_rgba(37,99,235,0.9)]">
                  <OfferingIcon name={offering.icon} />
                </span>

                <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-ink">
                  {offering.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {offering.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How it works. A numbered rail rather than cards: these are sequential,
          and a grid would imply you could start anywhere. */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              How it works
            </p>
            <h2
              data-reveal
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              From first call to a running programme
            </h2>
          </div>

          <ol className="relative mt-12 grid gap-8 lg:mt-16 lg:grid-cols-4 lg:gap-6">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-6 hidden h-px bg-line lg:block"
            />

            {PROCESS.map((step, index) => (
              <li
                key={step.title}
                data-reveal
                style={
                  { "--reveal-delay": `${index * 90}ms` } as React.CSSProperties
                }
                className="relative"
              >
                <span className="relative grid size-12 place-items-center rounded-full bg-ink font-display text-base font-bold text-white ring-6 ring-background">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-5 font-display text-base font-bold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/*
        No roster of named partner colleges.

        Listing an institution as a partner is a public claim about a real
        organisation, and inventing names for placeholder copy would put a false
        statement on a live site. This block invites the enquiry instead, and the
        roster goes in once the agreements are confirmed.
      */}
      {/* The same `subtle` panel the "What we run" band uses. Light rather than
          ink because the closing <Cta /> directly below is ink: two dark blocks
          in a row read as one long section, and the button pair here loses the
          separation that makes it the second ask rather than part of the last
          one. `data-cursor="light"` is gone with the dark background — it
          inverts the cursor ring, which on a pale panel leaves the washed-out
          disc instead of the dark one. */}
      <section className="bg-subtle py-20 lg:py-28">
        <Container className="text-center">
          <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
            Partner with us
          </p>

          <h2
            data-reveal
            className="mx-auto mt-5 max-w-3xl font-display text-3xl leading-[1.1] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
          >
            Tell us what your students need next.
          </h2>

          <p
            data-reveal
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted lg:text-lg"
          >
            Send us your department, student numbers and the semester you are
            planning for, and we will come back with a written proposal — scope,
            duration, delivery mode and cost.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={contact.phoneHref}
              /* The blue drop-glow the ink version carried is dropped with it.
                 It was there to lift the button off a dark panel; over `subtle`
                 it only muddies the edge. */
              className="inline-flex h-14 items-center justify-center rounded-full bg-brand-600 px-8 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-700"
            >
              Call {contact.phone}
            </a>
            {/* `<Link>`, not `<a>`: an anchor to an internal route drops out of
                the client router and reloads the whole document. */}
            <Link
              href="/contact"
              /* White on `subtle` rather than the translucent white-on-ink fill,
                 which over a pale panel is invisible. Matches the secondary
                 button on /faq. */
              className="inline-flex h-14 items-center justify-center rounded-full border border-line bg-white px-8 text-sm font-semibold text-foreground transition-colors duration-300 hover:border-brand-600/40 hover:text-brand-600"
            >
              Send an enquiry
            </Link>
          </div>
        </Container>
      </section>

      <Cta />
    </main>
  )
}

/** The six programme marks. One component with a switch, matching how the
 *  founder page handles its recognition icons. */
function OfferingIcon({ name }: { name: Offering["icon"] }) {
  const common = {
    className: "size-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  }

  if (name === "workshop")
    return (
      <svg {...common}>
        <path d="M3 5.5h18v11H3zM8 20.5h8M12 16.5v4" />
        <path d="M7.5 12.5 10 10l2 2 4.5-4.5" />
      </svg>
    )

  if (name === "training")
    return (
      <svg {...common}>
        <path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z" />
        <path d="M6.5 10.5V15c0 1.5 2.5 2.75 5.5 2.75s5.5-1.25 5.5-2.75v-4.5M20.5 9v5" />
      </svg>
    )

  if (name === "placement")
    return (
      <svg {...common}>
        <path d="M3.5 7.5h17v12h-17zM8.5 7.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2.5" />
        <path d="M3.5 12.5h17M12 12.5v2" />
      </svg>
    )

  if (name === "faculty")
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 19.5c0-3 2.7-5 6-5s6 2 6 5" />
        <path d="M16.5 8.5h5M16.5 12h4" />
      </svg>
    )

  if (name === "lab")
    return (
      <svg {...common}>
        <path d="M9.5 3.5v6L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-4.5-8.5v-6" />
        <path d="M8 3.5h8M7.5 14.5h9" />
      </svg>
    )

  return (
    <svg {...common}>
      <circle cx="12" cy="10" r="6" />
      <path d="m8.5 15.5-1 6 4.5-2.5 4.5 2.5-1-6" />
      <path d="m9.8 10 1.6 1.6 3-3.2" />
    </svg>
  )
}
