"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * The arithmetic captcha shown on every public form.
 *
 * The challenge is minted by GET /api/captcha and arrives as a signed token
 * plus a question — `6 + 4 = ?`. The answer is never sent with it: the server
 * re-derives both operands from the token's nonce using CAPTCHA_SECRET, which
 * is why this component can hold the whole challenge in the browser without
 * giving anything away (lib/captcha.ts explains the construction).
 *
 * Nothing here is a security control. A form gates its submit button on having
 * a token and an answer purely so the visitor is not sent on a round trip that
 * cannot succeed — the server verifies the pair, and burns the token, on its
 * own terms.
 */

export type CaptchaValue = { token: string; answer: string }

type Challenge = { token: string; question: string }

export function Captcha({
  onChange,
  /** Change this to any new value to mint a fresh challenge. */
  resetSignal = 0,
  /** Dark forms sit on the brand gradient; the contact page form is white. */
  tone = "dark",
  /**
   * Renders the heading itself, which also switches the layout: the question
   * and the refresh button move up beside it and the answer field takes the
   * full width underneath. Without it the three sit in one row and the form
   * owns the heading.
   */
  label,
  /** The form's own input class, so the answer field matches its siblings. */
  inputClassName,
  className = "",
}: {
  onChange: (value: CaptchaValue | null) => void
  resetSignal?: number
  tone?: "light" | "dark"
  label?: string
  inputClassName: string
  className?: string
}) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  // Held in a ref so a caller passing an inline arrow does not re-run the
  // reporting effect on every render.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Bumped on every load so a slow first response cannot overwrite the
  // challenge a later refresh already put on screen.
  const requestRef = useRef(0)

  const load = useCallback(async () => {
    const request = ++requestRef.current
    setLoading(true)
    setFailed(false)
    setChallenge(null)
    setAnswer("")

    try {
      const res = await fetch("/api/captcha", { cache: "no-store" })
      if (!res.ok) throw new Error(String(res.status))
      const data: Challenge = await res.json()
      if (request !== requestRef.current) return
      setChallenge(data)
    } catch {
      if (request !== requestRef.current) return
      setFailed(true)
    } finally {
      if (request === requestRef.current) setLoading(false)
    }
  }, [])

  /*
    Loaded on approach, not on mount.

    /api/captcha allows 30 challenges per address per 10 minutes, and this form
    sits on every course page. Minting one on page load would spend that budget
    on visitors comparing courses who never scroll to a form — around thirty
    pages in, the next form they actually opened would fail to load its
    question. Waiting until the form is near the viewport ties a challenge to
    someone about to use it. In a dialog that is the moment it opens.
  */
  const rootRef = useRef<HTMLDivElement>(null)
  const [approached, setApproached] = useState(false)

  useEffect(() => {
    if (approached) return

    const root = rootRef.current
    if (!root) return

    // No observer, no deferral — better an early fetch than no captcha.
    if (typeof IntersectionObserver === "undefined") {
      setApproached(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setApproached(true)
      },
      // A screen's warning, so the question is already there on arrival.
      { rootMargin: "400px" },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [approached])

  useEffect(() => {
    if (!approached) return
    void load()
  }, [approached, load, resetSignal])

  /* A token with no answer typed against it is not yet usable, so the form is
     told `null` rather than a half-filled pair it would only have rejected. */
  useEffect(() => {
    const trimmed = answer.trim()
    onChangeRef.current(
      challenge && trimmed ? { token: challenge.token, answer: trimmed } : null,
    )
  }, [challenge, answer])

  const dark = tone === "dark"
  const stacked = Boolean(label)

  /*
    The question is rendered as text, never as an image: it is arithmetic on
    two small numbers, so a picture of it would buy nothing against a bot with
    OCR while costing every screen-reader user the challenge entirely. The rate
    limits behind it are what make guessing pointless, not the rendering.
  */
  const question = (
    <output
      aria-live="polite"
      className={`grid shrink-0 place-items-center rounded-xl border font-display font-bold tracking-wider tabular-nums ${
        // Stretched to the row's height when it sits beside the answer field;
        // beside a heading there is no such height to inherit, so it sets its
        // own and drops a size to stay level with the text.
        stacked ? "px-3 py-1 text-sm" : "px-4 text-base"
      } ${
        dark
          ? "border-white/25 bg-white/10 text-white"
          : "border-line bg-subtle text-foreground"
      }`}
    >
      {loading || !challenge ? "…" : challenge.question}
    </output>
  )

  const refresh = (
    <button
      type="button"
      onClick={() => void load()}
      disabled={loading}
      aria-label="Get a new question"
      title="Get a new question"
      className={`grid shrink-0 place-items-center rounded-xl border transition-colors duration-300 disabled:opacity-50 ${
        stacked ? "size-8" : "aspect-square"
      } ${
        dark
          ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
          : "border-line bg-subtle text-muted hover:text-foreground"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
        <path
          d="M20 11a8 8 0 1 0-.6 4M20 5v6h-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )

  const field = (
    <input
      name="captchaAnswer"
      required
      type="text"
      inputMode="numeric"
      pattern="[0-9]{1,3}"
      autoComplete="off"
      disabled={loading || !challenge}
      value={answer}
      // Digits only, filtered as they are typed rather than refused on submit —
      // the answer is never more than two.
      onChange={(e) => setAnswer(e.target.value.replace(/\D/g, "").slice(0, 3))}
      placeholder="Answer"
      aria-label={
        challenge ? `Security check: ${challenge.question}` : "Security check"
      }
      className={inputClassName}
    />
  )

  /* One outer element in every state, because it is what the observer above
     watches — swapping it out for the error message would stop the retry
     button ever being able to bring the row back. */
  return (
    <div ref={rootRef} className={className}>
      {failed ? (
        <p
          role="alert"
          className={`text-xs leading-relaxed ${dark ? "text-amber-200" : "text-amber-800"}`}
        >
          The security check could not be loaded.{" "}
          <button
            type="button"
            onClick={() => void load()}
            className="font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </p>
      ) : stacked ? (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium">{label}</p>
            {question}
            {refresh}
          </div>
          {field}
        </>
      ) : (
        <div className="flex items-stretch gap-2">
          {question}

          {/* Wrapped because the form's own input class carries `w-full`, which
              in a flex row resolves against the whole row rather than the space
              left over — the field would push the question and the refresh
              button off the end of it. `min-w-0` is what lets it shrink below
              that width. */}
          <div className="min-w-0 flex-1">{field}</div>

          {refresh}
        </div>
      )}
    </div>
  )
}
