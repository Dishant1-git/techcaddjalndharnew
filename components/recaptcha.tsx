"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Google reCAPTCHA v2 "I'm not a robot" checkbox.
 *
 * Rendered explicitly rather than by the script's auto-scan: the widget must be
 * created and destroyed with the React tree, and `render=explicit` is what lets
 * that happen instead of Google walking the DOM whenever it happens to load.
 *
 * The site key is public by design — it identifies the site to Google and is
 * visible in the page source. Only RECAPTCHA_SECRET_KEY is a secret, and it is
 * used solely on the server in lib/recaptcha.ts.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

/**
 * Whether the widget will render at all.
 *
 * Forms gate their submit button on this, so a local checkout with no keys
 * stays usable rather than showing a permanently disabled button. The server
 * makes the same call independently — this is a UI convenience, never the
 * control itself.
 */
export const RECAPTCHA_ENABLED = Boolean(SITE_KEY)

const SCRIPT_ID = "recaptcha-api"
const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit"

/**
 * The checkbox widget's intrinsic size, fixed by Google.
 *
 * It renders into a cross-origin iframe, so the white box cannot be widened
 * from the outside — no CSS we write reaches inside it. Scaling the frame is
 * the only lever, which is why the widget is measured against its container
 * and transformed rather than simply stretched.
 */
const WIDGET_WIDTH = 304
const WIDGET_HEIGHT = 78

/**
 * Bounds on that scale.
 *
 * The floor keeps the checkbox tappable in a very narrow dialog. The ceiling is
 * the interesting one: a container is not always the width of the fields in it.
 * The contact form lays its inputs out two-up, so its column is 550px while an
 * input in it is 265px — filling that column would leave a captcha twice the
 * width of the field above it. 1.3 covers the dialogs, whose single-column
 * fields do span the full width (the brochure dialog needs 384/304 = 1.26), and
 * stops short of the sizes that only look like mistakes.
 */
const MIN_SCALE = 0.55
const MAX_SCALE = 1.3

type Grecaptcha = {
  ready: (callback: () => void) => void
  render: (element: HTMLElement, options: Record<string, unknown>) => number
  reset: (widgetId?: number) => void
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

/** One load for the whole page, however many forms ask for it. */
let loader: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.grecaptcha?.render) return Promise.resolve()
  if (loader) return loader

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    const script = existing ?? document.createElement("script")

    script.addEventListener("load", () => resolve())
    script.addEventListener("error", () => {
      // Cleared so a later mount can try again rather than inheriting a
      // permanently rejected promise.
      loader = null
      reject(new Error("reCAPTCHA script failed to load"))
    })

    if (!existing) {
      script.id = SCRIPT_ID
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })

  return loader
}

export function Recaptcha({
  onChange,
  /** Change this to any new value to clear a solved checkbox. */
  resetSignal = 0,
  theme = "light",
  className = "",
}: {
  onChange: (token: string | null) => void
  resetSignal?: number
  theme?: "light" | "dark"
  className?: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<number | null>(null)
  const [failed, setFailed] = useState(false)

  // Held in a ref so a caller passing an inline arrow does not re-run the
  // render effect on every keystroke — which would throw, the container
  // already having a widget in it.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false

    loadScript()
      .then(() => {
        if (cancelled) return
        window.grecaptcha?.ready(() => {
          // The guards matter under StrictMode, which mounts, unmounts and
          // remounts in development while refs survive — rendering twice into
          // one container is an error in the reCAPTCHA API.
          if (cancelled || !hostRef.current || widgetRef.current !== null) return

          widgetRef.current = window.grecaptcha!.render(hostRef.current, {
            sitekey: SITE_KEY,
            theme,
            callback: (token: string) => onChangeRef.current(token),
            // Google expires an unsubmitted token after about two minutes.
            "expired-callback": () => onChangeRef.current(null),
            "error-callback": () => onChangeRef.current(null),
          })
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [theme])

  useEffect(() => {
    if (widgetRef.current === null) return
    window.grecaptcha?.reset(widgetRef.current)
    onChangeRef.current(null)
  }, [resetSignal])

  /*
    Sizes the widget to whatever column it was dropped into, so it lines up with
    the inputs above it instead of sitting 304px wide in a wider form.

    Measured rather than done in CSS because the arithmetic is
    `container / 304`, and CSS cannot divide a length by a length to get the
    unitless number `scale()` needs. Observed rather than measured once, so it
    still fits after a viewport resize or a dialog reflow.

    Only the height is written back, never the width, so this cannot feed its
    own observer and loop.
  */
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const fit = (width: number) => {
      if (!width) return
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / WIDGET_WIDTH))
      wrap.style.setProperty("--recaptcha-scale", String(scale))
      // A transform leaves the layout box at its original size, so the row
      // would otherwise keep reserving an unscaled 78px and leave a gap.
      wrap.style.height = `${Math.round(WIDGET_HEIGHT * scale)}px`
    }

    fit(wrap.clientWidth)

    const observer = new ResizeObserver(([entry]) =>
      fit(entry.contentRect.width),
    )
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  if (!SITE_KEY) {
    return (
      <p className={`text-xs leading-relaxed text-amber-300 ${className}`}>
        reCAPTCHA is not configured — set NEXT_PUBLIC_RECAPTCHA_SITE_KEY and
        RECAPTCHA_SECRET_KEY. Submissions are not being verified.
      </p>
    )
  }

  if (failed) {
    return (
      <p role="alert" className={`text-xs leading-relaxed text-amber-200 ${className}`}>
        The verification widget could not load. Check your connection and
        refresh the page.
      </p>
    )
  }

  /*
    Two elements, each with one job: the outer one is the measured box and
    carries the scale, the inner one is what Google renders into. Reserved at
    the unscaled height up front so the form does not jump when the iframe
    arrives — the effect above replaces it with the scaled height on mount.
  */
  return (
    <div
      ref={wrapRef}
      style={{ height: WIDGET_HEIGHT }}
      className={`recaptcha-fit ${className}`}
    >
      <div ref={hostRef} />
    </div>
  )
}
