import { NextResponse, type NextRequest } from "next/server"

/**
 * Applies the redirects managed in the CMS.
 *
 * Middleware rather than `next.config.mjs`: config redirects are baked in at
 * build time, so a URL an editor retired this morning would keep 404ing until
 * the next deploy — which is the whole reason the CMS models them.
 *
 * The list is fetched, not looked up per request. It is small, changes rarely,
 * and middleware runs on every navigation: a network round trip in that path
 * would tax every page to serve the handful that redirect.
 */

const BASE = (process.env.CMS_API_URL ?? "http://localhost:4001/api").replace(/\/$/, "")

/** How long a fetched list is reused. Middleware has no Next data cache. */
const TTL_MS = 60_000

/** A slow CMS must not hold up a navigation. */
const TIMEOUT_MS = 2000

type Redirect = { from: string; to: string; permanent: boolean }

let cache: { at: number; items: Redirect[] } | null = null
let inflight: Promise<Redirect[]> | null = null

async function fetchRedirects(): Promise<Redirect[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE}/public/redirects`, {
      signal: controller.signal,
      cache: "no-store",
    })
    if (!response.ok) return []

    const payload = (await response.json()) as {
      items?: { from: string; to: string; type: number }[]
    }

    return (payload.items ?? []).map((row) => ({
      from: row.from,
      to: row.to,
      permanent: row.type === 301,
    }))
  } catch {
    // An unreachable CMS means no redirects this minute, not a broken site.
    return []
  } finally {
    clearTimeout(timer)
  }
}

async function redirects(): Promise<Redirect[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.items

  // One fetch per expiry, however many requests arrive while it is in flight.
  inflight ??= fetchRedirects()
    .then((items) => {
      cache = { at: Date.now(), items }
      return items
    })
    .finally(() => {
      inflight = null
    })

  // A stale list beats making the visitor wait: serve what we have and let the
  // refresh land for the next request.
  if (cache) return cache.items
  return inflight
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const match = (await redirects()).find((rule) => rule.from === pathname)
  if (!match) return NextResponse.next()

  const url = new URL(match.to, request.url)
  // Query strings belong to the visitor, not the rule — a campaign tag must
  // survive the hop unless the rule sets its own.
  if (!url.search) url.search = search

  return NextResponse.redirect(url, match.permanent ? 301 : 302)
}

export const config = {
  /**
   * Everything except Next's own assets, the API routes and static files.
   *
   * Anything with a file extension is excluded too: a redirect rule is about
   * pages, and running this for every image would multiply the work for
   * nothing.
   */
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
}
