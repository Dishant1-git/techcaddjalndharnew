import { Container } from "./container"
import { STATS, type Stat } from "@/lib/stats"

/**
 * Four thin brand rings, each with a dot travelling its circumference.
 *
 * The dot is parked at 12 o'clock inside a wrapper that spins the whole ring
 * box — rotating the box carries the dot around the circle for free, which is
 * the same trick the technology orbit uses. Durations and negative delays come
 * from the data so no two dots are ever in phase.
 */
export function Stats() {
  return (
    <section id="stats" className="py-20 lg:py-28">
      <Container>
        <div
          data-reveal
          suppressHydrationWarning
          className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-2 lg:py-12"
        >
          {STATS.map((stat) => (
            <Ring key={stat.label} stat={stat} />
          ))}
        </div>
      </Container>
    </section>
  )
}

function Ring({ stat }: { stat: Stat }) {
  return (
    <div
      className={`relative mx-auto aspect-square w-full ${stat.size} ${stat.lift} transition-transform duration-500`}
    >
      {/* Thin outer ring — the track the dot rides. */}
      <div className="absolute inset-0 rounded-full border border-brand-600/45" />

      {/* Filled disc, inset so the ring stays visible around it. */}
      <div className="absolute inset-[7%] grid place-items-center rounded-full bg-subtle px-6 text-center">
        <div>
          <p className="font-display text-4xl leading-none font-bold tracking-tight lg:text-5xl">
            {stat.value}
          </p>
          <p className="mt-3 text-sm leading-snug text-muted lg:text-base">
            {stat.label}
          </p>
        </div>
      </div>

      {/* Travelling dot. */}
      <div
        aria-hidden="true"
        className="orbit-cw pointer-events-none absolute inset-0"
        style={{
          "--orbit-duration": stat.duration,
          animationDelay: stat.offset,
        } as React.CSSProperties}
      >
        <span className="absolute top-0 left-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-500/25">
          <span className="size-2 rounded-full bg-brand-600 shadow-[0_0_10px_2px_rgba(37,99,235,0.6)]" />
        </span>
      </div>
    </div>
  )
}
