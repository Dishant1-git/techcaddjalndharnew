import { NextResponse } from "next/server"
import { verifyCaptcha } from "@/lib/captcha"
import { COURSE_LABELS } from "@/lib/course-pages"
import { claimCaptcha } from "@/lib/spent-captchas"
import { ensureTable, isRateLimited, saveEnquiry } from "@/lib/enquiries"

export const dynamic = "force-dynamic"

/** Nothing legitimate comes close; anything larger is refused unread. */
const MAX_BODY_BYTES = 4096

/** Anything longer is a paste, not a message. */
const MAX_MESSAGE = 2000

type Fields = {
  name: string
  phone: string
  course: string
  message: string | null
}

/** Rejects the obvious junk before anything downstream sees it. */
function validate(
  body: Record<string, unknown>,
): { error: string } | { fields: Fields } {
  const name = String(body.name ?? "").trim()
  const phone = String(body.phone ?? "").trim()
  const course = String(body.course ?? "").trim()
  const message = String(body.message ?? "").trim()

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

/**
 * First hop in X-Forwarded-For is the visitor; the rest are proxies. A client
 * can forge this header, so treat it as a hint for triage and rate-limiting
 * friction — never as identity.
 */
function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim().slice(0, 45) || null
}

function bad(error: string, extra: Record<string, unknown> = {}, status = 400) {
  return NextResponse.json({ error, ...extra }, { status })
}

export async function POST(request: Request) {
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

  // Signature check first: it is pure computation, so bots never reach the
  // database. Burning the token comes later, once the fields are known good,
  // so a visitor with a typo does not lose their captcha.
  const solved = verifyCaptcha(body.captchaToken, body.captchaAnswer)
  if (!solved)
    return bad("That answer was wrong or expired. Here's a new one.", {
      captcha: true,
    })

  const checked = validate(body)
  if ("error" in checked) return bad(checked.error)

  try {
    await ensureTable()

    if (await isRateLimited(clientIp(request), checked.fields.phone))
      return bad(
        "We already have your enquiry. A counsellor will call you shortly.",
        {},
        429,
      )

    // Single-use: a solved token cannot be replayed for the rest of its life.
    if (!(await claimCaptcha(solved.nonce, solved.expiresAt)))
      return bad("That verification was already used. Here's a new one.", {
        captcha: true,
      })

    await saveEnquiry({
      ...checked.fields,
      source: String(body.source ?? "").trim().slice(0, 255) || null,
      ip: clientIp(request),
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

  return NextResponse.json({ ok: true })
}
