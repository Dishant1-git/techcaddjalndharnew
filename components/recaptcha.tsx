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

  // Fixed height so the form does not jump when the iframe arrives; the
  // checkbox widget is 78px tall at its normal size.
  return <div ref={hostRef} className={`min-h-[78px] ${className}`} />
}
