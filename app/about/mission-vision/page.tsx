import type { Metadata } from "next"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { HeroVideo } from "@/components/hero-video"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Mission and Vision",
  description:
    "techcadd's mission is to bridge education with industry through accessible technology, practical exposure and industry-ready skills, and its vision, to help build India's future-ready technology workforce.",
  alternates: { canonical: `${SITE.url}/about/mission-vision` },
}

/**
 * Each carries an icon rather than a position number.
 *
 * The circles used to hold 01–05, which read as ranked priorities; these five
 * are concurrent. An icon keeps the same silhouette on the rail without
 * asserting an order, and leaving the circle empty would have looked like a
 * loading state.
 */
const MISSION_POINTS = [
  {
    title: "Make Technology Accessible",
    body: "Keep good technology training within reach, on fees and on entry requirements.",
    icon: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 0c-2.2 2.2-3.3 5-3.3 8.5s1.1 6.3 3.3 8.5m0-17c2.2 2.2 3.3 5 3.3 8.5s-1.1 6.3-3.3 8.5M4 12h16",
  },
  {
    title: "Prioritise Practical Learning",
    body: "Theory gets the class started. Projects and lab work are where it sticks.",
    icon: "M14.5 4.5a4 4 0 0 0 5 5L10 19a2.8 2.8 0 0 1-4-4l8.5-10.5ZM6.5 15.5l2 2",
  },
  {
    title: "Build Industry-Ready Talent",
    body: "Teach what local employers are hiring for, and keep checking that it still is.",
    icon: "M4 8.5h16v11H4v-11Zm4.5 0v-2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M4 13h16",
  },
  {
    title: "Encourage Continuous Upskilling",
    body: "Alumni come back for the next thing. Keep the door open and the fees fair when they do.",
    icon: "M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4",
  },
  {
    title: "Reach More Towns",
    body: "More centres and more college tie-ups, so this training is not only a big-city option.",
    icon: "M12 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-6.5 12a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm13 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM10.5 7.5 6.8 14m6.7-6.5 3.7 6.5M8 18h8",
  },
]

/**
 * The five vision points, spaced evenly around a circle.
 *
 * `x`/`y` are percentages of the square stage, precomputed from
 * `50 + 37·cos(θ)` / `50 + 37·sin(θ)` with θ starting at -90° and stepping 72°,
 * so the first node sits at twelve o'clock and the rest follow clockwise. They
 * are literals rather than trigonometry at render time because they never
 * change and the numbers are easier to reason about written out.
 *
 * No ordering is implied — the five are simultaneous commitments, which is why
 * the numbering the wave version carried has gone.
 */
const VISION_POINTS = [
  { x: "50%", y: "13%", ring: "border-brand-700", body: "Creating future-ready technology professionals" },
  { x: "85%", y: "38.6%", ring: "border-brand-600", body: "Promoting practical and industry-oriented education" },
  { x: "71.8%", y: "79.9%", ring: "border-brand-500", body: "Encouraging innovation and continuous learning" },
  { x: "28.2%", y: "79.9%", ring: "border-accent-500", body: "Supporting India's digital transformation" },
  { x: "15%", y: "38.6%", ring: "border-accent-400", body: "Building a trusted name in software, services, and technology education" },
]

