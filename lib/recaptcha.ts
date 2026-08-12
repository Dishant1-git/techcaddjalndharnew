/**
 * Server-side verification for the Google reCAPTCHA v2 checkbox.
 *
 * The widget hands the browser a response token; that token is worthless until
 * it is posted to Google's siteverify endpoint with the secret key, which is
 * what this does. A token is single-use at Google's end, so unlike the
 * arithmetic captcha this replaces there is no replay list to maintain.
 *
 * Fails closed in production, for the same reason lib/captcha.ts does: a
 * missing secret is not a weaker check, it is no check at all, and silently
 * accepting every submission would leave the enquiries table open to any bot
 * that can POST JSON.
 */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"

/** Google's endpoint is reachable in a second or two, or it is not reachable. */
const TIMEOUT_MS = 8000

function secret(): string {
  const configured = process.env.RECAPTCHA_SECRET_KEY?.trim()

  if (!configured && process.env.NODE_ENV === "production")
    throw new Error(
      "RECAPTCHA_SECRET_KEY must be set in production — the enquiry forms have no other anti-bot check.",
    )

  return configured ?? ""
}

export type RecaptchaResult =
  | { ok: true }
  /** `retry` marks a failure the visitor can fix by ticking the box again. */
  | { ok: false; retry: boolean; reason: string }

export async function verifyRecaptcha(
  token: unknown,
  ip: string | null,
): Promise<RecaptchaResult> {
  const key = secret()

  /*
    Development without keys. Production never reaches this branch — secret()
    has already thrown — so this cannot become an accidental bypass on a live
    site, only a way to work on the forms locally before keys exist.
  */
  if (!key) {
    console.warn(
      "[recaptcha] RECAPTCHA_SECRET_KEY is not set; skipping verification (development only).",
    )
    return { ok: true }
  }

  if (typeof token !== "string" || !token)
    return { ok: false, retry: true, reason: "missing-token" }

  const body = new URLSearchParams({ secret: key, response: token })
  // Optional, and only a hint to Google's scoring — never trusted as identity.
  if (ip) body.set("remoteip", ip)

  let payload: { success?: boolean; "error-codes"?: string[] }

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok)
      return { ok: false, retry: false, reason: `siteverify-http-${response.status}` }

    payload = await response.json()
  } catch {
    // Google unreachable. Refused rather than waved through: this is the only
    // anti-bot control on the form, so failing open would disable it entirely
    // whenever the network hiccuped.
    return { ok: false, retry: false, reason: "siteverify-unreachable" }
  }

  if (payload.success) return { ok: true }

  const codes = payload["error-codes"] ?? []

  /*
    Two of Google's codes mean the visitor can simply try again — the token was
    used already, or it sat unsubmitted past its two-minute life. The rest
    (bad secret, malformed request) are our misconfiguration, and telling the
    visitor to re-tick the box would send them round a loop that cannot end.
  */
  const retry =
    codes.includes("timeout-or-duplicate") || codes.includes("invalid-input-response")

  return { ok: false, retry, reason: codes.join(",") || "verification-failed" }
}
