import { CapabilityTabs } from "./capability-tabs"
import { Container } from "./container"
import { PanelTexture } from "./panel-texture"
import { ScrollHeading } from "./scroll-heading"
import { CAPABILITIES } from "@/lib/capabilities"
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

        <div data-reveal className="mt-10 lg:mt-12">
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
                  <TechCard key={`${capability.id}-${tech.name}`} tech={tech} />
                ))}
              </div>
            ))}
          </CapabilityTabs>
        </div>
      </Container>
    </section>
  )
}

function TechCard({ tech }: { tech: Tech }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-3 py-6 text-center transition-transform duration-300 hover:-translate-y-1">
      {tech.path ? (
        <svg
          viewBox="0 0 24 24"
          className="size-8"
          fill={`#${tech.hex}`}
          role="img"
          aria-label={tech.name}
        >
          <path d={tech.path} />
        </svg>
      ) : (
        <span
          className="grid size-8 place-items-center font-display text-base font-bold tracking-tight"
          style={{ color: `#${tech.hex}` }}
          aria-label={tech.name}
          role="img"
        >
          {tech.mono}
        </span>
      )}

      <span className="text-sm font-medium text-foreground">{tech.name}</span>
    </div>
  )
}
