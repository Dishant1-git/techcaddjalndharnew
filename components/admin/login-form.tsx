"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

/**
 * The /admin/login form.
 *
 * Posts to /api/admin/login and lets the server decide everything: this
 * component never sees the expected credentials, and the only check it makes
 * before sending is that both boxes have something in them.
 */
export function LoginForm() {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status !== "idle") return

    const data = new FormData(event.currentTarget)
    setStatus("sending")
    setError(null)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.get("username"),
          password: data.get("password"),
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        setError(payload.error ?? "Sign-in failed. Please try again.")
        setStatus("idle")
        return
      }

      // Held at "done" rather than returned to "idle": the navigation below is
      // a server round trip, and a button that goes clickable again in the gap
      // invites a second sign-in nobody needs.
      setStatus("done")

      // `refresh` first, so the layout's guard re-runs with the new cookie and
      // /admin is rendered signed-in rather than bouncing straight back here.
      router.refresh()
      router.replace("/admin")
    } catch {
      setError("Could not reach the server. Check your connection.")
      setStatus("idle")
    }
  }

  const busy = status !== "idle"

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          autoFocus
          spellCheck={false}
          autoCapitalize="none"
          disabled={busy}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-foreground outline-none transition focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-500/25 disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={busy}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-foreground outline-none transition focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-500/25 disabled:opacity-60"
        />
      </div>

      {/* `role="alert"` rather than a plain paragraph: the message replaces
          nothing on screen, so without it a screen reader never announces that
          the attempt was refused. */}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
