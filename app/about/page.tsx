import type { Metadata } from "next"
import { Container } from "@/components/container"
import { SITE } from "@/lib/site"
import { STATS } from "@/lib/stats"

export const metadata: Metadata = {
  title: "About Techcadd — Our Story, Values and Journey",
  description:
    "Techcadd has trained students in Jalandhar since 2007 — CAD, programming, data, cloud and AI. Our story, the values we teach by, and the milestones along the way.",
  alternates: { canonical: `${SITE.url}/about` },
}

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
        {/* Ambient loop. `bg-ink` stays on the section so the panel is the right
            colour before a single frame decodes, and stays right if the file
            never loads. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          /* Same reasoning as the homepage loop: metadata-only, so buffering
             never competes with first paint. */
          preload="metadata"
          aria-hidden="true"
          /* Scaled past the edges so the blur's soft border can't reveal the
             panel behind it. */
          className="pointer-events-none absolute inset-0 size-full scale-105 object-cover blur-[1px]"
        >
          <source src="/assets/video/aboutus-bg.mp4" type="video/mp4" />
        </video>

        {/* Legibility scrim. Content covers this panel edge to edge — headline,
            stats and four timeline cards — so the footage is held right back and
            works as texture. Tinted with `ink` rather than black to keep the
            hero the same colour it was, and deepened at the foot so the section
            still ends on the flat panel colour. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-ink/80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink/60 via-transparent to-ink"
        />

        <Container className="relative">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            About us
          </span>

          {/* Two-tone rather than one weight: the bright phrases carry the
              sentence on their own, so the line reads at a glance and in full. */}
          <h1
            data-reveal
            className="mt-7 max-w-4xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            Learn about <span className="text-white">our people,</span> our story
            and <span className="text-white">how we turn skills into careers.</span>
          </h1>

          {/* Same source as the homepage band — one set of numbers for the whole
              site, so a claim can never drift between two pages. */}
          <dl
            data-reveal
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
    </main>
  )
}
