import { NextResponse } from "next/server"
import { COURSE_LABELS } from "@/lib/course-pages"
import { verifyRecaptcha } from "@/lib/recaptcha"
import {
  ensureTable,
  formTypeFor,
  isRateLimited,
  saveEnquiry,
} from "@/lib/enquiries"
import { rateLimit } from "@/lib/rate-limit"
import { clientIp, isTrustedOrigin } from "@/lib/request-guard"

export const dynamic = "force-dynamic"

/** Nothing legitimate comes close; anything larger is refused unread. */
const MAX_BODY_BYTES = 4096

/** Anything longer is a paste, not a message. */
const MAX_MESSAGE = 2000

/**
 * Ceiling on attempts per address before any parsing or database work. The
 * per-phone and per-IP limits in lib/enquiries.ts still apply to whatever gets
 * through — this one exists so a flood costs us nothing but a map lookup.
 */
const ATTEMPT_LIMIT = 12
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000

const NO_STORE = { "Cache-Control": "no-store" }

type Fields = {
  name: string
  phone: string
  course: string
  message: string | null
}

const TAB = 9
const NEWLINE = 10

/** C0 controls, DEL, and the C1 block — none of them typed by a person. */
function isControl(code: number) {
  return code < 32 || code === 127 || (code >= 128 && code <= 159)
}

/**
 * Trims, and replaces control characters with a space. They never occur in
 * something a visitor typed, but one smuggled into a stored field forges lines
 * in whatever log, CSV export or admin screen reads the table later.
 */
function clean(value: unknown, allowNewlines = false): string {
  let out = ""
  for (const char of String(value ?? "")) {
    const code = char.codePointAt(0) ?? 0
    if (!isControl(code)) out += char
    // The message comes from a textarea, so tab and newline are content there.
    else if (allowNewlines && (code === TAB || code === NEWLINE)) out += char
    else out += " "
  }
  return out.trim()
}

/** Rejects the obvious junk before anything downstream sees it. */
function validate(
  body: Record<string, unknown>,
): { error: string } | { fields: Fields } {
  const name = clean(body.name)
  const phone = clean(body.phone)
  const course = clean(body.course)
  const message = clean(body.message, true)

  if (name.length < 2 || name.length > 80)
    return { error: "Please enter your full name." }
  if (!/^[0-9]{10}$/.test(phone))
    return { error: "Please enter a valid 10-digit number." }

  // The course-page form locks this field in the UI, but the lock is only
  // real once the server refuses anything outside the catalogue.
  if (!course) return { error: "Please choose a course." }
  if (!COURSE_LABELS.has(course))
    return { error: "That course is not one we run." }

  if (message.length > MAX_MESSAGE)
    return { error: "Please shorten your message." }

  return { fields: { name, phone, course, message: message || null } }
}

function bad(error: string, extra: Record<string, unknown> = {}, status = 400) {
  return NextResponse.json({ error, ...extra }, { status, headers: NO_STORE })
}

export async function POST(request: Request) {
  // A cross-site page can post JSON-shaped text/plain without a preflight, so
  // the browser never blocks it. Nothing here rides on a session, but this is
  // what stops someone else's page filling our table from their visitors.
  if (!isTrustedOrigin(request))
    return bad("This request did not come from our site.", {}, 403)

  const ip = clientIp(request)

  // With no trustworthy address — TRUSTED_PROXY_HOPS=0, or a proxy that sends
  // nothing — every visitor collapses into one bucket. That bucket is a global
  // flood ceiling, not a per-person limit, so it is set far higher: a shared
  // limit of 12 would lock the whole site out after a dozen submissions.
  const gate = rateLimit(
    ip ? `enquiry:${ip}` : "enquiry:unattributed",
    ip ? ATTEMPT_LIMIT : ATTEMPT_LIMIT * 25,
    ATTEMPT_WINDOW_MS,
  )
  if (!gate.ok)
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      {
        status: 429,
        headers: { ...NO_STORE, "Retry-After": String(gate.retryAfter) },
      },
    )

  const declared = Number(request.headers.get("content-length") ?? 0)
  if (declared > MAX_BODY_BYTES) return bad("That request was too large.", {}, 413)

  let body: Record<string, unknown>
  try {
    const text = await request.text()
    // Re-checked after reading: content-length is a claim, not a guarantee.
    if (text.length > MAX_BODY_BYTES) return bad("That request was too large.", {}, 413)
    body = JSON.parse(text)
  } catch {
    return bad("Malformed request.")
  }

  if (!body || typeof body !== "object") return bad("Malformed request.")

  /*
    Fields first, then reCAPTCHA.

    The order is the reverse of the arithmetic captcha's, and deliberately so.
    That one was pure local computation, so checking it first was free. This one
    is a network round trip to Google, and a token is single-use — verifying
    before validating would spend the visitor's tick on a submission that then
    fails on a mistyped phone number, forcing them to solve it again.
  */
  const checked = validate(body)
  if ("error" in checked) return bad(checked.error)

  let verification
  try {
    verification = await verifyRecaptcha(body.recaptchaToken, ip)
  } catch (error) {
    // A missing RECAPTCHA_SECRET_KEY throws in production rather than
    // degrading into "no verification".
    console.error("[enquiry] recaptcha could not be verified:", error)
    return bad("Verification is unavailable right now.", {}, 500)
  }

  if (!verification.ok) {
    console.warn("[enquiry] recaptcha rejected:", verification.reason)
    return verification.retry
      ? // `captcha: true` tells the form to reset the widget.
        bad("That verification expired. Please tick the box again.", {
          captcha: true,
        })
      : bad("We could not verify that request. Please try again later.", {}, 503)
  }

  try {
    await ensureTable()

    if (await isRateLimited(ip, checked.fields.phone))
      return bad(
        "We already have your enquiry. A counsellor will call you shortly.",
        {},
        429,
      )

    await saveEnquiry({
      ...checked.fields,
      // Resolved from a fixed set rather than stored as sent, so the column
      // only ever holds one of our own labels.
      formType: formTypeFor(body.form),
      source: clean(body.source).slice(0, 255) || null,
      ip,
      userAgent: request.headers.get("user-agent"),
    })
  } catch (error) {
    // The message can carry credentials or SQL, so it stays server-side and
    // the visitor gets something they can act on.
    console.error("[enquiry] could not be saved:", error)
    return bad(
      "We could not record your enquiry. Please call us instead.",
      {},
      500,
    )
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
