import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { HeroVideo } from "@/components/hero-video"
import { Recognition } from "@/components/recognition"
import { TimelineProgress } from "@/components/timeline-progress"
import { SITE } from "@/lib/site"
import { STATS } from "@/lib/stats"

export const metadata: Metadata = {
  title: "About Techcadd — Our Story, Values and Journey",
  description:
    "Techcadd has trained students in Jalandhar since 2007 — CAD, programming, data, cloud and AI. Our story, the values we teach by, and the milestones along the way.",
  alternates: { canonical: `${SITE.url}/about` },
}

/** The disciplines named in the company profile, in the order it lists them. */
const DISCIPLINES = [
  "Artificial Intelligence",
  "Data Science",
  "Cyber Security",
  "Cloud Computing",
  "Full Stack Development",
  "Digital Marketing",
  "Graphic Designing",
  "CAD/CAM",
]

const DIFFERENTIATORS = [
  "Industry-oriented curriculum",
  "Hands-on, practical learning",
  "Live projects & industrial training",
  "Emerging technology programs",
  "Experienced trainers & mentors",
  "Career counselling & placement assistance",
  "Modern learning infrastructure",
  "Industry & academic collaborations",
]

type Milestone = { year: string; title: string; body: string }

/**
 * TODO: 2017–2026 are still placeholder — replace with the real history.
 *
 * Only 2016 is sourced: the founding year and founder come from the company
 * profile quoted in the section above. The other ten entries are scaffolding
 * written to plausible dates so the timeline could be built, and each one is a
 * dated public claim about a real business, so they need the team's own account
 * rather than something that merely sounds right.
 */
const MILESTONES: Milestone[] = [
  { year: "2016", title: "techcadd is founded", body: "Mr. Gourav Gupta starts techcadd in Jalandhar, to close the gap between academic learning and industry needs." },
  { year: "2017", title: "Industrial training at scale", body: "Six-week, 45-day and six-month tracks become full programmes." },
  { year: "2018", title: "A placement cell", body: "Hiring support becomes its own team rather than a trainer's side task." },
  { year: "2019", title: "Colleges come on board", body: "Formal training partnerships begin with universities across Punjab." },
  { year: "2020", title: "Teaching through lockdown", body: "Live online batches launch in weeks, and no cohort loses a term." },
  { year: "2021", title: "Data on the syllabus", body: "Analytics and data science join the catalogue as full tracks." },
  { year: "2022", title: "Cloud and DevOps", body: "AWS, Docker and CI pipelines are added to the developer paths." },
  { year: "2023", title: "After-12th pathways", body: "Career tracks built for school leavers, not just graduates." },
  { year: "2024", title: "AI on the syllabus", body: "Generative and agentic AI arrive, taught on real projects." },
  { year: "2025", title: "Ten thousand alumni", body: "The trained-student count passes five figures across all tracks." },
  { year: "2026", title: "Today and beyond", body: "New labs, new tracks, and the same rule: you learn it by building it." },
]

