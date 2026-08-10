import { execute } from "@/lib/db"

/**
 * Makes a solved captcha single-use.
 *
 * lib/captcha.ts is stateless by design: it can tell you a token is genuine
 * and correctly answered, but not whether it has been used before. Without
 * this, one solved challenge is a licence to submit unlimited enquiries for
 * the next ten minutes — the signature stays valid until it expires.
 *
 * The nonce is the primary key, so a replay is a duplicate-key error rather
 * than a check-then-insert race between two concurrent requests.
 */

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS spent_captchas (
    nonce      VARCHAR(32) NOT NULL,
    expires_at DATETIME    NOT NULL,
    PRIMARY KEY (nonce),
    KEY idx_expires_at (expires_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`

const DUPLICATE_KEY = "ER_DUP_ENTRY"

let ensured: Promise<void> | null = null

function ensureTable() {
  if (process.env.DB_AUTO_MIGRATE === "false") return Promise.resolve()
  ensured ??= execute(CREATE_TABLE).then(() => undefined)
  return ensured
}

/**
 * Claims a token. Returns true the first time and false for every replay.
 * Rows are only needed until the token would expire on its own, so each
 * claim clears the ones that have aged out — the table stays tiny.
 */
export async function claimCaptcha(
  nonce: string,
  expiresAt: Date,
): Promise<boolean> {
  await ensureTable()

  try {
    await execute(
      "INSERT INTO spent_captchas (nonce, expires_at) VALUES (?, ?)",
      [nonce, expiresAt],
    )
  } catch (error) {
    if ((error as { code?: string }).code === DUPLICATE_KEY) return false
    throw error
  }

  await execute("DELETE FROM spent_captchas WHERE expires_at < NOW()")
  return true
}
