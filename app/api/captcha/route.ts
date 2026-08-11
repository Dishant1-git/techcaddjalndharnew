import { NextResponse } from "next/server"
import { createCaptcha } from "@/lib/captcha"
import { rateLimit } from "@/lib/rate-limit"
import { clientIp } from "@/lib/request-guard"

/** Each request must mint a fresh challenge, so nothing here may be cached. */
export const dynamic = "force-dynamic"

/**
 * Generous next to real use — a visitor needs one challenge per form, plus a
 * few refreshes — and tight enough that nobody farms a pile of tokens to spend
 * against the enquiry endpoint later.
 */
const LIMIT = 30
const WINDOW_MS = 10 * 60 * 1000

const NO_STORE = { "Cache-Control": "no-store" }

export function GET(request: Request) {
  const ip = clientIp(request)

  // Without a trustworthy address everyone shares one bucket, so that bucket
  // has to be a flood ceiling rather than a per-person limit — otherwise the
  // 31st visitor of the hour gets a form that cannot load its challenge.
  const gate = rateLimit(
    ip ? `captcha:${ip}` : "captcha:unattributed",
    ip ? LIMIT : LIMIT * 25,
    WINDOW_MS,
  )
  if (!gate.ok)
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(gate.retryAfter) } },
    )

  try {
    return NextResponse.json(createCaptcha(), { headers: NO_STORE })
  } catch (error) {
    // Almost always a missing or too-short CAPTCHA_SECRET in production. The
    // reason stays in the logs; the visitor gets nothing to probe.
    console.error("[captcha] could not be created:", error)
    return NextResponse.json(
      { error: "Verification is unavailable right now." },
      { status: 500, headers: NO_STORE },
    )
  }
}
