import { AsciiOrb } from "./ascii-orb"
import { GridOverlay } from "./grid-overlay"

/** The word that animates in letter-by-letter, as in the Optimus hero. */
const ANIMATED_WORD = "ships"

const STATS = [
  { value: "18+", label: "years building & training", source: "TECHCADD" },
  { value: "25,000+", label: "engineers trained", source: "ACADEMY" },
  { value: "500+", label: "hiring partners", source: "PLACEMENTS" },
  { value: "120+", label: "projects delivered", source: "ENGINEERING" },
]

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden pt-20">
      {/* Rotating ASCII sphere, bleeding off the right edge. */}
      <div className="pointer-events-none absolute top-1/2 right-0 h-[560px] w-[560px] -translate-y-1/2 translate-x-1/5 opacity-70 sm:translate-x-0 lg:h-[820px] lg:w-[820px]">
        <AsciiOrb />
      </div>

      <GridOverlay />

      <div className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <div className="reveal mb-8">
            <span className="inline-flex items-center gap-3 font-mono text-sm text-muted">
              <span className="h-px w-8 bg-foreground/30" />
              The IT platform for modern teams
            </span>
          </div>

          <div className="mb-12">
            <h1 className="reveal font-display text-[clamp(3rem,12vw,10rem)] leading-[0.9] font-semibold tracking-tight [animation-delay:100ms]">
              <span className="block">Technology</span>
              <span className="block">
                that{" "}
                <span className="relative inline-block">
                  <span className="inline-flex">
                    {ANIMATED_WORD.split("").map((char, i) => (
                      <span
                        key={`${char}-${i}`}
                        className="animate-char-in inline-block text-brand-600"
                        style={{ animationDelay: `${450 + i * 55}ms` }}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                  <span className="absolute -bottom-2 left-0 right-0 h-3 bg-brand-600/12" />
                </span>
              </span>
            </h1>
          </div>

          <div className="grid items-end gap-12 lg:grid-cols-2 lg:gap-24">
            <p className="reveal max-w-xl text-xl leading-relaxed text-muted [animation-delay:250ms] lg:text-2xl">
              TechCadd builds the AI, cloud and full-stack systems businesses run
              on — and trains the engineers who run them. One team, from the first
              line of code to production.
            </p>

            <div className="reveal flex flex-col items-start gap-4 [animation-delay:350ms] sm:flex-row">
              <a
                href="/enquiry"
                className="group inline-flex h-14 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors duration-300 hover:bg-brand-600"
              >
                Start your project
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14m-7-7 7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href="/courses"
                className="inline-flex h-14 items-center justify-center rounded-full border border-foreground/20 bg-background/60 px-8 text-base font-medium backdrop-blur-sm transition-colors duration-300 hover:bg-foreground/5"
              >
                Explore courses
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats marquee */}
      <div className="reveal relative z-10 shrink-0 overflow-hidden pb-10 [animation-delay:500ms] lg:pb-12">
        <div className="marquee flex w-max gap-16 whitespace-nowrap">
          {[0, 1].map((track) => (
            <div key={track} className="flex gap-16" aria-hidden={track === 1}>
              {STATS.map((s) => (
                <div key={s.value} className="flex items-baseline gap-4">
                  <span className="font-display text-4xl font-semibold lg:text-5xl">
                    {s.value}
                  </span>
                  <span className="text-sm text-muted">
                    {s.label}
                    <span className="mt-1 block font-mono text-xs tracking-wide">
                      {s.source}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
