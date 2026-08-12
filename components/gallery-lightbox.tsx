"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import type { GalleryTile } from "@/lib/gallery"

/**
 * Full-screen carousel over the whole gallery.
 *
 * Opened by clicking a tile in the drifting wall, and it carries every image
 * rather than just the one clicked — the wall repeats its tiles to fill each
 * column, so "the one you clicked" is only meaningful as a starting position.
 *
 * Rendered into <body> through a portal. The wall's section is
 * `overflow-hidden`, and while that alone would not clip a fixed child, the
 * component sets `perspective` on its own root — any transform-like property on
 * an ancestor makes it the containing block for fixed descendants and the
 * overlay would be trapped inside the wall.
 */
export function GalleryLightbox({
  tiles,
  index,
  onClose,
  onIndexChange,
}: {
  tiles: GalleryTile[]
  /** `null` closes the dialog. */
  index: number | null
  onClose: () => void
  onIndexChange: (next: number) => void
}) {
  const open = index !== null
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  // Portals need a DOM to target, which does not exist during the server
  // render — so nothing is emitted until after mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  /** Wraps in both directions, so the carousel has no dead ends. */
  const go = useCallback(
    (delta: number) => {
      if (index === null || !tiles.length) return
      onIndexChange((index + delta + tiles.length) % tiles.length)
    },
    [index, tiles.length, onIndexChange],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      else if (event.key === "ArrowRight") go(1)
      else if (event.key === "ArrowLeft") go(-1)
      else return
      event.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose, go])

  useEffect(() => {
    if (!open) return

    // Restored on close so focus returns to the tile that opened the dialog
    // rather than jumping to the top of the page.
    restoreRef.current = document.activeElement as HTMLElement | null

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      restoreRef.current?.focus?.()
    }
  }, [open])

  // Keeps the active thumbnail in view when paging with the arrow keys, which
  // would otherwise walk off the end of the strip unseen.
  useEffect(() => {
    if (index === null) return
    stripRef.current
      ?.querySelector(`[data-thumb="${index}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center" })
  }, [index])

  if (!mounted || index === null) return null

  const tile = tiles[index]
  if (!tile) return null

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Gallery image ${index + 1} of ${tiles.length}: ${tile.title}`}
      tabIndex={-1}
      data-cursor="light"
      /* Above the navbar, which sits at z-50. */
      className="animate-fade-in fixed inset-0 z-[70] flex flex-col bg-ink/95 outline-none backdrop-blur-xl"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 text-white sm:px-6">
        <p className="font-mono text-xs tracking-[0.18em] text-white/70 uppercase">
          {String(index + 1).padStart(2, "0")} / {String(tiles.length).padStart(2, "0")}
        </p>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-300 hover:bg-white/20"
        >
          <CloseIcon />
        </button>
      </div>

      {/*
        The backdrop closes on click, so the stage swallows clicks that land on
        the image or the arrows — without this, paging through the carousel
        would dismiss it on the first press.
      */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-6"
        onClick={onClose}
      >
        <NavButton side="left" onClick={() => go(-1)} />

        <figure
          className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative min-h-0 w-full flex-1">
            <Image
              /* `key` forces a fresh element per slide so the browser paints
                 the new photograph instead of holding the previous one while it
                 decodes. */
              key={tile.image + index}
              src={tile.image}
              alt={tile.title}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              /* `contain`, not `cover` — a lightbox exists to show the whole
                 frame, and these are mixed aspect ratios. */
              className="animate-fade-in object-contain"
              priority
            />
          </div>

          <figcaption className="mt-4 shrink-0 px-2 text-center text-sm text-white/75">
            {tile.title}
          </figcaption>
        </figure>

        <NavButton side="right" onClick={() => go(1)} />
      </div>

      {/* Every image, so the carousel is browsable without paging one at a
          time. Horizontal scroll rather than wrapping: the strip must stay one
          row however many photographs the gallery grows to. */}
      <div
        ref={stripRef}
        className="shrink-0 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        <ul className="mx-auto flex w-max gap-2.5">
          {tiles.map((thumb, i) => (
            <li key={`${thumb.image}-${i}`}>
              <button
                type="button"
                data-thumb={i}
                onClick={() => onIndexChange(i)}
                aria-label={`Show image ${i + 1}: ${thumb.title}`}
                aria-current={i === index}
                className={`relative block h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all duration-300 sm:h-16 sm:w-24 ${
                  i === index
                    ? "border-white opacity-100"
                    : "border-white/20 opacity-50 hover:opacity-90"
                }`}
              >
                <Image
                  src={thumb.image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  )
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={`absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/25 sm:size-12 ${
        side === "left" ? "left-2 sm:left-6" : "right-2 sm:right-6"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`size-5 ${side === "left" ? "rotate-180" : ""}`}
        aria-hidden="true"
      >
        <path
          d="M9 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
