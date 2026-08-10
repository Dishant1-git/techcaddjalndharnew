import { NextResponse } from "next/server"
import { createCaptcha } from "@/lib/captcha"

/** Each request must mint a fresh challenge, so nothing here may be cached. */
export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json(createCaptcha(), {
    headers: { "Cache-Control": "no-store" },
  })
}
