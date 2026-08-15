"use client"

import { useEffect, useState } from "react"
import { Captcha, type CaptchaValue } from "./captcha"

/** How long the thank-you holds before the form returns. */
const THANK_YOU_MS = 5000

/**
 * The enquiry form embedded in every course page.
 *
 * `course` is fixed by the page and rendered read-only — open the Python page
 * and the enquiry is filed against Python. The value posted comes from this
 * prop rather than the input, and the API re-checks it against the course
 * catalogue, so the lock survives someone editing the DOM.
 *
 * Styling lives in globals.css under "COURSE ENQUIRY FORM".
 */
export function CourseEnquiryForm({
  course,
  source,
}: {
  course: string
  source?: string
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  // The signed challenge and the answer typed against it. Worthless on their
  // own — the server re-derives the sum and checks the signature.
  const [captcha, setCaptcha] = useState<CaptchaValue | null>(null)
  const [resetSignal, setResetSignal] = useState(0)

  // A solved token is spent server-side, so a rejected submission needs a new
  // question, not just a cleared answer.
  const resetCaptcha = () => {
    setCaptcha(null)
    setResetSignal((n) => n + 1)
  }

  // The thank-you is a moment, not a dead end: the form comes back so a
  // visitor can ask about another course. It returns empty, with a fresh
  // question — the spent token cannot be submitted twice.
  useEffect(() => {
    if (status !== "done") return
    const timer = window.setTimeout(() => {
      setStatus("idle")
      setCaptcha(null)
      setResetSignal((n) => n + 1)
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
          // Tags the row's form_type; the server maps the key to its label.
          form: "course",
          name: data.get("name"),
          phone: data.get("phone"),
          // From the prop, never the input — the field is display only.
          course,
          message: data.get("message"),
          source: source ?? `course:${course}`,
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
      // Any rejection burns the token, so the box always has to be re-ticked.
      resetCaptcha()
    } catch {
      setError("Could not reach the server. Please try again.")
      setStatus("idle")
    }
  }

  if (status === "done") {
    return (
      <div className="enquiry-form p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-lime-400 text-ink">
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
        <p className="mt-5 font-display text-xl font-bold tracking-tight">
          Thank you!
        </p>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/70">
          Your enquiry about {course} is in. A counsellor will call you shortly
          during working hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="enquiry-form p-6 sm:p-8">
      {/* Name and phone share a row now that the panel is wider. */}
      <div className="grid gap-x-5 sm:grid-cols-2">
        <Field label="Your Name" htmlFor="ce-name">
          <input
            id="ce-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Enter your full name"
            className={INPUT}
          />
        </Field>

        <Field label="Phone Number" htmlFor="ce-phone">
          <input
            id="ce-phone"
            name="phone"
            required
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            className={INPUT}
          />
        </Field>
      </div>

      <Field label="Course or Service" htmlFor="ce-course">
        <input
          id="ce-course"
          value={course}
          readOnly
          aria-readonly="true"
          tabIndex={-1}
          className={INPUT}
        />
      </Field>

      <Field label="Your Message" htmlFor="ce-message">
        <textarea
          id="ce-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Ask about batch timings, fees or anything else"
          className={`${INPUT} resize-y`}
        />
      </Field>

      <div className="mb-4">
        <span className="enquiry-label">Security Check</span>
        <Captcha
          onChange={setCaptcha}
          resetSignal={resetSignal}
          inputClassName={INPUT}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-amber-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!verified || status === "sending"}
        className="mt-6 w-full rounded-full bg-linear-to-r from-brand-600 to-accent-500 px-6 py-4 text-sm font-bold tracking-wide text-white uppercase shadow-[0_14px_34px_-12px_rgba(37,99,235,0.9)] transition-opacity duration-300 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>

      <p className="mt-4 text-center text-xs text-white/60">
        We never share your number. Expect a call within working hours.
      </p>
    </form>
  )
}

const INPUT = "enquiry-input"

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="enquiry-label">
        {label}
      </label>
      {children}
    </div>
  )
}
