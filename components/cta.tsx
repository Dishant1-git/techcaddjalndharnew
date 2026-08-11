import { Fragment } from "react"
import { Container } from "./container"
import { ScrollHeading } from "./scroll-heading"
import { CONTACT } from "@/lib/navigation"

/** Reassurances under the form — the objections counsellors hear most. */
const ASSURANCES = [
  "Free career counselling",
  "No registration fee",
  "Placement support included",
]

/**
 * Closing call to action.
 *
 * The email field is a plain GET form pointing at /contact, so a submission
 * carries the address through as a query param and the counselling form picks
 * it up. Nothing here pretends to be a signup endpoint, and it works without
 * JavaScript.
 */
export function Cta() {
  return (
    <section
      id="cta"
      data-cursor="light"
      /* Flat `ink` — the same panel navy the dark sections sit on. Deliberately
         one solid colour: no gradient, no corner glows and no PanelTexture, so
         it reads as a plain block of brand colour. */
      className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28"
    >

      <Container className="text-center">
        <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold tracking-[0.22em] text-accent-400 uppercase">
          Ready to get started?
        </p>

        <ScrollHeading
          lines={["Start building your", "career today."]}
          className="mt-5 font-display text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
        />

        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/70 lg:text-lg">
          Talk to a counsellor today. One call is usually enough to know which
          track fits your degree, your schedule and the job you want.
        </p>

        <div
          data-reveal
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href={CONTACT.phoneHref}
            className="group inline-flex items-center gap-3 rounded-full bg-brand-600 py-3 pr-8 pl-3 text-white shadow-[0_20px_45px_-18px_rgba(37,99,235,0.9)] transition-colors duration-300 hover:bg-brand-700"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/20">
              {/* Reuses .animate-wave so the shake is covered by the same
                  prefers-reduced-motion rule as the hand. */}
              <PhoneIcon className="animate-wave size-5" />
            </span>
            <span className="text-left">
              <span className="block text-[11px] font-medium tracking-[0.14em] text-white/70 uppercase">
                Call now
              </span>
              <span className="block font-display text-lg font-bold tracking-tight">
                {CONTACT.phone}
              </span>
            </span>
          </a>

          {/* Glass rather than the solid white it was: two filled buttons side
              by side on navy compete, where an outline lets the blue lead. */}
          <a
            href="/contact"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur-md transition-colors duration-300 hover:border-white/40 hover:bg-white/20"
          >
            Book a free demo
          </a>
        </div>

        <ul className="mt-10 flex flex-col items-center justify-center gap-3 text-sm text-white/70 sm:flex-row sm:gap-5">
          {ASSURANCES.map((item, i) => (
            <Fragment key={item}>
              {/* Separator as its own item — nesting it would need
                  display:contents on the <li>, which drops list semantics. */}
              {i > 0 && (
                <li
                  aria-hidden="true"
                  className="hidden h-4 w-px bg-white/20 sm:block"
                />
              )}
              <li className="inline-flex items-center gap-2">
                <CheckIcon className="size-4 shrink-0 text-accent-400" />
                {item}
              </li>
            </Fragment>
          ))}
        </ul>
        </div>
      </Container>
    </section>
  )
}

/**
 * Handset with signal arcs. The arcs are separate paths so they can be given
 * their own opacity — a solid handset with faint waves reads as "ringing"
 * where a uniform outline just reads as a phone.
 */
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M16.9 21c-1.9 0-3.9-.5-5.9-1.6a20.6 20.6 0 0 1-6.4-5.4A19.5 19.5 0 0 1 1.5 7c-.2-1 0-1.9.6-2.6l2-2.1c.5-.5 1.3-.5 1.8 0l2.6 2.7c.5.5.5 1.3 0 1.8L7.1 8.3c.5 1 1.2 2 2 2.9.9.9 1.9 1.6 3 2.2l1.4-1.5c.5-.5 1.3-.5 1.8 0l2.6 2.7c.5.5.5 1.3 0 1.8l-2 2.1c-.5.4-1.2.6-1.9.5Z"
        fill="currentColor"
      />
      <path
        d="M14.5 3.5a6.5 6.5 0 0 1 6 6M14 7.2a3 3 0 0 1 2.8 2.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m8.25 12.25 2.5 2.5 5-5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
