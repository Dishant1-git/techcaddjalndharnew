"use client"

import { useEffect, useState } from "react"
import { Captcha, type CaptchaValue } from "./captcha"

/** How long the thank-you holds before the form returns. */
const THANK_YOU_MS = 6000

/**
 * The enquiry form on /contact.
 *
 * Posts to the same /api/enquiry endpoint as the course-page form and the
 * popup, tagged `contact` so the three are distinguishable in the CMS. It does
 * not re-implement any of the validation, rate limiting or captcha checking —
 * the server owns all of that, and a second copy would be a second thing to
 * keep in step.
 *
 * The course field is a select rather than free text on purpose: the API
 * rejects any course name that is not in the catalogue, so a typed answer
 * would bounce with an error the visitor could not act on.
 *
 * Options are passed in from the server page so the whole course catalogue
 * does not have to ship in the client bundle to render a dropdown.
 */
export function ContactForm({
  options,
}: {
  options: { group: string; labels: string[] }[]
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string | null>(null)
  const [captcha, setCaptcha] = useState<CaptchaValue | null>(null)
  const [resetSignal, setResetSignal] = useState(0)

  // Kept in state so the digits can be filtered as they are typed — people
  // paste numbers with +91, spaces and dashes, and the pattern would reject
  // them without explaining why.
  const [phone, setPhone] = useState("")

  // A solved token is spent server-side, so clearing the answer is not enough
  // — the component has to fetch a new question.
  const resetCaptcha = () => {
    setCaptcha(null)
    setResetSignal((n) => n + 1)
  }

  // The thank-you is a moment, not a dead end: the form returns so a visitor
  // can ask about a second course, with a fresh question — the spent token
  // cannot be submitted twice.
  useEffect(() => {
    if (status !== "done") return
    const timer = window.setTimeout(() => {
      setStatus("idle")
      resetCaptcha()
    }, THANK_YOU_MS)
    return () => window.clearTimeout(timer)
  }, [status])

  /* Only that a question has loaded and an answer has been typed — whether it
     is the right answer is the server's call, never this one's. */
  const verified = Boolean(captcha)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!verified || status === "sending") return

    const data = new FormData(event.currentTarget)
    setStatus("sending")
    setError(null)

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "contact",
          name: data.get("name"),
          phone: data.get("phone"),
          course: data.get("course"),
          message: data.get("message"),
          source: "contact-page",
          captchaToken: captcha?.token,
          captchaAnswer: captcha?.answer,
        }),
      })

      if (res.ok) {
        setStatus("done")
        return
      }

      const payload = await res.json().catch(() => ({}))
      setError(payload.error ?? "Something went wrong. Please try again.")
      setStatus("idle")
      // Any rejection burns the token, so the box has to be re-ticked.
      resetCaptcha()
    } catch {
      setError("Could not reach the server. Please try again.")
      setStatus("idle")
    }
  }

  if (status === "done") {
    return (
      <div className="grid min-h-[28rem] place-items-center rounded-3xl border border-line bg-white p-8 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)]">
        <div>
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
              <path
                d="m6 12.5 4 4 8-9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="mt-5 font-display text-2xl font-bold tracking-tight">
            Thank you — we have it.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            A counsellor will call you during working hours. If it is urgent,
            calling us is always faster than waiting for a callback.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-line bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] sm:p-8"
    >
      <h2 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
        Send an enquiry
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Four fields. We reply by phone, usually the same working day.
      </p>

      <div className="mt-7 grid gap-x-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="cf-name">
          <input
            id="cf-name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            placeholder="Full name"
            className={INPUT}
          />
        </Field>

        <Field label="Phone number" htmlFor="cf-phone">
          <input
            id="cf-phone"
            name="phone"
            required
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            autoComplete="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="10-digit mobile"
            className={INPUT}
          />
        </Field>
      </div>

      <Field label="Which course?" htmlFor="cf-course">
        <div className="relative">
          <select
            id="cf-course"
            name="course"
            required
            defaultValue=""
            /* appearance-none so the chevron below sits where the design wants
               it; the right padding reserves that space. */
            className={`${INPUT} appearance-none pr-11`}
          >
            <option value="" disabled>
              Select a course
            </option>
            {options.map(({ group, labels }) => (
              <optgroup key={group} label={group}>
                {labels.map((label) => (
                  <option key={`${group}-${label}`} value={label}>
                    {label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-4">
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </Field>

      <Field label="Your message" htmlFor="cf-message" optional>
        <textarea
          id="cf-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Batch timings, fees, eligibility — anything you want to know"
          className={`${INPUT} resize-y`}
        />
      </Field>

      <div className="mb-4">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          Security check
        </span>
        <Captcha
          onChange={setCaptcha}
          resetSignal={resetSignal}
          tone="light"
          inputClassName={INPUT}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!verified || status === "sending"}
        className="w-full rounded-full bg-brand-600 px-6 py-4 text-sm font-bold tracking-wide text-white uppercase shadow-[0_14px_34px_-12px_rgba(37,99,235,0.9)] transition-colors duration-300 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>

      <p className="mt-4 text-center text-xs leading-relaxed text-muted">
        We never share your number, and we do not add you to a mailing list.
      </p>
    </form>
  )
}

const INPUT =
  "w-full rounded-xl border border-line bg-subtle px-4 py-3 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted/70 focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/25"

function Field({
  label,
  htmlFor,
  optional = false,
  children,
}: {
  label: string
  htmlFor: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-foreground"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted">Optional</span>
        )}
      </label>
      {children}
    </div>
  )
}
