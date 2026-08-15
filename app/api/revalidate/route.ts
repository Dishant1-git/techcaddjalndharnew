import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { CMS_CACHE_TAG } from "@/lib/cms"

/**
 * Drops the cached CMS responses so the next request re-fetches.
 *
 * Called by the CMS whenever content is created, updated or deleted. Without
 * it a published change waits out the cache window, which to an editor is
 * indistinguishable from the change not having saved.
 *
 * Every CMS read is tagged, so one call clears all of them. That is coarser
 * than clearing the affected path, and deliberately so: content crosses pages
 * — a testimonial shows on the homepage and its own section, a course appears
 * in three listings and a sitemap — and a per-path scheme would silently miss
 * one. The cost of over-clearing is one extra query.
 */

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET

  // Fail closed. An unauthenticated endpoint that drops the cache is a free
  // way to push load onto the database, so an unconfigured secret disables it
  // rather than leaving it open.
  if (!secret) {
    console.error("[revalidate] REVALIDATE_SECRET is not set — refusing.")
    return NextResponse.json({ error: "Revalidation is not configured." }, { status: 503 })
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret")

  if (provided !== secret) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 })
  }

  revalidateTag(CMS_CACHE_TAG)

  return NextResponse.json({ revalidated: true })
}
