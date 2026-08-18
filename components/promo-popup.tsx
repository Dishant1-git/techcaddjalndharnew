"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { cmsImageUrl, type CmsBanner } from "@/lib/cms"

/**
 * A promotional banner shown as a dismissible overlay.
 *
 * The "popup" placement in the CMS. Deliberately quiet about it: artwork the
 * office scheduled is worth one appearance, not one per page view, so a
 * dismissal is remembered for the session.
 *
 * The key is per banner, so starting a new campaign shows the new artwork to
 * someone who dismissed the last one — otherwise the first promo of a session
 * would silence every later one.
 */

/** Long enough that the page has rendered and the visitor is oriented. */
const DELAY_MS = 5000

const seenKey = (id: string) => `techcadd:promo-seen:${id}`

/**
 * Set on <html> while this is open.
 *
 * The enquiry popup auto-opens on its own timer, and two overlapping dialogs
 * would trap focus against each other. It checks this flag and waits rather
 * than spending its one auto-open on a moment nobody can see.
 */
export const PROMO_OPEN_ATTR = "data-promo-open"

export function PromoPopup({ banner }: { banner: CmsBanner | null }) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const dismiss = useCallback(() => {
    setOpen(false)
    if (banner) {
      try {
        sessionStorage.setItem(seenKey(banner.id), "1")
      } catch {
        // Private mode with storage disabled. Showing it again next navigation
        // is a worse outcome than nothing, but not one worth failing over.
      }
    }
  }, [banner])

  useEffect(() => {
    if (!banner) return

    try {
      if (sessionStorage.getItem(seenKey(banner.id))) return
    } catch {
      return
    }

    const timer = window.setTimeout(() => setOpen(true), DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [banner])

  // Escape closes it, and the flag tells the enquiry popup to hold off.
  useEffect(() => {
    if (!open) return

    document.documentElement.setAttribute(PROMO_OPEN_ATTR, "1")
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss()
    }
    window.addEventListener("keydown", onKey)

    return () => {
      document.documentElement.removeAttribute(PROMO_OPEN_ATTR)
      window.removeEventListener("keydown", onKey)
    }
  }, [open, dismiss])

  if (!banner || !open) return null

  const desktop = cmsImageUrl(banner.desktopImage?.url)
  const mobile = cmsImageUrl(banner.mobileImage?.url)
  const art = mobile ?? desktop
  if (!art) return null

  const image = (
    <Image
      src={art}
      alt={banner.altText}
      width={banner.mobileImage?.width ?? banner.desktopImage?.width ?? 900}
      height={banner.mobileImage?.height ?? banner.desktopImage?.height ?? 600}
      className="h-auto w-full"
      priority
    />
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={banner.title}
      className="fixed inset-0 z-100 grid place-items-center p-4"
    >
      {/* The backdrop closes it too — a promo the visitor is done with should
          not need them to find the button. */}
      <button
        type="button"
        aria-label="Close"
        onClick={dismiss}
        className="absolute inset-0 cursor-default bg-ink/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65 focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {banner.linkUrl ? (
          <Link href={banner.linkUrl} onClick={dismiss} className="block">
            {image}
          </Link>
        ) : (
          image
        )}

        {banner.linkUrl && banner.ctaText && (
          <div className="p-5 text-center">
            <Link
              href={banner.linkUrl}
              onClick={dismiss}
              className="inline-flex items-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              {banner.ctaText}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