export default function AboutPage() {
  return (
    <main>
      <section
        data-cursor="light"
        /* `min-h-screen`, not a fixed `h-screen`: the panel fills the viewport
           as intended, but a short window — a laptop in landscape, or a phone
           with the browser chrome showing — grows it rather than spilling the
           stats out of the bottom. Centred, so the padding above and below is
           only a floor for that case. */
        className="relative isolate flex min-h-screen items-center overflow-hidden bg-ink pt-32 pb-20 text-white lg:pt-40 lg:pb-28"
      >
        <HeroVideo src="/assets/video/aboutus-bg.mp4" />

        <Container className="relative">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            About us
          </span>

          {/* Two-tone rather than one weight: the bright phrases carry the
              sentence on their own, so the line reads at a glance and in full. */}
          <h1
            data-reveal
            suppressHydrationWarning
            className="mt-7 max-w-4xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            Learn about <span className="text-white">our people,</span> our story
            and <span className="text-white">how we turn skills into careers.</span>
          </h1>

          {/* Same source as the homepage band — one set of numbers for the whole
              site, so a claim can never drift between two pages. */}
          <dl
            data-reveal
            suppressHydrationWarning
            className="mt-14 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="relative flex flex-col-reverse pl-5"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-linear-to-b from-accent-400 to-brand-600"
                />
                <dt className="mt-2 text-sm text-white/55">{stat.label}</dt>
                <dd className="font-display text-4xl leading-none font-bold tracking-tight lg:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/*
        Who we are. Runs across the full content width rather than down a single
        reading column: the profile and the disciplines sit side by side, and the
        eight differentiators run four-across underneath.
      */}
      <section className="bg-subtle py-20 lg:py-28">
        <Container>
          <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
            Who we are
          </p>

          <h2
            data-reveal
            suppressHydrationWarning
            className="mt-4 max-w-4xl font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
          >
            Empowering Skills. Enabling Careers.{" "}
            <span className="text-brand-600">Building the Future.</span>
          </h2>

          <div
            data-reveal
            suppressHydrationWarning
            className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
          >
            {/* All the copy on the left, the photograph alone on the right.
                Splitting the text across both columns is what left the gap: the
                left ran out while the right kept going. With one text column the
                image can simply stretch to whatever height that column needs, so
                the two always finish level. */}
            <div>
              <div className="space-y-5 text-base leading-relaxed text-muted lg:text-[17px]">
                <p>
                  Founded in 2016 by{" "}
                  {/* The one place his name appears on this page, so it is the
                      one that should carry the link to his profile. */}
                  <Link
                    href="/about/founder"
                    className="font-semibold text-foreground underline decoration-brand-600/40 underline-offset-4 transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
                  >
                    Mr. Gourav Gupta
                  </Link>
                  , techcadd is an IT training and skill-development
                  organization focused on bridging the gap between academic
                  learning and industry requirements. Its approach combines
                  practical exposure, advanced technologies, project-based
                  learning and career-oriented training to help learners become
                  more confident and industry-ready.
                </p>
                <p>
                  The organization describes its goal as making advanced
                  technology accessible through its training network, practical
                  exposure and industry-oriented learning.
                </p>
              </div>

              <h3 className="mt-9 font-display text-sm font-bold tracking-tight text-ink">
                What we teach
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                From Artificial Intelligence to CAD/CAM and other
                technology-focused disciplines — skills for the evolving digital
                economy.
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {DISCIPLINES.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-7 border-t border-line pt-5 text-sm text-muted">
                Headquartered in Jalandhar, Punjab.
              </p>
            </div>

            {/* Fixed 3:2 while stacked, because a stretched box has no height to
                stretch to there; from `lg` it drops the ratio and matches the
                text column instead. */}
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-line lg:aspect-auto lg:h-full">
              <Image
                src="/assets/images/about/team.jpg"
                alt="The techcadd team at the Jalandhar centre"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <h3
            data-reveal
            suppressHydrationWarning
            className="mt-16 font-display text-2xl font-bold tracking-tight text-ink lg:mt-20 lg:text-3xl"
          >
            What makes techcadd different?
          </h3>

          <ul
            data-reveal
            suppressHydrationWarning
            className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {DIFFERENTIATORS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
              >
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/*
        Alternating timeline. One list with a rail down the middle: each item
        puts its year card against the rail and its copy on the outside, the
        sides swapping row by row. Below `sm` there is no room for two columns,
        so the rail moves to the left edge and every item stacks against it.

        The panel holds one viewport from `lg` up, and the list scrolls inside
        it. Eleven milestones do not fit a screen at a readable size — the
        earlier attempt to divide the height between them clipped 2026 off the
        bottom — so the height stays fixed and the overflow becomes a scroll
        rather than a loss. Under `lg` the panel simply grows with its content.
      */}
      <section className="flex flex-col overflow-hidden bg-background py-20 text-foreground lg:h-screen lg:py-14">
        {/* Renders nothing — it only watches the milestones below and stamps
            `data-state` on them, which is what the CSS styles against. */}
        <TimelineProgress />

        <Container className="flex flex-1 flex-col lg:min-h-0">
          <div className="text-center">
            <span className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              Our journey
            </span>
            <h2
              data-reveal
              suppressHydrationWarning
              className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl"
            >
              A decade of building careers
            </h2>
          </div>

          {/* Three nested boxes, each with one job: this one is the positioning
              frame the edge fades hang off, the next is the scroll port, and the
              innermost one takes the list's full height so the rail can run the
              whole way down. A rail placed on the scroll port itself would be
              only as tall as the visible area and would slide away as you
              scrolled. */}
          <div className="relative mt-10 flex-1 lg:mt-8 lg:min-h-0">
            {/* Scrollbar hidden, scrolling kept. The edge fades are what signal
                there is more below now, so nothing is lost by removing it. */}
            <div className="h-full [scrollbar-width:none] lg:overflow-y-auto lg:scroll-smooth [&::-webkit-scrollbar]:hidden">
              {/* Breathing room at both ends so the first and last dots are not
                  flush against the fades. */}
              <div className="relative lg:py-4">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-[7px] w-px bg-line sm:left-1/2"
                />

                {/* Roomier than it was: each milestone now lights as it
                    reaches the middle of the screen, and that only reads as one
                    at a time if they are far enough apart that two are rarely
                    in the band together. */}
                <ol className="space-y-12 lg:space-y-16">
                  {MILESTONES.map((milestone, index) => {
                    const right = index % 2 === 1

                    return (
                      <li
                        key={milestone.year}
                        /* No `data-reveal` here. That is a one-shot that latches
                           on first sight, which cannot express a state the
                           timeline needs to take away again — and its
                           `.is-visible { opacity: 1 }` is (0,3,0), so it would
                           outrank the dimmed state and pin every milestone lit. */
                        data-timeline-item
                        className="relative pl-9 sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-12 sm:pl-0"
                      >
                        <span
                          aria-hidden="true"
                          className="timeline-dot absolute top-1/2 left-1 size-2.5 -translate-y-1/2 rounded-full bg-brand-600 ring-4 ring-brand-600/15 sm:left-1/2 sm:-translate-x-1/2"
                        />

                        {/* Half the column gap, so it meets the card exactly. */}
                        <span
                          aria-hidden="true"
                          className={`absolute top-1/2 hidden h-px w-6 -translate-y-1/2 bg-line sm:block ${
                            right ? "left-1/2" : "right-1/2"
                          }`}
                        />

                        {/* Reversed rather than reordered: the card stays first
                            in the DOM, so the reading order is the same on both
                            sides. */}
                        <div
                          className={`flex items-center gap-4 ${
                            right
                              ? "sm:col-start-2"
                              : "sm:col-start-1 sm:flex-row-reverse sm:text-right"
                          }`}
                        >
                          <div className="timeline-card w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-background shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)]">
                            <div className="timeline-card__era bg-brand-600 py-0.5 text-center font-mono text-[10px] tracking-widest text-white">
                              20
                            </div>
                            <div className="py-1.5 text-center font-display text-xl leading-none font-bold">
                              {milestone.year.slice(2)}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-display text-sm font-bold tracking-tight lg:text-[15px]">
                              {milestone.year} — {milestone.title}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-muted">
                              {milestone.body}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>

            {/* Softens the top cut line as the list scrolls under the heading. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 hidden h-10 bg-linear-to-b from-background to-transparent lg:block"
            />
          </div>
        </Container>
      </section>

      {/* Moved here from /about/founder: these are the institute's
          certifications, university engagements and collaborations rather than
          anything personal to the founder, so they belong on the page about
          the institute. */}
      <Recognition />

      <Cta />
    </main>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m8.25 12.25 2.5 2.5 5-5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
