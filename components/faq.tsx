import { FaqAccordion } from "./faq-accordion"
import { ScrollHeading } from "./scroll-heading"
import { FAQS } from "@/lib/faqs"
import { CONTACT } from "@/lib/navigation"

/** Counsellor avatars — initials on brand gradients, no image assets needed. */
const COUNSELLORS = [
  { initials: "AK", from: "from-brand-600", to: "to-brand-400" },
  { initials: "RS", from: "from-accent-500", to: "to-accent-400" },
  { initials: "MJ", from: "from-ink", to: "to-brand-700" },
]

export function Faq() {
  return (
    <section id="faq" className="px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        {/* --- Left rail --- */}
        <div>
          <ScrollHeading
            lines={["Frequently", "asked questions"]}
            className="font-display text-4xl leading-[1.05] font-bold tracking-tight lg:text-5xl"
          />

          <p className="mt-5 max-w-sm text-base leading-relaxed text-muted">
            Find quick answers to common questions about our courses, batches,
            fees and placement support.
          </p>

          <div data-reveal className="mt-10 rounded-3xl bg-subtle p-8 lg:mt-14">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {COUNSELLORS.map((c) => (
                  <span
                    key={c.initials}
                    aria-hidden="true"
                    className={`grid size-11 place-items-center rounded-full bg-linear-to-br ${c.from} ${c.to} font-display text-sm font-bold text-white ring-3 ring-subtle`}
                  >
                    {c.initials}
                  </span>
                ))}
              </div>

              <span className="text-lg text-muted" aria-hidden="true">
                +
              </span>

              <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white ring-3 ring-subtle">
                You
              </span>
            </div>

            <p className="mt-6 font-display text-xl font-bold tracking-tight">
              Still have questions?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Reach out, and our counsellors will guide you.
            </p>

            <a
              href={CONTACT.phoneHref}
              className="group mt-6 inline-flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-6 text-sm font-semibold text-white shadow-[0_14px_34px_-14px_rgba(42,44,94,0.9)] transition-colors duration-300 hover:bg-brand-600"
            >
              Talk to our team
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
        </div>

        {/* --- Questions --- */}
        <FaqAccordion items={FAQS} />
      </div>
    </section>
  )
}
