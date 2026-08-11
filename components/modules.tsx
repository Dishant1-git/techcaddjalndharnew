import { Container } from "./container"
import { PanelTexture } from "./panel-texture"
import { ScrollHeading } from "./scroll-heading"

/**
 * Modules — what ships with every programme, regardless of which category or
 * intake format a student picks.
 *
 * Rendered as a dark ink panel: it sits between the textured testimonials and
 * the light technologies panel, and the tonal break keeps those two from
 * running together.
 */

type Module = {
  step: string
  title: string
  body: string
  icon: React.ReactNode
}

const MODULES: Module[] = [
  {
    step: "01",
    title: "Industry certificate",
    body: "Issued on completion and verifiable online, recognised by the hiring partners we place through.",
    icon: (
      <path
        d="M7 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4h6M9 11h4m-2 6v3l2.5-1.5L16 20v-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    step: "02",
    title: "Internship letter",
    body: "Every 6-week and 6-month track closes with a documented internship on real client work.",
    icon: (
      <path
        d="M4 7.5h16v12H4v-12Zm0 0L12 13l8-5.5M8.5 7.5v-2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    step: "03",
    title: "Live client projects",
    body: "You ship features out of our actual delivery pipeline — not a toy app copied from a tutorial.",
    icon: (
      <path
        d="M5 5h14v11H5V5Zm0 11-1.5 3h17L19 16M9.5 9l-2 2.5 2 2.5m5-5 2 2.5-2 2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    step: "04",
    title: "Doubt-clearing sessions",
    body: "Daily lab hours with your trainer, plus batch groups that stay active long after the course ends.",
    icon: (
      <path
        d="M4 5.5h16v10H12l-4.5 4v-4H4v-10Zm8 2.5a2 2 0 0 1 1.4 3.4l-1.4 1.1m0 1.6v.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    step: "05",
    title: "Interview preparation",
    body: "Portfolio reviews, aptitude drills and mock interviews scheduled ahead of every placement drive.",
    icon: (
      <path
        d="M12 3.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7 17v-1.5c0-3 3.1-5 7-5s7 2 7 5V20.5M17.5 4l1.2 2.4 2.3.4-1.7 1.7.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.7-1.7 2.3-.4L17.5 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    step: "06",
    title: "Lifetime batch access",
    body: "Re-attend any future batch of the same course free of charge, whenever the syllabus is refreshed.",
    icon: (
      <path
        d="M20 12a8 8 0 1 1-2.7-6M20 4v5h-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
]

export function Modules() {
  return (
    <section
      id="modules"
      data-cursor="light"
      /* overflow-clip, not overflow-hidden: `hidden` makes this element a
         scroll container, which silently disables `position: sticky` on the
         cards inside. `clip` still contains the texture without doing that. */
      className="relative isolate overflow-clip bg-ink py-20 text-white lg:py-28"
    >
      <PanelTexture />

      <Container className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
              Modules
            </span>
            <ScrollHeading
              lines={["Included with every", "programme we run"]}
              className="mt-6 font-display text-4xl leading-[1.05] font-bold tracking-tight lg:text-5xl"
            />
          </div>

          <p className="max-w-sm text-base leading-relaxed text-white/65">
            Whichever category and intake you choose, these six come bundled —
            no upsell, no separate fee.
          </p>
        </div>

        {/*
          Sticky stack. Each card pins a little lower than the one before it,
          so a card scrolling up covers its predecessor while leaving that
          card's top edge visible — the deck grows as you read down.

          The cards must be opaque: a translucent surface would show the card
          underneath and the stack would read as a mess rather than a deck.
          `pb` on the last wrapper gives the final card room to settle before
          the section ends.
        */}
        <div className="mt-12 lg:mt-16">
          {MODULES.map((m, i) => (
            <div
              key={m.step}
              className="sticky"
              style={{ top: `calc(6.5rem + ${i * 1.1}rem)` }}
            >
              <article
                className={`group relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#33366f] p-7 shadow-[0_30px_70px_-30px_rgba(6,10,35,0.95)] transition-colors duration-500 hover:border-white/25 sm:p-9 lg:p-10 ${
                  i === MODULES.length - 1 ? "mb-0" : "mb-6"
                }`}
              >
                {/* Keeps each card from reading as a flat rectangle. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"
                />

                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white transition-colors duration-500 group-hover:bg-white group-hover:text-ink">
                    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
                      {m.icon}
                    </svg>
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs text-white/40">
                      {m.step}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold tracking-tight lg:text-2xl">
                      {m.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65 lg:text-base">
                      {m.body}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
