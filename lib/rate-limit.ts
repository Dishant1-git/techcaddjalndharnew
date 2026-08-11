/**
 * Fixed-window rate limiter held in process memory.
 *
 * This is the first gate in front of every API route, and it exists to stop a
 * flood before it reaches the database — the captcha only proves a request is
 * scripted-but-patient, and a bot can solve `4 + 7` as fast as it can ask for
 * a new one.
 *
 * Deliberately in-memory: no Redis to run, no extra network hop in the request
 * path, and a marketing site runs as one process. Two consequences to know:
 *   - counters reset on deploy or restart,
 *   - behind more than one app instance each holds its own counters, so the
 *     effective limit multiplies. Put the real limit at the proxy or WAF then,
 *     and treat this as a backstop.
 */

type Bucket = { hits: number; resetAt: number }

/**
 * Ceiling on tracked keys. A flood from forged addresses would otherwise grow
 * the map without bound — the limiter itself becoming the memory exhaustion it
 * is meant to prevent.
 */
const MAX_KEYS = 20_000

// Next.js replaces modules on every edit in development; parking the map on
// globalThis keeps one set of counters instead of one per reload.
const globalForLimiter = globalThis as typeof globalThis & {
  __rateBuckets?: Map<string, Bucket>
}
const buckets = (globalForLimiter.__rateBuckets ??= new Map<string, Bucket>())

export type RateLimitResult = {
  ok: boolean
  /** Seconds until the window rolls over; 0 when the request was allowed. */
  retryAfter: number
}

/** Drops expired keys, and everything if that was not enough. */
function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
  // Still at the ceiling means live windows alone fill the map — a distributed
  // flood. Forgiving one window is the cheaper failure: the alternative is an
  // unbounded map, and the request still has the captcha and the per-phone
  // limit in front of it.
  if (buckets.size >= MAX_KEYS) buckets.clear()
}

/**
 * Counts one hit against `key` and says whether it may proceed.
 * Callers namespace their own keys, e.g. `enquiry:1.2.3.4`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) sweep(now)
    buckets.set(key, { hits: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  bucket.hits += 1
  if (bucket.hits > limit)
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }

  return { ok: true, retryAfter: 0 }
}
