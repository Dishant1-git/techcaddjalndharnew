import { NextResponse } from "next/server"
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/admin-auth"
import { rateLimit } from "@/lib/rate-limit"
import { clientIp, isTrustedOrigin } from "@/lib/request-guard"

export const dynamic = "force-dynamic"

/** Nothing legitimate comes close; anything larger is refused unread. */
const MAX_BODY_BYTES = 1024

/**
 * Attempts per address per window. Deliberately tight: there is exactly one
 * account, so this is the whole of the brute-force defence — there is no
 * lockout to trip and no second factor behind it.
 */
const ATTEMPT_LIMIT = 8
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000

const NO_STORE = { "Cache-Control": "no-store" }

/**
 * The same message for an unknown username and a wrong password. Telling them
 * apart would confirm which half was right, which is exactly the fact a single
 * fixed account cannot afford to give away.
 */
const REFUSED = "That username or password is not right."

function bad(error: string, status = 400, extra: Record<string, string> = {}) {
  return NextResponse.json(
    { error },
    { status, headers: { ...NO_STORE, ...extra } },
  )
}

export async function POST(request: Request) {
  if (!isTrustedOrigin(request))
    return bad("This request did not come from our site.", 403)

  const ip = clientIp(request)

  // With no trustworthy address every caller shares one bucket, which would
  // let one attacker lock the real administrator out. The shared ceiling is
  // therefore much higher — it is a flood guard, not a per-person limit.
  const gate = rateLimit(
    ip ? `admin-login:${ip}` : "admin-login:unattributed",
    ip ? ATTEMPT_LIMIT : ATTEMPT_LIMIT * 25,
    ATTEMPT_WINDOW_MS,
  )
  if (!gate.ok)
    return bad("Too many attempts. Please try again later.", 429, {
      "Retry-After": String(gate.retryAfter),
    })

  let body: Record<string, unknown>
  try {
    const text = await request.text()
    if (text.length > MAX_BODY_BYTES) return bad("That request was too large.", 413)
    body = JSON.parse(text)
  } catch {
    return bad("Malformed request.")
  }

  if (!body || typeof body !== "object") return bad("Malformed request.")

  let token: string
  try {
    if (!verifyCredentials(body.username, body.password)) return bad(REFUSED, 401)
    token = createSessionToken()
  } catch (error) {
    // A missing or too-short ADMIN_SESSION_SECRET throws in production rather
    // than signing cookies with a value that is published in this repository.
    console.error("[admin] sign-in could not be completed:", error)
    return bad("Sign-in is unavailable right now.", 500)
  }

  const response = NextResponse.json({ ok: true }, { headers: NO_STORE })
  response.cookies.set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(SESSION_MAX_AGE_SECONDS),
  )
  return response
}
