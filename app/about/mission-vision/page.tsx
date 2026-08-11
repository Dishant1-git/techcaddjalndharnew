import type { Metadata } from "next"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { HeroVideo } from "@/components/hero-video"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Mission and Vision",
  description:
    "techcadd's mission is to bridge education with industry through accessible technology, practical exposure and industry-ready skills — and its vision, to help build India's future-ready technology workforce.",
  alternates: { canonical: `${SITE.url}/about/mission-vision` },
}

const MISSION_POINTS = [
  {
    title: "Make Technology Accessible",
    body: "Provide learners with relevant and accessible technology education.",
  },
  {
    title: "Prioritize Practical Learning",
    body: "Go beyond theory through projects, hands-on training, and real-world exposure.",
  },
  {
    title: "Build Industry-Ready Talent",
    body: "Develop skills that align with evolving industry requirements and employment opportunities.",
  },
  {
    title: "Encourage Continuous Upskilling",
    body: "Help learners adapt to emerging technologies and continuously upgrade their capabilities.",
  },
  {
    title: "Expand the Learning Ecosystem",
    body: "Build a wider network through centres and collaborations so advanced technology education reaches more learners.",
  },
]

/**
 * The five vision points, each with the position it takes on the wave.
 *
 * `x`/`y` are percentages of the timeline box and are used twice — once to
 * place the node, once to draw the path through it — so the curve and the
 * circles can never drift apart. Odd nodes ride the crest, even ones the
 * trough.
 */
const VISION_POINTS = [
  { x: "10%", y: "34%", crest: true, ring: "border-brand-700", body: "Creating future-ready technology professionals" },
  { x: "30%", y: "66%", crest: false, ring: "border-brand-600", body: "Promoting practical and industry-oriented education" },
  { x: "50%", y: "34%", crest: true, ring: "border-brand-500", body: "Encouraging innovation and continuous learning" },
  { x: "70%", y: "66%", crest: false, ring: "border-accent-500", body: "Supporting India's digital transformation" },
  { x: "90%", y: "34%", crest: true, ring: "border-accent-400", body: "Building a trusted name in software, services, and technology education" },
]

/** The same five coordinates as a smooth curve, plus a tail at each end. */
const WAVE_PATH =
  "M2,66 C6,66 6,34 10,34 C18,34 22,66 30,66 C38,66 42,34 50,34 C58,34 62,66 70,66 C78,66 82,34 90,34 C94,34 94,66 98,66"

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
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Bridging Education with Industry
            </h2>

            <p
              data-reveal
              className="mt-5 text-base leading-relaxed text-muted lg:text-lg"
            >
              Our mission is to build a strong training ecosystem where learners
              can access advanced technology, practical exposure, and
              industry-relevant skills that prepare them for real-world
              opportunities.
            </p>
          </div>

          {/*
            Horizontal timeline. Each item is a three-row grid — space above, the
            rail crossing, space below — and the node is placed into row 1 or
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
              const number = String(index + 1).padStart(2, "0")

              return (
                <li
                  key={point.title}
                  data-reveal
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
                      className={`grid size-16 shrink-0 place-items-center rounded-full font-display text-xl font-bold text-white lg:size-20 lg:text-2xl ${
                        above
                          ? "bg-ink shadow-[0_18px_40px_-16px_rgba(42,44,94,0.9)] ring-6 ring-ink/10"
                          : "bg-brand-600 shadow-[0_18px_40px_-16px_rgba(37,99,235,0.9)] ring-6 ring-brand-600/15"
                      }`}
                    >
                      {number}
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
            This direction is consistent with TechCADD&apos;s publicly stated
            mission of developing a national and international network through
            franchise centres and providing qualitative advanced technology with
            practical exposure to improve employability.
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
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Building India&apos;s Future-Ready Technology Workforce
            </h2>

            <p
              data-reveal
              className="mt-5 text-base leading-relaxed text-muted lg:text-lg"
            >
              techcadd envisions contributing to an India where skilled
              engineers, technology professionals, and digitally capable young
              people are prepared to participate confidently in the evolving
              technology economy.
            </p>
          </div>

          {/*
            Serpentine chain. The curve is one SVG path stretched over the box
            with `preserveAspectRatio="none"`, and the nodes are placed at the
            same percentages the path is drawn through — so the circles sit on
            the line by construction rather than by nudging. `non-scaling-stroke`
            keeps the ribbon an even thickness despite that stretch.

            Each item is a zero-height anchor sitting exactly on its point of the
            curve, with the circle centred on it and the label hung off it. The
            label always goes on the *outside* of the wave — above a crest,
            below a trough — because the inside is where the curve is heading
            next, and text put there is written straight through by the line.

            Below `lg` the curve is dropped and the five simply stack: a wave
            across a phone screen would be four circles wide and unreadable.
          */}
          <ol
            data-reveal
            className="relative mt-14 grid gap-y-10 lg:mt-20 lg:block lg:h-[34rem]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 hidden size-full lg:block"
            >
              <defs>
                <linearGradient id="vision-wave" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-brand-700)" />
                  <stop offset="50%" stopColor="var(--color-brand-500)" />
                  <stop offset="100%" stopColor="var(--color-accent-400)" />
                </linearGradient>
              </defs>
              <path
                d={WAVE_PATH}
                fill="none"
                stroke="url(#vision-wave)"
                strokeWidth="10"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {VISION_POINTS.map((point, index) => (
              <li
                key={point.body}
                style={
                  {
                    "--x": point.x,
                    "--y": point.y,
                  } as React.CSSProperties
                }
                className="flex flex-col items-center text-center lg:absolute lg:top-[var(--y)] lg:left-[var(--x)] lg:block lg:h-0 lg:w-52 lg:-translate-x-1/2"
              >
                <span
                  className={`grid size-20 shrink-0 place-items-center rounded-full border-6 bg-background font-display text-xl font-bold tracking-tight text-ink shadow-[0_16px_40px_-18px_rgba(15,23,42,0.5)] lg:absolute lg:top-0 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 ${point.ring}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* 3.5rem clears the circle's 2.5rem radius with a rem to
                    spare, measured from the point on the curve either way. */}
                <div
                  className={
                    point.crest
                      ? "lg:absolute lg:bottom-14 lg:left-0 lg:w-full"
                      : "lg:absolute lg:top-14 lg:left-0 lg:w-full"
                  }
                >
                  <span className="mt-4 block font-mono text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase lg:mt-0">
                    Vision {String(index + 1).padStart(2, "0")}
                  </span>

                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mx-auto mt-14 max-w-3xl text-center text-xs leading-relaxed text-muted lg:mt-16">
            The organization&apos;s publicly stated vision is to help make India
            a hub of well-trained engineers and technical professionals and
            establish a globally trusted name in software and services.
          </p>
        </Container>
      </section>

      <section data-cursor="light" className="bg-ink py-20 text-white lg:py-28">
        <Container className="text-center">
          <p className="font-mono text-xs tracking-[0.22em] text-accent-400 uppercase">
            Our Future
          </p>

          <h2
            data-reveal
            className="mx-auto mt-5 max-w-3xl font-display text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl"
          >
            From learning technology to creating technology.
          </h2>

          <p
            data-reveal
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg"
          >
            techcadd aims to keep evolving with emerging fields such as
            Artificial Intelligence, Cloud Computing, Cyber Security, Data
            Science, Automation and other future-facing technologies, helping
            learners stay relevant in a rapidly changing digital world.
          </p>
        </Container>
      </section>

      <Cta />
    </main>
  )
}

