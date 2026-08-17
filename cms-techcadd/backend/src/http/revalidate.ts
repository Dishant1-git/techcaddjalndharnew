import type { NextFunction, Request, Response } from 'express'

import { config } from '../config.js'

/**
 * Tells the website to drop its cached content after a change here.
 *
 * The website caches CMS reads so a marketing page does not hit this API on
 * every request. Left to expire on its own, a change an editor just saved does
 * not appear for minutes — which reads as the save having failed, and is the
 * single most common complaint about a headless setup.
 *
 * Fired after the response, never before it: the editor's save must not wait on
 * the website, and must not fail if the website is down. A missed call costs
 * one cache window, which is where things stood before this existed.
 */

/**
 * Longer than this and the site is in no state to be revalidated anyway.
 *
 * Generous because this call costs nothing to wait on — it happens after the
 * editor's save has already returned. A development server compiling the route
 * for the first time routinely takes several seconds, and aborting produced a
 * scary-looking log line for something that was about to succeed.
 */
const TIMEOUT_MS = Number(process.env.REVALIDATE_TIMEOUT_MS ?? 15000)

/** Coalesces the burst a multi-step save produces into one call. */
const DEBOUNCE_MS = 400

let pending: NodeJS.Timeout | null = null

function schedule() {
  const { SITE_REVALIDATE_URL, REVALIDATE_SECRET } = config
  if (!SITE_REVALIDATE_URL || !REVALIDATE_SECRET) return

  if (pending) clearTimeout(pending)

  pending = setTimeout(() => {
    pending = null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    void fetch(SITE_REVALIDATE_URL, {
      method: 'POST',
      headers: { 'x-revalidate-secret': REVALIDATE_SECRET },
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 404) {
          // Almost always the URL rather than the site: a 404 means something
          // answered, just not this endpoint.
          console.warn(
            `[revalidate] no endpoint at ${SITE_REVALIDATE_URL} — check SITE_REVALIDATE_URL points at the website's port.`,
          )
        } else if (!response.ok) {
          console.warn(`[revalidate] site responded ${response.status}`)
        }
      })
      .catch((error: unknown) => {
        // Worth a line in the log, but not worth failing anything over: the
        // save succeeded, and the site will pick the change up when its own
        // cache expires.
        const reason = error instanceof Error ? error.message : String(error)
        console.warn(`[revalidate] could not reach the site (${reason}) — it will refresh on its own.`)
      })
      .finally(() => clearTimeout(timer))
  }, DEBOUNCE_MS)

  // Never hold the process open for a cache ping.
  pending.unref?.()
}

/** Requests that changed nothing need no revalidation. */
const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

/**
 * Routes whose content the website never reads.
 *
 * Signing in or editing a user changes nothing a visitor can see, and pinging
 * the site on every login would be noise.
 */
const IGNORED = [/^\/api\/auth\b/, /^\/api\/users\b/, /^\/api\/search\b/, /^\/api\/dashboard\b/]

export function revalidateSite(req: Request, res: Response, next: NextFunction) {
  if (!MUTATING.has(req.method) || IGNORED.some((pattern) => pattern.test(req.path))) {
    return next()
  }

  res.on('finish', () => {
    // 2xx only: a rejected save left the content untouched.
    if (res.statusCode >= 200 && res.statusCode < 300) schedule()
  })

  next()
}
