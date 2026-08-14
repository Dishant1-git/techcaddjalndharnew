"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Recaptcha, RECAPTCHA_ENABLED } from "./recaptcha"

/**
 * "Download Brochure" — opens a lead-capture form and, only on a validated
 * submission, downloads a PDF built from this course's own page content.
 *
 * `course` comes from the page (`page.eyebrow`), exactly like
 * CourseEnquiryForm's `course` prop — it is shown read-only rather than left
 * for the visitor to pick, so a brochure requested from the WordPress page is
 * always filed and generated against WordPress. The server re-checks it
 * against the course catalogue regardless.
 *
 * The dialog is rendered into <body> through a portal, the same as
 * GalleryLightbox. The button sits in the course hero, which is
 * `relative isolate` — `isolation: isolate` opens a stacking context, so the
 * overlay's z-index was being resolved *inside* that section and the whole
 * section paints below the navbar's z-50. No z-index on the overlay itself can
 * escape that; only leaving the subtree can.
 */
export function BrochureButton({ course }: { course: string }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Portals need a DOM to target, which does not exist during the server
  // render — so nothing is emitted until after mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [token, setToken] = useState<string | null>(null)
  const [resetSignal, setResetSignal] = useState(0)

  const resetCaptcha = () => {
    setToken(null)
    setResetSignal((n) => n + 1)
  }

  const show = () => {
    setError(null)
    setStatus("idle")
    setOpen(true)
    resetCaptcha()
  }

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

  const verified = !RECAPTCHA_ENABLED || Boolean(token)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!verified || status === "sending") return

    const data = new FormData(event.currentTarget)
    setStatus("sending")
    setError(null)

    try {
      const res = await fetch("/api/brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          address: data.get("address"),
          course,
          source: `brochure:${course}`,
          recaptchaToken: token,
        }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const filename =
          /filename="([^"]+)"/.exec(res.headers.get("content-disposition") ?? "")?.[1] ??
          "techcadd-brochure.pdf"

        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)

        setStatus("done")
        return
      }

      const payload = await res.json().catch(() => ({}))
      setError(payload.error ?? "Something went wrong. Please try again.")
      setStatus("idle")
      resetCaptcha()
    } catch {
      setError("Could not reach the server. Please try again.")
      setStatus("idle")
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/25 bg-white/5 px-7 text-sm font-medium backdrop-blur-md transition-colors duration-300 hover:bg-white/15"
      >
        <DownloadIcon />
        Download Brochure
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            /* z-100: above the navbar (z-50) and the gallery lightbox (z-70),
               which is only meaningful now that the portal has lifted this out
               of the hero's stacking context.

               Padding, not centring, is what keeps it on screen: the flex box
               below centres the panel in the padded area, so a short form sits
               in the middle while a tall one grows downwards and scrolls this
               container rather than pushing its own heading off the top. The
               side padding is tighter below `sm` — a 320px phone has 288px to
               spend and every pixel here comes off the form. */
            className="animate-fade-in fixed inset-0 z-100 overflow-y-auto overscroll-contain bg-black/65 px-3 py-6 backdrop-blur-sm sm:px-4 sm:py-10"
            onMouseDown={(e) => {
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
                role="dialog"
                aria-modal="true"
                aria-labelledby="brochure-title"
                data-cursor="light"
                className="animate-menu-in relative w-full max-w-md overflow-hidden rounded-3xl bg-ink p-5 text-white shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] sm:rounded-[1.75rem] sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-brand-600/35 blur-[90px]"
                />

                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full border border-white/40 text-white transition-colors duration-300 hover:bg-white hover:text-ink sm:top-4 sm:right-4"
                >
                  <CloseIcon />
                </button>

                {status === "done" ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <span className="grid size-14 place-items-center rounded-full bg-lime-400 text-ink">
                      <CheckIcon />
                    </span>
                    <p className="mt-5 font-display text-xl font-bold tracking-tight">
                      Your download has started
                    </p>
                    <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/70">
                      If the file did not open automatically, check your
                      browser&apos;s downloads. A counsellor may also call to
                      help with anything the brochure does not answer.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="mt-7 rounded-full bg-white px-7 py-3 text-sm font-bold text-ink transition-colors duration-300 hover:bg-brand-50"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <h2
                      id="brochure-title"
                      className="pr-12 font-display text-lg font-bold tracking-tight sm:text-2xl"
                    >
                      Get the {course} brochure
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-white/65 sm:text-sm">
                      Share your details and the PDF downloads immediately —
                      full syllabus, tools and contact info included.
                    </p>

                    <form onSubmit={onSubmit} className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                      <input
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Full Name*"
                        aria-label="Full name"
                        className="enquiry-input"
                      />
                      <input
                        name="email"
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="Email Address*"
                        aria-label="Email address"
                        className="enquiry-input"
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
                        className="enquiry-input"
                      />
                      <textarea
                        name="address"
                        required
                        rows={2}
                        maxLength={300}
                        autoComplete="street-address"
                        placeholder="Your Address*"
                        aria-label="Address"
                        /* `resize-y` only — a horizontal handle on a control
                           this close to the viewport edge is a way to drag the
                           form off the side of a phone. */
                        className="enquiry-input resize-y"
                      />
                      <input
                        value={course}
                        readOnly
                        aria-label="Course"
                        tabIndex={-1}
                        className="enquiry-input opacity-70"
                      />

                      {/* Google renders the checkbox at a fixed 304px, which is
                          wider than the dialog's content box on a small phone
                          and was the one thing pushing the form off the screen.
                          `recaptcha-fit` scales it down there and only there. */}
                      <div className="recaptcha-fit pt-1">
                        <Recaptcha onChange={setToken} resetSignal={resetSignal} />
                      </div>

                      {error && (
                        <p role="alert" className="text-xs font-medium text-amber-200">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={!verified || status === "sending"}
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink transition-colors duration-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-8 sm:py-4"
                      >
                        {status === "sending" ? (
                          "Preparing your brochure…"
                        ) : (
                          <>
                            <DownloadIcon />
                            Download Brochure
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-white/55">
                        We never share your details. Expect a call within
                        working hours.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
      <path
        d="m6 12.5 4 4 8-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
