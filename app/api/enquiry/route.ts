import { NextResponse } from "next/server"
import { verifyCaptcha } from "@/lib/captcha"
import { claimCaptcha } from "@/lib/spent-captchas"
import {
  ensureTable,
  formTypeFor,
  isRateLimited,
  saveEnquiry,
} from "@/lib/enquiries"
import { submitEnquiry } from "@/lib/cms"
import { isKnownCourseLabel } from "@/lib/content"
import { rateLimit } from "@/lib/rate-limit"
import { clientIp, isTrustedOrigin } from "@/lib/request-guard"
import { clean } from "@/lib/sanitize"

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

/** Rejects the obvious junk before anything downstream sees it. */
async function validate(
  body: Record<string, unknown>,
): Promise<{ error: string } | { fields: Fields }> {
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
  // Checked against the CMS as well as the built-in menus: a course created in
  // the CMS renders its own enquiry form, and validating against the menus
  // alone would have that form rejected by the API it posts to.
  if (!(await isKnownCourseLabel(course)))
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
    Captcha before field validation.

    It is pure local computation — an HMAC and one addition — so checking it
    first costs nothing and keeps every later step behind it. Verifying does not
    yet spend the token: the claim that makes it single-use happens further
    down, once the submission is actually going to be written, so a mistyped
    phone number does not cost the visitor the challenge they just solved.
  */
  let solved
  try {
    solved = verifyCaptcha(body.captchaToken, body.captchaAnswer)
  } catch (error) {
    // A missing or too-short CAPTCHA_SECRET throws in production rather than
    // degrading into "no verification".
    console.error("[enquiry] captcha could not be verified:", error)
    return bad("Verification is unavailable right now.", {}, 500)
  }

  // `captcha: true` tells the form to fetch a fresh question — a wrong answer
  // and an expired token are indistinguishable to the visitor, and both are
  // fixed the same way.
  if (!solved)
    return bad("That answer was not right. Please try the new question.", {
      captcha: true,
    })

  // Awaited: the course check consults the CMS catalogue as well as the menus.
  const checked = await validate(body)
  if ("error" in checked) return bad(checked.error)

  /*
    Burn the token.

    lib/captcha.ts is stateless, so a signature stays valid for its whole ten
    minutes — without this, one solved challenge would licence unlimited
    submissions until it expired. A database error here is refused rather than
    waved through, for the same reason the secret fails closed: an unclaimable
    token is an unlimited one.
  */
  try {
    if (!(await claimCaptcha(solved.nonce, solved.expiresAt)))
      return bad("That question was already used. Please answer the new one.", {
        captcha: true,
      })
  } catch (error) {
    console.error("[enquiry] captcha could not be claimed:", error)
    return bad("Verification is unavailable right now.", {}, 500)
  }

  // Resolved from a fixed set rather than stored as sent, so the field only
  // ever holds one of our own labels.
  const formType = formTypeFor(body.form)
  const sourceUrl = clean(body.source).slice(0, 500) || undefined
  const userAgent = request.headers.get("user-agent") ?? undefined

  try {
    // The CMS is the system of record: an enquiry has to appear in the inbox
    // staff actually work from, with its status, notes and assignment.
    const result = await submitEnquiry({
      studentName: checked.fields.name,
      phone: checked.fields.phone,
      // The public forms ask for a phone number, not an email.
      courseName: checked.fields.course,
      message: checked.fields.message || undefined,
      formType,
      sourceUrl,
      ip: ip ?? undefined,
      userAgent,
    })

    // Not an error: the enquiry reached us, we are simply not filing it twice.
    if (!result.ok) return bad(result.message, {}, 429)
  } catch (cmsError) {
    // The CMS being down must not cost a lead. Record it locally and say so
    // loudly — these rows need moving across once the CMS is back.
    console.error("[enquiry] CMS unavailable, falling back to local table:", cmsError)

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
        formType,
        source: sourceUrl ?? null,
        ip,
        userAgent: userAgent ?? null,
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
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
