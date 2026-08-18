import { NextResponse } from "next/server"
import { CATALOGUE, getCoursePage } from "@/lib/course-pages"
import {
  isKnownCourseLabel,
  loadContact,
  loadCourseCatalogue,
  loadCourseSpecs,
} from "@/lib/content"
import { renderBrochurePdf } from "@/lib/brochure-pdf"
import { verifyCaptcha } from "@/lib/captcha"
import { claimCaptcha } from "@/lib/spent-captchas"
import {
  ensureTable,
  formTypeFor,
  forwardPendingEnquiries,
  isRateLimited,
  saveEnquiry,
} from "@/lib/enquiries"
import { rateLimit } from "@/lib/rate-limit"
import { clientIp, isTrustedOrigin } from "@/lib/request-guard"
import { clean } from "@/lib/sanitize"

export const dynamic = "force-dynamic"

/**
 * The brochure PDF exists nowhere as a static file — it is built fresh, in
 * this handler, only after the fields below pass validation, the captcha and
 * the same per-phone/per-IP limits as every other enquiry. There is no
 * companion GET route and no signed link: the only way to receive the bytes
 * is a successful POST here, which is what "protected" means for this
 * feature. Everything else mirrors app/api/enquiry/route.ts on purpose —
 * same guard order, same failure shape — so the two routes stay easy to
 * compare and cannot quietly drift apart on security behaviour.
 */

const MAX_BODY_BYTES = 4096
const ATTEMPT_LIMIT = 10
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000

const NO_STORE = { "Cache-Control": "no-store" }

type Fields = {
  name: string
  email: string
  phone: string
  course: string
  address: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function validate(
  body: Record<string, unknown>,
): Promise<{ error: string } | { fields: Fields }> {
  const name = clean(body.name)
  const email = clean(body.email)
  const phone = clean(body.phone)
  const course = clean(body.course)
  const address = clean(body.address, true)

  if (name.length < 2 || name.length > 80)
    return { error: "Please enter your full name." }
  if (email.length > 254 || !EMAIL_RE.test(email))
    return { error: "Please enter a valid email address." }
  if (!/^[0-9]{10}$/.test(phone))
    return { error: "Please enter a valid 10-digit number." }

  // The form locks this field to whichever course page it was opened from,
  // but that lock is only real once the server refuses anything else.
  if (!course) return { error: "Please choose a course." }
  // The CMS as well as the built-in menus — see the note in the enquiry route.
  if (!(await isKnownCourseLabel(course)))
    return { error: "That course is not one we run." }

  if (address.length < 5 || address.length > 300)
    return { error: "Please enter your address." }

  return { fields: { name, email, phone, course, address } }
}

function bad(error: string, extra: Record<string, unknown> = {}, status = 400) {
  return NextResponse.json({ error, ...extra }, { status, headers: NO_STORE })
}

export async function POST(request: Request) {
  if (!isTrustedOrigin(request))
    return bad("This request did not come from our site.", {}, 403)

  const ip = clientIp(request)

  const gate = rateLimit(
    ip ? `brochure:${ip}` : "brochure:unattributed",
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
    if (text.length > MAX_BODY_BYTES) return bad("That request was too large.", {}, 413)
    body = JSON.parse(text)
  } catch {
    return bad("Malformed request.")
  }

  if (!body || typeof body !== "object") return bad("Malformed request.")

  // Local computation, so it goes ahead of everything else. Verifying does not
  // spend the token — the claim below does, once the row is about to be
  // written — so a mistyped field does not cost the visitor their answer.
  let solved
  try {
    solved = verifyCaptcha(body.captchaToken, body.captchaAnswer)
  } catch (error) {
    console.error("[brochure] captcha could not be verified:", error)
    return bad("Verification is unavailable right now.", {}, 500)
  }

  if (!solved)
    return bad("That answer was not right. Please try the new question.", {
      captcha: true,
    })

  // Awaited: the course check consults the CMS catalogue as well as the menus.
  const checked = await validate(body)
  if ("error" in checked) return bad(checked.error)

  // Resolved from the same two catalogues the course field was checked
  // against, in the same order, so the lookup cannot disagree with the check.
  const extra = await loadCourseCatalogue()
  const byLabel = (e: { label: string }) => e.label === checked.fields.course
  const entry = CATALOGUE.find(byLabel) ?? extra.find(byLabel)
  if (!entry) return bad("That course is not one we run.")

  const coursePage = getCoursePage(
    entry.segment,
    entry.slug,
    await loadCourseSpecs(),
    extra,
  )
  if (!coursePage) return bad("That course is not one we run.")

  // Single-use, or one solved challenge would download brochures for the whole
  // ten minutes its signature stays valid. Refused on a database error rather
  // than waved through: an unclaimable token is an unlimited one.
  try {
    if (!(await claimCaptcha(solved.nonce, solved.expiresAt)))
      return bad("That question was already used. Please answer the new one.", {
        captcha: true,
      })
  } catch (error) {
    console.error("[brochure] captcha could not be claimed:", error)
    return bad("Verification is unavailable right now.", {}, 500)
  }

  try {
    await ensureTable()

    // Shared with the enquiry forms on purpose: a phone number that has
    // already hit today's limit there should not be able to sidestep it by
    // downloading brochures instead.
    if (await isRateLimited(ip, checked.fields.phone))
      return bad(
        "We already have your details. A counsellor will call you shortly.",
        {},
        429,
      )

    await saveEnquiry({
      ...checked.fields,
      formType: formTypeFor("brochure"),
      message: null,
      source: clean(body.source).slice(0, 255) || null,
      ip,
      userAgent: request.headers.get("user-agent"),
    })

    // A brochure download is a lead, and leads are worked in the CMS. This
    // route writes locally first because the PDF must not depend on the CMS
    // being up, so the row is pushed across straight afterwards.
    void forwardPendingEnquiries().catch((error: unknown) => {
      console.error("[brochure] could not forward the enquiry to the CMS:", error)
    })
  } catch (error) {
    console.error("[brochure] enquiry could not be saved:", error)
    return bad(
      "We could not process that request. Please call us instead.",
      {},
      500,
    )
  }

  let pdf: Buffer
  try {
    pdf = await renderBrochurePdf(coursePage, await loadContact())
  } catch (error) {
    // The lead is already saved at this point, so a counsellor still has it
    // even though the download itself failed — worth logging loudly.
    console.error("[brochure] pdf could not be rendered:", error)
    return bad(
      "Your details were recorded, but the brochure could not be generated. Please call us instead.",
      {},
      500,
    )
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      ...NO_STORE,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="techcadd-${entry.slug}-brochure.pdf"`,
      "Content-Length": String(pdf.length),
    },
  })
}
