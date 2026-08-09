import { ScrollHeading } from "./scroll-heading"
import { TechcaddT } from "./techcadd-t"
import { TechTabs } from "./tech-tabs"
import { TECH_CATEGORIES, type Tech } from "@/lib/technologies"

/** Outer ring: 8 chips. Inner ring: the remaining 5. */
const OUTER_COUNT = 8
const OUTER_RADIUS = 41 // % of the square stage
const INNER_RADIUS = 23
const OUTER_DURATION = "48s"
const INNER_DURATION = "34s"

export function Technologies() {
  return (
    <section id="technologies" className="px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[2rem] border border-line/70 bg-linear-to-b from-slate-100 to-slate-50 px-6 py-16 lg:rounded-[2.5rem] lg:px-12 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium tracking-wide">
            Technologies
          </span>

          <ScrollHeading
            lines={["Technologies We Master"]}
            className="mt-6 font-display text-4xl leading-[1.05] font-bold tracking-tight lg:text-6xl"
          />

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted lg:text-lg">
            From <strong className="font-semibold text-foreground">AI</strong> to{" "}
            <strong className="font-semibold text-foreground">Cloud</strong>, from{" "}
            <strong className="font-semibold text-foreground">Web Development</strong>{" "}
            to <strong className="font-semibold text-foreground">CAD/CAM</strong> — we
            train you on the latest and most in-demand technologies to build a
            successful career.
          </p>

          <a
            href="/courses"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-brand-600 py-2 pr-2 pl-7 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.85)] transition-colors duration-300 hover:bg-brand-700"
          >
            Explore all technologies
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
          </a>
        </div>

        <div data-reveal className="mt-14">
          <TechTabs labels={TECH_CATEGORIES.map((c) => c.label)}>
            {TECH_CATEGORIES.map((category) => (
              <Orbit key={category.id} items={category.items} />
            ))}
          </TechTabs>
        </div>

        <div className="mt-4 text-center">
          <p className="font-display text-2xl leading-tight font-bold tracking-tight lg:text-3xl">
            100+ technologies
            <br />
            taught and growing
          </p>
        </div>
      </div>
    </section>
  )
}

function Orbit({ items }: { items: Tech[] }) {
  const outer = items.slice(0, OUTER_COUNT)
  const inner = items.slice(OUTER_COUNT)

  return (
    <div className="orbit-stage relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[440px] lg:max-w-[560px]">
      {/* Faint orbit guides */}
      <Guide radius={OUTER_RADIUS} />
      <Guide radius={INNER_RADIUS} />

      {/* Soft glow behind the hub */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-3xl"
      />

      <Ring
        items={outer}
        radius={OUTER_RADIUS}
        duration={OUTER_DURATION}
        direction="cw"
      />
      <Ring
        items={inner}
        radius={INNER_RADIUS}
        duration={INNER_DURATION}
        direction="ccw"
      />

      {/* Hub */}
      <div className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-foreground shadow-[0_18px_40px_-12px_rgba(15,23,42,0.6)] sm:size-20 lg:size-24">
        <TechcaddT className="h-8 w-auto text-white sm:h-10 lg:h-12" />
        <span className="sr-only">TechCadd</span>
      </div>
    </div>
  )
}

function Guide({ radius }: { radius: number }) {
  const size = radius * 2
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-foreground/10"
      style={{ width: `${size}%`, height: `${size}%` }}
    />
  )
}

function Ring({
  items,
  radius,
  duration,
  direction,
}: {
  items: Tech[]
  radius: number
  duration: string
  direction: "cw" | "ccw"
}) {
  const spin = direction === "cw" ? "orbit-cw" : "orbit-ccw"
  const counter = direction === "cw" ? "orbit-ccw" : "orbit-cw"

  return (
    <div
      className={`absolute inset-0 ${spin}`}
      style={{ "--orbit-duration": duration } as React.CSSProperties}
    >
      {items.map((tech, i) => {
        // Start at 12 o'clock and distribute evenly around the circle.
        const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2
        const left = 50 + radius * Math.cos(angle)
        const top = 50 + radius * Math.sin(angle)

        return (
          <div
            key={`${tech.name}-${i}`}
            className="absolute"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={counter}
              style={{ "--orbit-duration": duration } as React.CSSProperties}
            >
              <Chip tech={tech} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Chip({ tech }: { tech: Tech }) {
  return (
    <div
      title={tech.name}
      className="group grid size-10 place-items-center rounded-full bg-white shadow-[0_6px_18px_-6px_rgba(15,23,42,0.35)] ring-1 ring-foreground/5 transition-transform duration-300 hover:scale-110 sm:size-13 lg:size-14"
    >
      {tech.path ? (
        <svg
          viewBox="0 0 24 24"
          className="size-5 sm:size-6 lg:size-7"
          fill={`#${tech.hex}`}
          role="img"
          aria-label={tech.name}
        >
          <path d={tech.path} />
        </svg>
      ) : (
        <span
          className="font-display text-[11px] font-bold tracking-tight sm:text-xs lg:text-sm"
          style={{ color: `#${tech.hex}` }}
          aria-label={tech.name}
          role="img"
        >
          {tech.mono}
        </span>
      )}
    </div>
  )
}
