"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

/** Wait this long before showing anything — see GRACE note below. */
const GRACE_MS = 140
/** Once shown, stay up at least this long so it reads as progress, not a blink. */
const MIN_VISIBLE_MS = 400
/** Fade-out window; must match the CSS transition on [data-state="done"]. */
const FADE_MS = 300
/** Nothing should hang the bar forever if a navigation is abandoned. */
const FAILSAFE_MS = 12000

type State = "idle" | "loading" | "done"

/**
 * Route-change preloader.
 *
 * A client-side navigation gives the browser nothing to show — no spinner in
 * the tab, no paint — so between the click and the new page committing the site
 * looks frozen. loading.tsx covers the part *after* the route commits; this
 * covers the gap before it.
 *
 * Two deliberate choices keep it from being worse than the problem:
 *
 * GRACE — a prefetched route commits in a few dozen milliseconds. Showing a
 * loader for that long is a flash of noise, so nothing appears until the
 * navigation has already outlasted GRACE_MS. Most clicks never show it at all.
 *
 * MIN_VISIBLE — if it does appear, yanking it 30ms later is the same flicker
 * from the other end, so it holds briefly before completing.
 *
 * It is an overlay bar rather than a full-screen curtain on purpose: the
 * current page stays readable and scrollable while the next one loads, so the
 * wait costs the reader nothing.
 */
export function NavProgress() {
  const [state, setState] = useState<State>("idle")
  const pathname = usePathname()

  // Timers live in one bag so every path can cancel all of them.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const shownAt = useRef(0)
  // Mirrors `state` for the effects to read. A setState updater can't be used
  // to branch on the current value here because reactStrictMode is on and
  // React invokes updaters twice, which would queue every timer twice.
  const stateRef = useRef<State>("idle")

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const after = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms))
  }
  const go = (next: State) => {
    stateRef.current = next
    setState(next)
  }

  // --- Start: any click that will actually navigate ---------------------
  //
  // Listening on the document rather than wiring every Link means plain
  // <Link>s, the footer, the mobile sheet and future links are all covered
  // without touching them. Capture phase, so a handler that stops propagation
  // still can't hide the click from us.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Modified clicks open a new tab — this document isn't going anywhere.
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return

      const anchor = (e.target as Element | null)?.closest?.("a")
      if (!anchor || !anchor.getAttribute("href")) return
      if (anchor.hasAttribute("download")) return
      if (anchor.target && anchor.target !== "_self") return

      // Resolved against the document, so relative hrefs work. mailto: and
      // tel: land here too — their origin is "null", so the check drops them.
      let url: URL
      try {
        url = new URL(anchor.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return

      // Same page, or a #hash on it: the browser scrolls, nothing loads.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return

      clearTimers()
      after(GRACE_MS, () => {
        shownAt.current = Date.now()
        go("loading")
        after(FAILSAFE_MS, () => go("idle"))
      })
    }

    document.addEventListener("click", onClick, true)
    return () => {
      document.removeEventListener("click", onClick, true)
      clearTimers()
    }
  }, [])

  // --- Finish: the route committed --------------------------------------
  //
  // usePathname updates when the new route commits — which, thanks to the
  // loading.tsx boundaries, is when its skeleton paints. That is exactly the
  // handoff point: the bar covers the dead time, the skeleton takes over.
  // Also fires for back/forward, where it harmlessly finds nothing running.
  useEffect(() => {
    // Cancels a pending show as well as a running one: a navigation that beat
    // GRACE_MS never flashes anything.
    clearTimers()
    if (stateRef.current !== "loading") return

    const held = Date.now() - shownAt.current
    after(Math.max(0, MIN_VISIBLE_MS - held), () => {
      go("done")
      after(FADE_MS, () => go("idle"))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (state === "idle") return null

  return (
    <div
      className="nav-progress"
      data-state={state}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <span className="nav-progress__bar" />
      <span className="nav-progress__pill">
        <span className="nav-progress__spinner" aria-hidden="true" />
        Loading
      </span>
    </div>
  )
}
