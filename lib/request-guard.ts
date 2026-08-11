import { SITE } from "@/lib/site"

/**
 * Who is calling, and from where.
 *
 * Both answers come from request headers, which a client writes freely. The
 * job here is to work out how much of each header was written by infrastructure
 * we control and to ignore the rest.
 */

/**
 * A header your proxy *overwrites* with the peer address — `cf-connecting-ip`
 * behind Cloudflare, `true-client-ip` behind some CDNs. Set it only when the
 * proxy is known to overwrite rather than append, or a client can simply send
 * the header itself.
 */
const IP_HEADER = process.env.CLIENT_IP_HEADER?.trim().toLowerCase() || null

/**
 * How many proxies in front of this app append to X-Forwarded-For.
 * 0 = the app is exposed directly, so the header is a lie and is ignored.
 * 1 = one Nginx / cPanel / Cloudflare hop (the usual case, and the default).
 */
const PROXY_HOPS = Math.max(0, Math.trunc(Number(process.env.TRUSTED_PROXY_HOPS ?? 1)) || 0)

/** Extra origins allowed to post — preview domains, a staging host. */
const EXTRA_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim().toLowerCase().replace(/\/$/, ""))
  .filter(Boolean)

const IS_DEV = process.env.NODE_ENV !== "production"

/** Keeps header junk out of the database and out of the limiter's key space. */
function cleanIp(value: string | undefined): string | null {
  const ip = value?.trim().replace(/^::ffff:/i, "") ?? ""
  if (!ip || ip.length > 45) return null
  return /^[0-9a-f.:]+$/i.test(ip) ? ip : null
}

/**
 * The visitor's address, or null when no part of the chain can be trusted.
 *
 * Each proxy *appends* the address it received the connection from, so with N
 * appending proxies the real client sits N from the right. Anything further
 * left was written by the client and is worth nothing.
 */
export function clientIp(request: Request): string | null {
  if (IP_HEADER) return cleanIp(request.headers.get(IP_HEADER)?.split(",")[0])
  if (PROXY_HOPS === 0) return null

  const chain =
    request.headers
      .get("x-forwarded-for")
      ?.split(",")
      .map((hop) => hop.trim())
      .filter(Boolean) ?? []
  if (!chain.length) return null

  // Fewer entries than configured hops means the deployment does not match
  // TRUSTED_PROXY_HOPS; the leftmost is then the best available guess.
  const index = Math.max(0, chain.length - PROXY_HOPS)
  return cleanIp(chain[index])
}

/** Origin of a URL string, lowercased, or null if it is not a URL. */
function originOf(value: string | null): string | null {
  if (!value) return null
  try {
    return new URL(value).origin.toLowerCase()
  } catch {
    return null
  }
}

/**
 * True when a state-changing request came from one of our own pages.
 *
 * There are no sessions or cookies here, so this is not CSRF in the classic
 * sense — nothing is riding on the visitor's authority. What it stops is a
 * third-party page quietly posting into our enquiry table from every visitor
 * it can reach, which a cross-site form can otherwise do without a preflight.
 *
 * A request with neither Origin nor Referer is not a browser form submission,
 * so it is refused rather than waved through.
 */
export function isTrustedOrigin(request: Request): boolean {
  const origin =
    originOf(request.headers.get("origin")) ??
    originOf(request.headers.get("referer"))
  if (!origin) return false

  // Same host as the request itself: a page of ours, whatever domain the site
  // is being served on today. Host is client-controlled, but matching it means
  // the caller is only ever talking to itself.
  const host = request.headers.get("host")?.toLowerCase()
  if (host && (origin === `https://${host}` || origin === `http://${host}`))
    return true

  if (origin === SITE.url.toLowerCase().replace(/\/$/, "")) return true
  if (EXTRA_ORIGINS.includes(origin)) return true

  return IS_DEV && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
}
