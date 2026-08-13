import Link from "next/link"
import { CapabilityTabs } from "./capability-tabs"
import { Container } from "./container"
import { PanelTexture } from "./panel-texture"
import { ScrollHeading } from "./scroll-heading"
import { CAPABILITIES } from "@/lib/capabilities"
import { capabilityHref } from "@/lib/capability-links"
import type { Tech } from "@/lib/technologies"

export function Capabilities() {
  return (
    <section
      id="capabilities"
      data-cursor="light"
      className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28"
    >
      <PanelTexture />

      <Container className="relative">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            Capabilities
          </span>

          <ScrollHeading
            lines={["Best-in-class technology,", "engineered into your solution"]}
            className="mt-6 font-display text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-5xl"
          />
        </div>

        <div data-reveal suppressHydrationWarning className="mt-10 lg:mt-12">
          <CapabilityTabs
            labels={CAPABILITIES.map((c) => c.label)}
            blurbs={CAPABILITIES.map((c) => c.blurb)}
          >
            {CAPABILITIES.map((capability) => (
              <div
                key={capability.id}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
              >
                {capability.items.map((tech) => (
                  <TechCard
                    key={`${capability.id}-${tech.name}`}
                    tech={tech}
                    href={capabilityHref(tech.name, capability.id)}
                  />
                ))}
              </div>
            ))}
          </CapabilityTabs>
        </div>

        {/* Sends the panel somewhere. Six tabs of logos raise the question
            "what can I actually study here", and until now nothing answered
            it. Bottom-right so it reads as the end of the block rather than
            competing with the heading. */}
        <div data-reveal suppressHydrationWarning className="mt-10 flex justify-end">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 py-2 pr-2 pl-7 text-sm font-semibold text-white backdrop-blur-md transition-colors duration-300 hover:border-white/40 hover:bg-white/20"
          >
            Learn more
            <span className="grid size-9 place-items-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:translate-x-0.5">
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
      </Container>
    </section>
  )
}

function TechCard({ tech, href }: { tech: Tech; href: string }) {
  return (
    <Link
      href={href}
      /* Twelve logos per tab across six tabs — prefetching all seventy-two on
         viewport entry would swamp the homepage. */
      prefetch={false}
      aria-label={`${tech.name} — see the course`}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-3 py-6 text-center transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Decorative now: the link's aria-label already names the tool, so a
          second label here would read it out twice. */}
      {tech.path ? (
        <svg
          viewBox="0 0 24 24"
          className="size-8"
          fill={`#${tech.hex}`}
          aria-hidden="true"
        >
          <path d={tech.path} />
        </svg>
      ) : (
        <span
          className="grid size-8 place-items-center font-display text-base font-bold tracking-tight"
          style={{ color: `#${tech.hex}` }}
          aria-hidden="true"
        >
          {tech.mono}
        </span>
      )}

      <span className="text-sm font-medium text-foreground">{tech.name}</span>
    </Link>
  )
}
