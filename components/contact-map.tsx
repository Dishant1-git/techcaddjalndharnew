"use client"

import { useState } from "react"

/**
 * Google Maps embed for the Jalandhar centre.
 *
 * Deliberately behind a facade rather than embedded outright. A Maps iframe
 * pulls roughly three quarters of a megabyte of scripts, tiles and fonts from
 * Google, and it does it during page load — on a contact page whose real job
 * is the phone number and the form above it. Nothing is requested until
 * somebody actually asks to see the map.
 *
 * `loading="lazy"` alone would not have been enough: it defers the fetch until
 * the frame nears the viewport, which on this page is immediately.
 *
 * The address link underneath always works, including before the map is
 * loaded, with JavaScript off, or if Google is blocked — which for a contact
 * page is the part that actually matters.
 */
export function ContactMap({
  query,
  cid,
  label,
}: {
  /** Full address, used for the directions link and as the embed fallback. */
  query: string
  /** Google's listing id. Pins the exact business rather than a text match. */
  cid?: string
  /** Human-readable place name, used in the link and the iframe title. */
  label: string
}) {
  const [loaded, setLoaded] = useState(false)

  /* `cid=` resolves to one listing and nothing else; a text query asks Google
     to interpret it and can land on a similarly named place. Both forms work
     on the keyless `output=embed` endpoint, so the exact pin costs no API key. */
  const src = cid
    ? `https://www.google.com/maps?cid=${encodeURIComponent(cid)}&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`

  // Directions always go by address — a bare numeric id is a poor thing to
  // show someone if it ever fails to resolve.
  const directions = encodeURIComponent(query)

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-subtle">
      <div className="relative aspect-[16/11] w-full sm:aspect-[16/9]">
        {loaded ? (
          <iframe
            /* The `output=embed` form needs no API key and no cookies until it
               is actually loaded. www.google.com is already allowed by the
               CSP's frame-src for reCAPTCHA, so no policy change is needed. */
            src={src}
            title={`Map showing ${label}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="group absolute inset-0 grid place-items-center bg-linear-to-br from-brand-50 via-subtle to-white transition-colors duration-300 hover:from-brand-100"
          >
            {/* A drawn stand-in, not a static map image — a real one would be
                another request to Google, which is the thing being avoided. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,var(--color-ink)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-ink)_1px,transparent_1px)] [background-size:38px_38px]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 -rotate-6 bg-brand-600/10"
            />

            <span className="relative flex flex-col items-center">
              <span className="grid size-14 place-items-center rounded-full bg-brand-600 text-white shadow-[0_16px_34px_-14px_rgba(37,99,235,0.9)] transition-transform duration-300 group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
                  <path
                    d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>

              <span className="mt-4 font-display text-lg font-bold tracking-tight text-ink">
                Show the map
              </span>
              <span className="mt-1 max-w-[16rem] text-center text-xs leading-relaxed text-muted">
                Loads Google Maps. We keep it off until you ask, so the page
                stays fast.
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-5 py-4">
        <p className="font-display text-sm font-bold tracking-tight">{label}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${directions}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-700"
        >
          Get directions
          <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden="true">
            <path
              d="M7 17 17 7M9 7h8v8"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  )
}