export default function MissionVisionPage() {
  return (
    <main>
      <section
        data-cursor="light"
        /* `min-h-screen` rather than a fixed `h-screen`, matching the About
           hero: it fills the viewport as intended, but a short window grows it
           instead of pushing the headline out of the bottom. Centred, so the
           padding is only a floor for that case. */
        className="relative isolate flex min-h-screen items-center overflow-hidden bg-ink pt-32 pb-16 text-white lg:pt-40 lg:pb-20"
      >
        <HeroVideo src="/assets/video/aboutus-bg.mp4" />

        <Container className="relative">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            Mission &amp; Vision
          </span>

          <h1
            data-reveal
            suppressHydrationWarning
            className="mt-7 max-w-4xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            Where we are <span className="text-white">going,</span> and{" "}
            <span className="text-white">what we are building towards.</span>
          </h1>
        </Container>
      </section>

      <section className="bg-subtle py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              Our Mission
            </p>

            <h2
              data-reveal
              suppressHydrationWarning
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Bridging Education with Industry
            </h2>

            <p
              data-reveal
              suppressHydrationWarning
              className="mt-5 text-base leading-relaxed text-muted lg:text-lg"
            >
              Put plainly: get people access to the technology that is actually
              being used, give them enough practice on it to be useful, and send
              them into interviews with something to show. Five things follow
              from that.
            </p>
          </div>

          {/*
            Horizontal timeline. Each item is a three-row grid — space above, the
            rail crossing, space below, and the node is placed into row 1 or
            row 3 so the circles alternate over and under the line. Because the
            outer rows are both `1fr`, the middle row always lands on the
            vertical centre of the list, which is exactly where the rail is
            drawn, so the two line up without a single hard-coded offset.

            Below `lg` there is no room for five columns: the rail is dropped and
            the items stack, each one reading circle, title, then body.
          */}
          {/* The reveal is on each item rather than the list, so the rail is
              already drawn when the nodes arrive on it one after another. */}
          <ol className="relative mt-14 grid gap-y-10 lg:mt-24 lg:grid-cols-5 lg:gap-x-6">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-line lg:block"
            />
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-0 hidden size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink lg:block"
            />
            <span
              aria-hidden="true"
              className="absolute top-1/2 right-0 hidden size-2.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-ink lg:block"
            />

            {MISSION_POINTS.map((point, index) => {
              const above = index % 2 === 0

              return (
                <li
                  key={point.title}
                  data-reveal
                  suppressHydrationWarning
                  /* All five are on screen together, so they are staggered
                     left to right — firing at once would read as one block
                     appearing rather than a sequence being laid down. */
                  style={
                    {
                      "--reveal-delay": `${index * 110}ms`,
                    } as React.CSSProperties
                  }
                  className="lg:grid lg:grid-rows-[1fr_auto_1fr]"
                >
                  {/* Order is the same for every item — connector, circle,
                      title, body. Reversing the column for the ones above the
                      rail flips that to body, title, circle, connector, so the
                      connector always ends up against the line. */}
                  <div
                    className={
                      above
                        ? "flex flex-col items-center gap-3 text-center lg:row-start-1 lg:flex-col-reverse lg:self-end"
                        : "flex flex-col items-center gap-3 text-center lg:row-start-3 lg:self-start"
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="hidden h-7 w-px bg-line lg:block"
                    />

                    <span
                      className={`grid size-16 shrink-0 place-items-center rounded-full text-white lg:size-20 ${
                        above
                          ? "bg-ink shadow-[0_18px_40px_-16px_rgba(42,44,94,0.9)] ring-6 ring-ink/10"
                          : "bg-brand-600 shadow-[0_18px_40px_-16px_rgba(37,99,235,0.9)] ring-6 ring-brand-600/15"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="size-7 lg:size-8"
                        aria-hidden="true"
                      >
                        <path
                          d={point.icon}
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <h3 className="font-display text-sm font-bold tracking-tight text-ink lg:text-base">
                      {point.title}
                    </h3>

                    <p className="max-w-[16rem] text-xs leading-relaxed text-muted lg:text-sm">
                      {point.body}
                    </p>
                  </div>

                  {/* The point where this item meets the rail. */}
                  <span
                    aria-hidden="true"
                    className="hidden lg:row-start-2 lg:grid lg:h-3 lg:place-items-center"
                  >
                    <span
                      className={`size-3 rounded-full bg-background ring-2 ${
                        above ? "ring-ink" : "ring-brand-600"
                      }`}
                    />
                  </span>
                </li>
              )
            })}
          </ol>

          {/* Attribution: this is the company's own published wording, not
              ours, and it is marked as such. */}
          <p className="mx-auto mt-16 max-w-3xl text-center text-xs leading-relaxed text-muted lg:mt-24">
            These five follow techcadd&apos;s own published mission: to grow a
            national and international network of franchise centres, and to
            provide advanced technology training with the practical exposure
            that improves employability.
          </p>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              Our Vision
            </p>

            <h2
              data-reveal
              suppressHydrationWarning
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Building India&apos;s Future-Ready Technology Workforce
            </h2>

            <p
              data-reveal
              suppressHydrationWarning
              className="mt-5 text-base leading-relaxed text-muted lg:text-lg"
            >
              India does not lack young people who want technical careers. What
              is thin on the ground is the training that makes them employable.
              We would like to be one of the places that closes that gap, five
              commitments at a time.
            </p>
          </div>

          {/*
            The five arranged around a circle rather than along a wave. A ring
            carries no start and no end, which is the honest shape for five
            commitments held at once — the wave read as a sequence, and the
            numbering that came with it implied an order that does not exist.

            Each node is a circle holding its own text, positioned by the
            precomputed percentages above and pulled back by half its own size
            so its centre lands on the ring. The dashed circle behind them is
            drawn at the same 37% radius, so the nodes sit on it by
            construction.

            Below `lg` the ring is dropped and the circles wrap: five 12rem
            circles around a phone screen would leave nothing legible in the
            middle.
          */}
          <ul
            data-reveal
            suppressHydrationWarning
            className="mt-14 flex flex-wrap items-center justify-center gap-8 lg:relative lg:mt-20 lg:block lg:aspect-square lg:h-auto lg:w-full lg:max-w-[46rem] lg:gap-0 lg:mx-auto"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 hidden size-full lg:block"
            >
              <defs>
                <linearGradient id="vision-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-700)" />
                  <stop offset="50%" stopColor="var(--color-brand-500)" />
                  <stop offset="100%" stopColor="var(--color-accent-400)" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="37"
                fill="none"
                stroke="url(#vision-ring)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* The hub the five point at. Hidden below lg, where the ring is. */}
            <li
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 hidden size-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-subtle text-center lg:grid"
            >
              <span>
                <span className="block font-mono text-[10px] tracking-[0.22em] text-brand-600 uppercase">
                  Our Vision
                </span>
                <span className="mt-2 block font-display text-lg leading-tight font-bold tracking-tight text-ink">
                  Future-ready
                  <br />
                  by 2030
                </span>
              </span>
            </li>

            {VISION_POINTS.map((point) => (
              <li
                key={point.body}
                style={{ "--x": point.x, "--y": point.y } as React.CSSProperties}
                className={`grid size-44 place-items-center rounded-full border-4 bg-background p-6 text-center shadow-[0_16px_40px_-18px_rgba(15,23,42,0.5)] sm:size-48 lg:absolute lg:top-[var(--y)] lg:left-[var(--x)] lg:size-48 lg:-translate-x-1/2 lg:-translate-y-1/2 ${point.ring}`}
              >
                <p className="text-[13px] leading-snug font-medium text-ink text-balance">
                  {point.body}
                </p>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-14 max-w-3xl text-center text-xs leading-relaxed text-muted lg:mt-16">
            In the company&apos;s own published words: to help make India a hub
            of well-trained engineers and technical professionals, and to build
            a globally trusted name in software and services.
          </p>
        </Container>
      </section>

      {/* The lightest of the page's surfaces, which also gives the dark CTA
          below it a clean edge to start against. */}
      <section className="bg-subtle py-20 lg:py-28">
        <Container className="text-center">
          <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
            Our Future
          </p>

          <h2
            data-reveal
            suppressHydrationWarning
            className="mx-auto mt-5 max-w-3xl font-display text-3xl leading-[1.1] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
          >
            From learning technology to creating technology.
          </h2>

          <p
            data-reveal
            suppressHydrationWarning
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted lg:text-lg"
          >
            The catalogue will keep moving with the field — AI, cloud, cyber
            security, data science, automation, and whatever follows them. A
            student who finishes here should be able to keep up with that on
            their own.
          </p>
        </Container>
      </section>

      <Cta />
    </main>
  )
}

