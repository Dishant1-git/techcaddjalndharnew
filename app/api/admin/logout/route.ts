import { NextResponse } from "next/server"
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin-auth"
import { isTrustedOrigin } from "@/lib/request-guard"

export const dynamic = "force-dynamic"

/**
 * Ends the session.
 *
 * Answers with a redirect rather than JSON, because the caller is a plain
 * <form> in the dashboard header — signing out is the one action that has to
 * keep working when the page's JavaScript has not loaded or has failed.
 */
export async function POST(request: Request) {
  // Being logged out by someone else's page is a nuisance rather than a
  // breach, but it is free to refuse.
  if (!isTrustedOrigin(request))
    return NextResponse.json(
      { error: "This request did not come from our site." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    )

  // 303, so the browser follows it with a GET instead of re-POSTing.
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303)

  // Same attributes as when it was set, minus the lifetime — a cookie is only
  // replaced by one whose name, path and domain all match.
  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0))
  response.headers.set("Cache-Control", "no-store")

  return response
}
