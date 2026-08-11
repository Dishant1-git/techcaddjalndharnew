"use client"

import { useCallback, useEffect, useState } from "react"

type Challenge = { token: string; question: string }

/**
 * The enquiry form embedded in every course page.
 *
 * `course` is fixed by the page and rendered read-only — open the Python page
 * and the enquiry is filed against Python. The value posted comes from this
 * prop rather than the input, and the API re-checks it against the course
 * catalogue, so the lock survives someone editing the DOM.
 */
export function CourseEnquiryForm({
  course,
  source,
}: {
  course: string
  source?: string
}) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  const loadChallenge = useCallback(async () => {
    setChallenge(null)
    try {
      const res = await fetch("/api/captcha", { cache: "no-store" })
      if (res.ok) setChallenge(await res.json())
    } catch {
      // Leaves the field disabled with its refresh button showing.
    }
  }, [])

  useEffect(() => {
    void loadChallenge()
  }, [loadChallenge])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!challenge || status === "sending") return

    const data = new FormData(event.currentTarget)
    setStatus("sending")
    setError(null)

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          // From the prop, never the input — the field is display only.
          course,
          message: data.get("message"),
          source: source ?? `course:${course}`,
          captchaToken: challenge.token,
          captchaAnswer: data.get("captcha"),
        }),
      })

      if (res.ok) {
        setStatus("done")
        return
      }

      const payload = await res.json().catch(() => ({}))
      setError(payload.error ?? "Something went wrong. Please try again.")
      setStatus("idle")
      if (payload.captcha) void loadChallenge()
    } catch {
      setError("Could not reach the server. Please try again.")
      setStatus("idle")
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
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
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
          Your enquiry about {course} is in. A counsellor will call you shortly
          during working hours.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] sm:p-8"
    >
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

      <Field label="Course or Service" htmlFor="ce-course">
        <input
          id="ce-course"
          value={course}
          readOnly
          aria-readonly="true"
          tabIndex={-1}
          className={`${INPUT} cursor-not-allowed border-line bg-slate-100 font-medium text-foreground/70`}
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

      <Field
        label={
          challenge
            ? `Security Check: ${challenge.question}`
            : "Security Check: loading…"
        }
        htmlFor="ce-captcha"
      >
        <input
          id="ce-captcha"
          name="captcha"
          required
          disabled={!challenge}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Your answer"
          aria-invalid={Boolean(error)}
          className={`${INPUT} disabled:opacity-60`}
        />
      </Field>

      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!challenge || status === "sending"}
        className="mt-6 w-full rounded-full bg-linear-to-r from-brand-600 to-accent-500 px-6 py-4 text-sm font-bold tracking-wide text-white uppercase shadow-[0_14px_34px_-12px_rgba(37,99,235,0.9)] transition-opacity duration-300 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        We never share your number. Expect a call within working hours.
      </p>
    </form>
  )
}

const INPUT =
  "w-full rounded-xl border border-line bg-subtle px-4 py-3.5 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted/70 focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/20"

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
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-foreground/80"
      >
        {label}
      </label>
      {children}
    </div>
  )
}
