"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Contact } from "@/lib/content"
import { PROMO_OPEN_ATTR } from "./promo-popup"
import { Captcha, type CaptchaValue } from "./captcha"
import { GoogleMark } from "./google-mark"
import { COURSE_GROUPS } from "@/lib/navigation"

/** Fires the popup from anywhere — the header button dispatches this. */
export const ENQUIRY_EVENT = "techcadd:enquiry"

/**
 * Which form sent the visitor here, tagging the row's `form_type`.
 *
 * The popup collects the same fields whoever opened it, so without this every
 * enquiry it files looks like it came from the header button. Keys must exist
 * in FORM_TYPES (lib/enquiries.ts) — the server maps them to the stored label
 * and falls back to "Call Request" for anything it does not recognise.
 */
export type EnquiryOrigin = "popup" | "demo"

/** Seconds on the page before the popup offers itself. */
const AUTO_OPEN_MS = 30_000

/** Scroll depth that counts as "actually reading" rather than bouncing. */
const SCROLL_TRIGGER_PX = 200

/** Marks the auto-open as spent, so it never nags twice in one session. */
const SESSION_KEY = "techcadd:enquiry-seen"

/**
 * Shared by the text fields and the captcha's answer box, so the security
 * check reads as another field in the form rather than something bolted on.
 * `text-base` below `sm` is deliberate: iOS zooms the page on focus for
 * anything under 16px, and a zoomed dialog cannot be scrolled back.
 */
const POPUP_INPUT =
  "w-full rounded-xl border border-white/25 bg-white/10 px-5 py-4 text-base text-white outline-none sm:text-sm placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/70"

