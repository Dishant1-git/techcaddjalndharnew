"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Horizontal carousel for the homepage blog teasers.
 *
 * Built on native scroll-snap rather than a transform-driven slider: touch,
 * trackpad and keyboard scrolling all work for free, the track stays
 * accessible when JavaScript has not loaded, and there is no index state to
 * fall out of sync with the DOM. The buttons just call scrollBy.
 *
 * Cards arrive already rendered from the server — this only supplies the rail
 * and the controls, so none of the post markup ships as client JavaScript.
 */
export function BlogCarousel({ items }: { items: React.ReactNode[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = track.current
    if (!el) return
    // A pixel of slack: fractional scroll widths mean scrollLeft rarely lands
    // exactly on the maximum, and without it the next button never disables.
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1)
  }, [])

  useEffect(() => {
    sync()
    const el = track.current
    if (!el) return
    window.addEventListener("resize", sync)
    return () => window.removeEventListener("resize", sync)
  }, [sync])

  /** Scrolls by one card, measured from the first one so it tracks the breakpoint. */
  const page = (direction: 1 | -1) => {
    const el = track.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth
    el.scrollBy({ left: step * direction, behavior: "smooth" })
  }

  return (
    <div>
      <div
        ref={track}
        onScroll={sync}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0"
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="w-[80%] shrink-0 snap-start sm:w-[47%] lg:w-[calc((100%-3rem)/3)]"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <Arrow
          direction="prev"
          disabled={atStart}
          onClick={() => page(-1)}
        />
        <Arrow direction="next" disabled={atEnd} onClick={() => page(1)} />
      </div>
    </div>
  )
}

function Arrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next"
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous posts" : "Next posts"}
      className="grid size-11 place-items-center rounded-full border border-line bg-white text-foreground transition-all duration-300 hover:border-brand-600/40 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-35"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
        <path
          d={direction === "prev" ? "M19 12H5m7 7-7-7 7-7" : "M5 12h14m-7-7 7 7-7 7"}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
