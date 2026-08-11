"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { COURSE_GROUPS, CONTACT } from "@/lib/navigation"

/** Fires the popup from anywhere — the header button dispatches this. */
export const ENQUIRY_EVENT = "techcadd:enquiry"

/** Seconds on the page before the popup offers itself. */
const AUTO_OPEN_MS = 30_000

/** Scroll depth that counts as "actually reading" rather than bouncing. */
const SCROLL_TRIGGER_PX = 200

/** Marks the auto-open as spent, so it never nags twice in one session. */
const SESSION_KEY = "techcadd:enquiry-seen"

type Challenge = { token: string; question: string }

export function EnquiryPopup() {
  const [open, setOpen] = useState(false)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  /** The question comes from the server; only it knows the answer. */
  const loadChallenge = useCallback(async () => {
    setChallenge(null)
    try {
      const res = await fetch("/api/captcha", { cache: "no-store" })
      if (res.ok) setChallenge(await res.json())
    } catch {
      // Leaves the field disabled with its retry button showing.
    }
  }, [])

  const show = useCallback(() => {
    setError(null)
    setStatus("idle")
    setOpen(true)
    void loadChallenge()
  }, [loadChallenge])

  // --- Auto-open: 30s in, but only once the visitor has scrolled ---
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    let scrolled = window.scrollY > SCROLL_TRIGGER_PX
    let elapsed = false

    const fire = () => {
      if (!scrolled || !elapsed) return
      sessionStorage.setItem(SESSION_KEY, "1")
      show()
    }

    const onScroll = () => {
      if (window.scrollY <= SCROLL_TRIGGER_PX) return
      scrolled = true
      fire()
      window.removeEventListener("scroll", onScroll)
    }

    const timer = window.setTimeout(() => {
      elapsed = true
      fire()
    }, AUTO_OPEN_MS)

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [show])

  // --- Manual open from the header button ---
  useEffect(() => {
    const onRequest = () => {
      sessionStorage.setItem(SESSION_KEY, "1")
      show()
    }
    window.addEventListener(ENQUIRY_EVENT, onRequest)
    return () => window.removeEventListener(ENQUIRY_EVENT, onRequest)
  }, [show])

  // --- Escape, scroll lock, and initial focus ---
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (!open) return null

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
          // Tags the row's form_type; the server maps the key to its label.
          form: "popup",
          course: data.get("course"),
          name: data.get("name"),
          phone: data.get("phone"),
          source: window.location.pathname,
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
      // A spent or wrong challenge is never reusable, so replace it.
      if (payload.captcha) void loadChallenge()
    } catch {
      setError("Could not reach the server. Please try again.")
      setStatus("idle")
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-90 grid place-items-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        // Only a click that both starts and ends on the backdrop closes it,
        // so a drag that ends outside the dialog does not dismiss the form.
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-title"
        data-cursor="light"
        className="animate-menu-in relative grid w-full max-w-4xl overflow-hidden rounded-[1.75rem] text-white shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] md:grid-cols-2"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full border border-white/40 text-white transition-colors duration-300 hover:bg-white hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* --- Pitch --- */}
        <div className="relative isolate bg-ink p-7 sm:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-20 -z-10 size-80 rounded-full bg-brand-600/35 blur-[90px]"
          />

          <h2
            id="enquiry-title"
            className="font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl"
          >
            <span aria-hidden="true" className="animate-wave">
              👋
            </span>{" "}
            Still exploring? Let us help
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Talk to a counsellor and we&apos;ll map the shortest route from
            where you are to the job you want.
          </p>

          <figure className="mt-7 rounded-2xl border border-white/12 bg-white/5 p-5">
            <blockquote className="text-base leading-relaxed">
              &ldquo;AI is the new electricity for modern computing.&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white/80"
              >
                <svg viewBox="0 0 24 24" fill="none" className="size-5">
                  <path
                    d="M8 8h8v8H8V8Zm2-4v2m4-2v2m-6 14v2m4-2v2M4 10h2m-2 4h2m12-4h2m-2 4h2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-bold">Jensen Huang</span>
                <span className="block text-xs text-white/55">
                  CEO, NVIDIA Corporation
                </span>
              </span>
            </figcaption>
          </figure>

          <div className="mt-7 flex items-center justify-between gap-4 rounded-2xl bg-white/90 px-5 py-4 text-ink">
            <span className="flex items-center gap-2.5">
              <GoogleMark />
              <span className="inline-flex items-center gap-1.5 text-sm font-bold">
                Google Verified
                <VerifiedBadge />
              </span>
            </span>
            <span className="flex gap-0.5" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  className="size-4 fill-amber-500"
                  aria-hidden="true"
                >
                  <path d="m12 17.27 5.18 3.13-1.37-5.89 4.57-3.96-6.02-.52L12 4.5 9.64 10.03l-6.02.52 4.57 3.96-1.37 5.89L12 17.27Z" />
                </svg>
              ))}
            </span>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-white/55">
            You can also share your requirements at{" "}
            <a
              href={CONTACT.emailHref}
              className="font-medium text-white underline underline-offset-2"
            >
              {CONTACT.email}
            </a>
            , and our team will get back to you right away.
          </p>
        </div>

        {/* --- Form --- */}
        <form
          onSubmit={onSubmit}
          className="bg-linear-to-br from-brand-700 via-brand-600 to-violet-700 p-7 sm:p-9"
        >
          {status === "done" ? (
            <div className="flex h-full flex-col justify-center py-12 text-center">
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
              <p className="mt-5 font-display text-2xl font-bold tracking-tight">
                Thank you!
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/80">
                Your enquiry is in. A counsellor will call you within 5 minutes
                during working hours.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mx-auto mt-7 rounded-full bg-white px-7 py-3 text-sm font-bold text-ink transition-colors duration-300 hover:bg-brand-50"
              >
                Close
              </button>
            </div>
          ) : (
            <>
          <p className="pr-10 text-base font-bold sm:text-lg">
            Tell us your goal. We&apos;ll code it into reality.
          </p>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <select
                name="course"
                required
                defaultValue=""
                aria-label="Course of interest"
                className="w-full appearance-none rounded-xl border border-white/25 bg-white/10 px-5 py-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <option value="" disabled className="text-ink">
                  Select Your Course of Interest*
                </option>
                {COURSE_GROUPS.map((group) => (
                  <optgroup key={group.title} label={group.title} className="text-ink">
                    {group.items.map((c) => (
                      <option key={c.href} value={c.label} className="text-ink">
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-5 size-4 -translate-y-1/2"
              >
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Full Name*"
              aria-label="Full name"
              className="w-full rounded-xl border border-white/25 bg-white/10 px-5 py-4 text-sm text-white outline-none placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/70"
            />

            <input
              name="phone"
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              autoComplete="tel"
              placeholder="Contact Number (10 Digits)*"
              aria-label="Contact number"
              className="w-full rounded-xl border border-white/25 bg-white/10 px-5 py-4 text-sm text-white outline-none placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/70"
            />
          </div>

          <div className="mt-5 flex items-center gap-2">
            <p className="text-sm font-medium">
              Security verification check:{" "}
              {challenge ? (
                <span className="font-bold tabular-nums">{challenge.question}</span>
              ) : (
                <span className="text-white/60">loading…</span>
              )}
            </p>
            <button
              type="button"
              onClick={() => void loadChallenge()}
              aria-label="Get a new verification question"
              className="grid size-7 shrink-0 place-items-center rounded-full border border-white/30 transition-colors duration-300 hover:bg-white/15"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden="true">
                <path
                  d="M20 12a8 8 0 1 1-2.7-6M20 4v5h-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <input
            name="captcha"
            required
            disabled={!challenge}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Enter your math answer*"
            aria-label="Answer to the verification question"
            aria-invalid={Boolean(error)}
            className="mt-2 w-full rounded-xl border border-white/25 bg-white/10 px-5 py-4 text-sm text-white outline-none placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-60"
          />
          {error && (
            <p role="alert" className="mt-2 text-xs font-medium text-amber-200">
              {error}
            </p>
          )}

          <p className="mt-5 flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-ink">
            <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path
                d="m8 12.5 2.5 2.5L16 9.5"
                stroke="#d9f99d"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Expert response within 5 minutes.
          </p>

          <button
            type="submit"
            disabled={!challenge || status === "sending"}
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-ink transition-colors duration-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Submit"}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path
                d="M5 12h14m-7-7 7 7-7 7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

/**
 * Google's four-colour "G". Drawn inline rather than pulled from simple-icons,
 * which distributes it as a single monochrome path — a one-colour G reads as a
 * generic letter and loses the recognition the badge depends on.
 */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

/**
 * Google's own `verified` mark from Material Symbols — the twelve-point
 * scalloped badge, not an approximation of it.
 *
 * The single Material path carries the tick as a reverse-wound subpath, which
 * relies on the fill rule to knock it out. Drawing the tick separately in
 * white is equivalent and cannot be broken by a renderer's winding choice.
 */
function VerifiedBadge() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        fill="#1a73e8"
        d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z"
      />
      <path
        fill="#ffffff"
        d="M10.09 16.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"
      />
    </svg>
  )
}
