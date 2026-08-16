import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

/**
 * Sign-in for the /admin dashboard.
 *
 * One fixed account, no users table. The dashboard is read-only — it shows the
 * enquiries the public forms already wrote — so the thing being protected is
 * visitors' names and phone numbers, not a write path. A single credential pair
 * held in the environment is the honest amount of machinery for that, and it is
 * the CMS in cms-techcadd/ that owns real accounts, roles and password resets.
 *
 * The session is a signed, expiring token in an httpOnly cookie. Nothing is
 * stored server-side, so there is no session table to grow and no state to lose
 * on restart — the trade is that signing out cannot revoke a token that has
 * already been issued, only stop the browser sending it. Changing the password
 * does revoke them, via the fingerprint baked into the signature.
 */

export const SESSION_COOKIE = "techcadd_admin"

/** A working day. Long enough not to nag, short enough that a walk-away ends. */
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60

/** Shortest secret worth calling one for HMAC-SHA256. */
const MIN_SECRET_LENGTH = 32

const DEV_SECRET = "techcadd-dev-only-secret-set-ADMIN_SESSION_SECRET"

/** The predefined account. Both are overridable from the environment. */
const DEFAULT_USERNAME = "techcadd"
const DEFAULT_PASSWORD = "techcadd@123"

function adminUsername(): string {
  return (process.env.ADMIN_USERNAME || DEFAULT_USERNAME).trim().toLowerCase()
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD
}

/** For the "signed in as" line — never the password. */
export function adminDisplayName(): string {
  return adminUsername()
}

/**
 * Read per call rather than at import, so a missing secret fails the request
 * that needs it instead of the whole build.
 *
 * Falls back to CAPTCHA_SECRET, which is already required in production, so a
 * correctly configured deploy does not need a second variable to be remembered.
 * Every signature is domain-separated with a purpose string, so a token minted
 * here can never be mistaken for a captcha and vice versa.
 *
 * Production fails closed for the same reason lib/captcha.ts does: anyone
 * holding a known secret can mint a session cookie, and the fallback value
 * lives in a public repository.
 */
function secret(): string {
  const configured = (
    process.env.ADMIN_SESSION_SECRET || process.env.CAPTCHA_SECRET
  )?.trim()

  if (process.env.NODE_ENV === "production") {
    if (!configured || configured.length < MIN_SECRET_LENGTH)
      throw new Error(
        `ADMIN_SESSION_SECRET must be set to at least ${MIN_SECRET_LENGTH} random characters in production.`,
      )
    if (configured === DEV_SECRET)
      throw new Error("ADMIN_SESSION_SECRET is still the development placeholder.")
  }

  return configured || DEV_SECRET
}

function sign(payload: string): string {
  return createHmac("sha256", secret())
    .update(`admin-session:v1|${payload}`)
    .digest("base64url")
}

/**
 * A short digest of the credentials the token was issued against. Rotating the
 * username or password changes it, which invalidates every cookie still in the
 * wild — otherwise a leaked password would stay usable for its full session
 * life after being changed.
 */
function credentialFingerprint(): string {
  return createHmac("sha256", secret())
    .update(`admin-credentials:v1|${adminUsername()}|${adminPassword()}`)
    .digest("base64url")
    .slice(0, 16)
}

/**
 * Constant-time string comparison. `timingSafeEqual` throws on a length
 * mismatch rather than returning false, so unequal lengths still run a
 * comparison — a caller must not be able to learn the password's length from
 * how quickly it is rejected.
 */
function equals(given: string, expected: string): boolean {
  const left = Buffer.from(given)
  const right = Buffer.from(expected)
  if (left.length !== right.length) {
    timingSafeEqual(right, right)
    return false
  }
  return timingSafeEqual(left, right)
}

/**
 * Both fields are always compared, even once the first has failed. Short-
 * circuiting would answer "is this username real?" in the response time, which
 * is the one thing an unknown-account check is supposed to withhold.
 */
export function verifyCredentials(username: unknown, password: unknown): boolean {
  const nameOk = equals(String(username ?? "").trim().toLowerCase(), adminUsername())
  const passwordOk = equals(String(password ?? ""), adminPassword())
  return nameOk && passwordOk
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = `${expiresAt}.${credentialFingerprint()}`
  return `${payload}.${sign(payload)}`
}

export type AdminSession = { username: string; expiresAt: Date }

function verifySessionToken(token: string): AdminSession | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null

  const [expires, fingerprint, signature] = parts

  const given = Buffer.from(signature)
  const want = Buffer.from(sign(`${expires}.${fingerprint}`))
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null

  // Checked after the signature so a forged fingerprint cannot be probed.
  if (fingerprint !== credentialFingerprint()) return null

  const expiresAt = Number(expires)
  if (!expiresAt || expiresAt < Date.now()) return null

  return { username: adminUsername(), expiresAt: new Date(expiresAt) }
}

/** The signed-in account, or null. Safe to call from any server component. */
export async function readSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    return verifySessionToken(token)
  } catch {
    // A misconfigured secret throws; that is "not signed in", not a crash on
    // every page the guard runs on.
    return null
  }
}

/** The cookie attributes, shared by the login and logout routes. */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  }
}
