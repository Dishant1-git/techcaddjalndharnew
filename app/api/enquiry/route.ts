import { NextResponse } from "next/server"
import { verifyCaptcha } from "@/lib/captcha"

export const dynamic = "force-dynamic"

/** Rejects the obvious junk before anything downstream sees it. */
function invalid(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim()
  const phone = String(body.phone ?? "").trim()
  const course = String(body.course ?? "").trim()

  if (name.length < 2 || name.length > 80) return "Please enter your full name."
  if (!/^[0-9]{10}$/.test(phone)) return "Please enter a valid 10-digit number."
  if (!course) return "Please choose a course."
  return null
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 })
  }

  // Captcha first — no point validating fields for a bot.
  if (!verifyCaptcha(body.captchaToken, body.captchaAnswer)) {
    return NextResponse.json(
      { error: "That answer was wrong or expired. Here's a new one.", captcha: true },
      { status: 400 },
    )
  }

  const message = invalid(body)
  if (message) return NextResponse.json({ error: message }, { status: 400 })

  // TODO: deliver the enquiry — email, CRM or database. Deliberately not
  // logged here, since the payload is a name and a phone number.

  return NextResponse.json({ ok: true })
}