export function EnquiryPopup({ contact }: { contact: Contact }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // The signed challenge and the answer typed against it; the token is
  // single-use, so a new question is fetched on every rejection.
  const [captcha, setCaptcha] = useState<CaptchaValue | null>(null)
  /** Seeded by the CTA's phone field when it opens this popup. */
  const [prefillPhone, setPrefillPhone] = useState("")
  /** Reset on every open, so a later auto-open is never mislabelled as a demo. */
  const [origin, setOrigin] = useState<EnquiryOrigin>("popup")
  const [resetSignal, setResetSignal] = useState(0)

  /* Kept from the accepted submission so the confirmation can name the person
     and read the number back to them — the form is unmounted by then, so the
     fields themselves are gone. */
  const [submitted, setSubmitted] = useState<{ name: string; phone: string }>({
    name: "",
    phone: "",
  })

  const resetCaptcha = useCallback(() => {
    setCaptcha(null)
    setResetSignal((n) => n + 1)
  }, [])

  const show = useCallback((from: EnquiryOrigin = "popup") => {
    setOrigin(from)
    setError(null)
    setStatus("idle")
    setOpen(true)
    resetCaptcha()
  }, [resetCaptcha])

  // --- Auto-open: 30s in, but only once the visitor has scrolled ---
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    let scrolled = window.scrollY > SCROLL_TRIGGER_PX
    let elapsed = false

    const fire = () => {
      if (!scrolled || !elapsed) return
      // A promotional overlay may already be up. Two modals would trap focus
      // against each other, so wait rather than spend the one auto-open on a
      // moment nobody can act on — the visitor is still here, and the next
      // scroll or the retry below will catch them.
      if (document.documentElement.hasAttribute(PROMO_OPEN_ATTR)) {
        window.setTimeout(fire, 2000)
        return
      }
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

  // --- Manual open from the header button, or the CTA's phone field ---
  //
  // The CTA sends the number the reader already typed on `detail.phone`, so
  // they are not asked for it twice, and `detail.form` so the row it ends up
  // writing says which form started it. Plain Events carry no detail, which is
  // what the header button still dispatches — hence the optional chains, and
  // why the origin falls back to "popup" rather than trusting what arrives.
  useEffect(() => {
    const onRequest = (e: Event) => {
      const detail = (e as CustomEvent<{ phone?: string; form?: string }>).detail
      if (detail?.phone) setPrefillPhone(detail.phone)
      sessionStorage.setItem(SESSION_KEY, "1")
      show(detail?.form === "demo" ? "demo" : "popup")
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

  /* Only that a question has loaded and an answer has been typed — whether it
     is the right answer is the server's call, never this one's. */
  const verified = Boolean(captcha)

  const done = status === "done"
  const firstName = submitted.name.trim().split(/\s+/)[0] ?? ""
  /* Grouped the way the site prints its own number, so the read-back looks
     like a phone number rather than the ten digits that were typed. */
  const submittedPhone = /^\d{10}$/.test(submitted.phone)
    ? `+91 ${submitted.phone.slice(0, 5)} ${submitted.phone.slice(5)}`
    : submitted.phone

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
          form: origin,
          course: data.get("course"),
          name: data.get("name"),
          phone: data.get("phone"),
          source: window.location.pathname,
          captchaToken: captcha?.token,
          captchaAnswer: captcha?.answer,
        }),
      })

      if (res.ok) {
        setSubmitted({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
        })
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

  return (
    <div
      /*
        `flex min-h-full items-center` on an inner wrapper, not
        `grid place-items-center` on this one.

        Centring an item that is taller than its scroll container puts half the
        overflow above the scroll origin, where it cannot be reached: on a
        390×844 screen the dialog measured 1145px tall with its top at -150px,
        and scrolling to the very top still left it there — so the close button
        sat off-screen with no way to bring it back. The flex form centres only
        while the dialog fits and otherwise starts it at the top, which keeps
        the whole thing scrollable.
      */
      className="animate-fade-in fixed inset-0 z-90 overflow-y-auto overscroll-contain bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        // Only a click that both starts and ends on the backdrop closes it,
        // so a drag that ends outside the dialog does not dismiss the form.
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div
        className="flex min-h-full items-center justify-center"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setOpen(false)
        }}
      >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-title"
        data-cursor="light"
        /* The confirmation drops the two-column layout: the pitch was there to
           talk someone into filling the form in, and once they have it is just
           something standing between them and the answer. */
        className={`animate-menu-in relative grid w-full overflow-hidden rounded-[1.75rem] text-white shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] ${
          done ? "max-w-lg" : "max-w-4xl md:grid-cols-2"
        }`}
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

        {done ? (
          /* --- Confirmation --- */
          <div
            role="status"
            className="relative isolate overflow-hidden bg-ink px-7 py-14 text-center sm:px-10 sm:py-16"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-28 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full bg-brand-600/40 blur-[110px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -bottom-32 -z-10 size-80 rounded-full bg-violet-600/30 blur-[110px]"
            />

            <div className="relative mx-auto grid size-24 place-items-center">
              {/* Behind the badge, so a ring sweeping past never dims the tick. */}
              <span
                aria-hidden="true"
                className="animate-success-ring absolute inset-0 -z-10 rounded-full border-2 border-lime-300/70"
              />
              <span
                aria-hidden="true"
                className="animate-success-ring absolute inset-0 -z-10 rounded-full border-2 border-lime-300/40 [animation-delay:0.75s]"
              />
              <span className="animate-success-pop grid size-16 place-items-center rounded-full bg-lime-400 text-ink shadow-[0_0_50px_-6px_rgba(163,230,53,0.85)]">
                <svg viewBox="0 0 24 24" fill="none" className="size-8" aria-hidden="true">
                  <path
                    className="animate-tick-draw"
                    pathLength={1}
                    d="m6 12.5 4 4 8-9"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <p className="mt-8 text-[11px] font-bold tracking-[0.22em] text-accent-400 uppercase">
              Enquiry received
            </p>

            <h2
              id="enquiry-title"
              className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {firstName ? `You're in, ${firstName}.` : "You're in."}
            </h2>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Your enquiry is on a counsellor&apos;s desk. We&apos;ll call you
              {submittedPhone ? " on " : " "}
              {submittedPhone && (
                <span className="font-semibold text-white">
                  {submittedPhone}
                </span>
              )}{" "}
              soon — usually within 5 minutes during working hours.
            </p>

            <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70">
              {/* `motion-safe:` so the pulse is dropped by the same preference
                  that cancels the rest of this panel's motion. */}
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full rounded-full bg-lime-400/70 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-lime-400" />
              </span>
              Counsellors are online now
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-bold text-ink transition-colors duration-300 hover:bg-brand-50 sm:w-auto"
              >
                Back to the site
              </button>
              {/* Impatience is a good sign on an enquiry — the number is right
                  here rather than one more page away. */}
              <a
                href={contact.phoneHref}
                className="w-full rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10 sm:w-auto"
              >
                Or call {contact.phone}
              </a>
            </div>
          </div>
        ) : (
          <>
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

          {/* The quotation is atmosphere, not information. It costs ~180px of
              a phone screen ahead of the fields someone opened this to fill
              in, so it only appears once there is room beside them. */}
          <figure className="mt-7 hidden rounded-2xl border border-white/12 bg-white/5 p-5 md:block">
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
              <GoogleMark className="size-5 shrink-0" />
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
              href={contact.emailHref}
              className="font-medium text-white underline underline-offset-2"
            >
              {contact.email}
            </a>
            , and our team will get back to you right away.
          </p>
        </div>

        {/* --- Form --- */}
        <form
          onSubmit={onSubmit}
          className="bg-linear-to-br from-brand-700 via-brand-600 to-violet-700 p-7 sm:p-9"
        >
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
                className="w-full appearance-none rounded-xl border border-white/25 bg-white/10 px-5 py-4 text-base text-white outline-none sm:text-sm focus-visible:ring-2 focus-visible:ring-white/70"
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
              className={POPUP_INPUT}
            />

            {/* `key` on the prefill, not just defaultValue: an uncontrolled
                input keeps whatever it had on the first mount, so without this
                a number typed into the CTA would not appear on a second open. */}
            <input
              key={prefillPhone}
              name="phone"
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              autoComplete="tel"
              defaultValue={prefillPhone}
              placeholder="Contact Number (10 Digits)*"
              aria-label="Contact number"
              className={POPUP_INPUT}
            />
          </div>

          <div className="mt-5">
            <Captcha
              onChange={setCaptcha}
              resetSignal={resetSignal}
              label="Security verification"
              inputClassName={POPUP_INPUT}
            />
          </div>

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
            disabled={!verified || status === "sending"}
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
        </form>
          </>
        )}
      </div>
      </div>
    </div>
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
