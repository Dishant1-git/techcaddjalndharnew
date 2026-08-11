"use client"

import { useEffect, useState } from "react"

/**
 * Accepts a full watch URL, a share link or a bare id, because whoever swaps
 * the video later will paste whichever the address bar gave them.
 */
function youtubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function VideoDialog({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false)
  const id = youtubeId(url)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (!id) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Play video: ${title}`}
        className="group grid size-20 place-items-center rounded-full bg-white/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-105 lg:size-24"
      >
        {/* Ring pulses outward so the control reads as playable at a glance. */}
        <span
          aria-hidden="true"
          className="absolute size-20 animate-ping rounded-full bg-white/25 lg:size-24"
        />
        <svg
          viewBox="0 0 24 24"
          className="relative size-8 translate-x-0.5 fill-ink lg:size-9"
          aria-hidden="true"
        >
          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
        </svg>
      </button>

      {open && (
        <div
          className="animate-fade-in fixed inset-0 z-90 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="animate-menu-in relative w-full max-w-4xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full border border-white/40 text-white transition-colors duration-300 hover:bg-white hover:text-ink"
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

            <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
              {/* nocookie host: no tracking cookie is set unless it plays. */}
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
