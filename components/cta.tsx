import { Fragment } from "react"

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
      className="relative isolate overflow-hidden px-4 py-24 lg:px-8 lg:py-32"
    >
      {/* Soft blue wash: tinted corners fading into a clear centre so the
          heading never sits on top of a colour edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-linear-to-br from-brand-100 via-brand-50 to-accent-400/25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 -z-10 size-[38rem] rounded-full bg-brand-300/35 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-48 -z-10 size-[36rem] rounded-full bg-accent-400/30 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[46rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-[100px]"
      />

      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold tracking-[0.22em] text-brand-600 uppercase">
          Ready to get started?
        </p>

        <h2 className="mt-5 font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl">
          Start building your career today.
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted lg:text-lg">
          Join the 15,000+ students who trained at TechCadd to learn a real
          skill, build live projects, and get placed with confidence.
        </p>

        <form
          action="/contact"
          method="get"
          className="mx-auto mt-10 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:gap-0 sm:overflow-hidden sm:rounded-xl sm:bg-white sm:shadow-[0_20px_45px_-20px_rgba(42,44,94,0.45)]"
        >
          <label htmlFor="cta-email" className="sr-only">
            Your email address
          </label>
          <input
            id="cta-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email"
            className="min-w-0 flex-1 rounded-xl bg-white px-5 py-4 text-sm text-foreground shadow-[0_20px_45px_-20px_rgba(42,44,94,0.45)] outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand-600 sm:rounded-none sm:shadow-none sm:focus-visible:ring-inset"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-brand-600 px-8 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-700 sm:rounded-none"
          >
            Get started
          </button>
        </form>

        <ul className="mt-10 flex flex-col items-center justify-center gap-3 text-sm text-muted sm:flex-row sm:gap-5">
          {ASSURANCES.map((item, i) => (
            <Fragment key={item}>
              {/* Separator as its own item — nesting it would need
                  display:contents on the <li>, which drops list semantics. */}
              {i > 0 && (
                <li
                  aria-hidden="true"
                  className="hidden h-4 w-px bg-ink/15 sm:block"
                />
              )}
              <li className="inline-flex items-center gap-2">
                <CheckIcon className="size-4 shrink-0 text-brand-600" />
                {item}
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    </section>
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
