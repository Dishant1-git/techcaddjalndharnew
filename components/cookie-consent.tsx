"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

/**
 * Cookie notice, and the switch everything non-essential must be gated on.
 *
 * The site sets no cookies of its own today — lib/request-guard.ts says as
 * much, and rate limiting works off the request IP rather than a session. What
 * this banner exists for is the moment that changes: analytics, a pixel, an
 * embedded player that phones home. Read the choice with `analyticsConsent()`
 * before loading any of them, so the banner is a real control rather than a
 * decoration that reappears in a screenshot review six months later.
 *
 * Deliberately not a modal. A consent wall that traps the page is worse for a
 * visitor than the tracking it asks about, and refusing has to be exactly as
 * easy as accepting — hence two buttons of equal weight, no "manage
 * preferences" maze, and no dismiss-by-scrolling.
 */

const STORAGE_KEY = "techcadd:cookie-consent"

export type Consent = "accepted" | "rejected"

/**
 * The stored choice, or null if nobody has answered yet.
 *
 * Safe to call during a server render — it reports null rather than throwing
 * where there is no window.
 */
export function analyticsConsent(): Consent | null {
  if (typeof window === "undefined") return null
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === "accepted" || value === "rejected" ? value : null
}

export function CookieConsent() {
  /*
    Starts closed on both sides of hydration.

    localStorage is not readable during the server render, so rendering the
    banner immediately would mean the server emits it for everyone — including
    the people who answered months ago, and React would then tear it back out.
    The effect below opens it after mount, once the stored answer is known.
  */
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // A blocked or unavailable localStorage must not take the page with it.
    try {
      if (!analyticsConsent()) setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [])

  const answer = (choice: Consent) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice)
    } catch {
      /* Private mode, or storage disabled: the banner still closes for this
         visit rather than sitting there refusing to be dismissed. */
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      data-cursor="light"
      /* Below the enquiry dialog (z-90) and the brochure dialog (z-100): if one
         of those opens over this, the notice must not sit on top of the form
         someone is filling in. */
      className="animate-fade-in fixed inset-x-3 bottom-3 z-80 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-lg"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-ink/95 p-5 text-white shadow-[0_30px_70px_-25px_rgba(0,0,0,0.85)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-5 sm:p-6">
        <p className="text-sm leading-relaxed text-white/85">
          We use cookies to run this site and understand how it&apos;s used. See
          our{" "}
          <Link
            href="/privacy"
            className="font-semibold text-white underline underline-offset-2 transition-colors hover:text-brand-300"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {/* `shrink-0` so the two buttons keep their width and the sentence
            wraps instead — a "Reject" that has been squeezed to two lines
            reads as the lesser option, which is the thing to avoid here. */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => answer("rejected")}
            className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => answer("accepted")}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
