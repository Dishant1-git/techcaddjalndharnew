import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

/**
 * Stateless arithmetic captcha.
 *
 * The token carries a random nonce and an expiry, signed with a server secret.
 * The two numbers are *derived* from that nonce via HMAC — so the server can
 * recompute the expected answer with nothing stored, while a client holding
 * the token cannot, because deriving it needs the secret.
 *
 * This is why the answer is never placed in the token: the answer space is
 * about sixteen values, so any encoded or hashed form of it would fall to a
 * brute-force in microseconds.
 */

const TTL_MS = 10 * 60 * 1000

/**
 * Set CAPTCHA_SECRET in the environment for production. The fallback keeps
 * local development working, and is deliberately obvious in a leak.
 */
const SECRET =
  process.env.CAPTCHA_SECRET ?? "techcadd-dev-only-secret-set-CAPTCHA_SECRET"

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url")
}

/** Both operands come from the nonce, so they survive a round trip unstored. */
function operands(nonce: string): [number, number] {
  const digest = createHmac("sha256", SECRET).update(`ops:${nonce}`).digest()
  return [2 + (digest[0] % 8), 1 + (digest[1] % 9)]
}

export function createCaptcha() {
  const nonce = randomBytes(12).toString("base64url")
  const expires = Date.now() + TTL_MS
  const payload = `${nonce}.${expires}`
  const [a, b] = operands(nonce)

  return {
    token: `${payload}.${sign(payload)}`,
    question: `${a} + ${b} = ?`,
  }
}

export function verifyCaptcha(token: unknown, answer: unknown): boolean {
  if (typeof token !== "string" || typeof answer !== "string") return false

  const parts = token.split(".")
  if (parts.length !== 3) return false

  const [nonce, expires, signature] = parts
  const expected = sign(`${nonce}.${expires}`)

  // Constant-time, and length-guarded because timingSafeEqual throws on a
  // length mismatch rather than returning false.
  const given = Buffer.from(signature)
  const want = Buffer.from(expected)
  if (given.length !== want.length || !timingSafeEqual(given, want)) return false

  if (!Number(expires) || Number(expires) < Date.now()) return false

  const [a, b] = operands(nonce)
  return Number(answer.trim()) === a + b
}
