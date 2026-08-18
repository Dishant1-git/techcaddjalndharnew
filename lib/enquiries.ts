import { execute, query } from "@/lib/db"
import type { RowDataPacket } from "mysql2/promise"

/**
 * Everything the enquiry form touches in the database.
 *
 * The SQL lives here rather than in the route handler, so the route stays a
 * validate-then-store story and the schema has one home.
 */

/**
 * Which form produced a row, keyed by what the client posts as `form`.
 * The values are stored verbatim, so they read as-is in the table.
 */
export const FORM_TYPES = {
  popup: "Call Request",
  course: "Course Enquiry",
  contact: "Contact Form",
  brochure: "Brochure Download",
  /* The phone field in the closing CTA band. It opens the same popup the
     header button does, so without its own label every row it produces would
     be filed as a Call Request — and the two convert differently enough that
     telling them apart is the point of recording the form at all. */
  demo: "Book Demo",
} as const

const FORM_LABELS = new Map<string, string>(Object.entries(FORM_TYPES))

/**
 * Resolves a posted form key to its stored label. Anything unknown — including
 * an older client that posts nothing at all — is the popup, which is the form
 * that shipped first.
 */
export function formTypeFor(key: unknown): string {
  return FORM_LABELS.get(String(key ?? "")) ?? FORM_TYPES.popup
}

export type Enquiry = {
  /** Label from FORM_TYPES, e.g. "Course Enquiry". */
  formType: string
  name: string
  phone: string
  course: string
  /** Free text from the course-page form; the popup does not collect it. */
  message?: string | null
  /** Only the brochure form collects these; every other row stores NULL. */
  email?: string | null
  address?: string | null
  /** Where on the site the form was opened — useful for attribution later. */
  source?: string | null
  ip?: string | null
  userAgent?: string | null
}

/** How much one visitor may send before we stop recording them. */
const MAX_PER_IP_PER_HOUR = 5
const MAX_PER_PHONE_PER_DAY = 3

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS enquiries (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    form_type   VARCHAR(32)  NULL,
    name        VARCHAR(80)  NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    course      VARCHAR(120) NOT NULL,
    message     TEXT         NULL,
    email       VARCHAR(190) NULL,
    address     VARCHAR(300) NULL,
    source      VARCHAR(255) NULL,
    ip          VARCHAR(45)  NULL,
    user_agent  VARCHAR(255) NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_created_at (created_at),
    KEY idx_phone_created (phone, created_at),
    KEY idx_ip_created (ip, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`

/**
 * Runs at most once per server process. CREATE TABLE IF NOT EXISTS is a no-op
 * after the first deploy, so the cost is a single round trip on cold start.
 * Set DB_AUTO_MIGRATE=false and apply db/schema.sql by hand if the database
 * user is not allowed to create tables.
 */
let ensured: Promise<void> | null = null

async function migrate() {
  await execute(CREATE_TABLE)
  // CREATE TABLE skips a table that already exists, so anything added after
  // the first deploy needs its own pass. MySQL has no CREATE INDEX IF NOT
  // EXISTS or ADD COLUMN IF NOT EXISTS, hence the lookups.
  await ensureColumn("message", "TEXT NULL AFTER course")
  // Nullable rather than defaulted: rows written before this column existed
  // came from either form and there is no honest way to tell them apart, so
  // they stay blank instead of all claiming to be call requests.
  await ensureColumn("form_type", "VARCHAR(32) NULL AFTER id")
  // Only the brochure form collects these; every earlier row and every other
  // form's row leaves them NULL.
  await ensureColumn("email", "VARCHAR(190) NULL AFTER message")
  await ensureColumn("address", "VARCHAR(300) NULL AFTER email")
  // When this row reached the CMS. NULL means it has not, which is what makes
  // the backlog drainable rather than leaving it stranded here.
  await ensureColumn("forwarded_at", "DATETIME NULL")
  await ensureIndex("idx_forwarded", "forwarded_at")
  await ensureIndex("idx_phone_created", "phone, created_at")
  await ensureIndex("idx_ip_created", "ip, created_at")
}

async function ensureColumn(name: string, definition: string) {
  const rows = await query<RowDataPacket>(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE table_schema = DATABASE() AND table_name = 'enquiries'
       AND column_name = ?
     LIMIT 1`,
    [name],
  )
  // Name and definition are ours, never a caller's — DDL cannot take ?.
  if (!rows.length) await execute(`ALTER TABLE enquiries ADD COLUMN ${name} ${definition}`)
}

async function ensureIndex(name: string, columns: string) {
  const rows = await query<RowDataPacket>(
    `SELECT 1 FROM information_schema.STATISTICS
     WHERE table_schema = DATABASE() AND table_name = 'enquiries'
       AND index_name = ?
     LIMIT 1`,
    [name],
  )
  // The name and columns are ours, never a caller's — safe to interpolate,
  // which is necessary because DDL cannot take ? placeholders.
  if (!rows.length) await execute(`CREATE INDEX ${name} ON enquiries (${columns})`)
}

function ensureTable() {
  if (process.env.DB_AUTO_MIGRATE === "false") return Promise.resolve()
  // The failure is cleared, not cached: keeping a rejected promise here would
  // turn one dropped connection into a form that stays broken until the next
  // deploy — a self-inflicted outage a single bad moment could trigger.
  ensured ??= migrate().catch((error) => {
    ensured = null
    throw error
  })
  return ensured
}

/**
 * Caps how fast one source can fill the table. The phone limit is the one
 * that really bites: an attacker can put anything in X-Forwarded-For, so the
 * IP limit only slows down the lazy, while every stored row must carry a
 * real-looking number that a counsellor would otherwise waste a call on.
 */
export async function isRateLimited(
  ip: string | null,
  phone: string,
): Promise<boolean> {
  const [byPhone] = await query<RowDataPacket & { n: number }>(
    `SELECT COUNT(*) AS n FROM enquiries
     WHERE phone = ? AND created_at > NOW() - INTERVAL 1 DAY`,
    [phone],
  )
  if (byPhone.n >= MAX_PER_PHONE_PER_DAY) return true

  if (!ip) return false

  const [byIp] = await query<RowDataPacket & { n: number }>(
    `SELECT COUNT(*) AS n FROM enquiries
     WHERE ip = ? AND created_at > NOW() - INTERVAL 1 HOUR`,
    [ip],
  )
  return byIp.n >= MAX_PER_IP_PER_HOUR
}

/** Stores one enquiry and returns its new row id. */
export async function saveEnquiry(enquiry: Enquiry): Promise<number> {
  await ensureTable()

  const result = await execute(
    `INSERT INTO enquiries
       (form_type, name, phone, course, message, email, address, source, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      enquiry.formType,
      enquiry.name,
      enquiry.phone,
      enquiry.course,
      enquiry.message ?? null,
      enquiry.email ?? null,
      enquiry.address ?? null,
      enquiry.source ?? null,
      enquiry.ip ?? null,
      // The column is capped, and a hostile client controls this header.
      enquiry.userAgent?.slice(0, 255) ?? null,
    ],
  )

  return result.insertId
}

/** Exposed so the route can run its limit checks against a ready table. */
export { ensureTable }

/**
 * Moves locally-held enquiries into the CMS.
 *
 * The local table is an outage net, not a second inbox. A row written while the
 * CMS was unreachable is invisible to the staff who work the CMS queue, and
 * "check both places" is not a process anyone follows — so the backlog is
 * drained on the next successful submission rather than left for someone to
 * notice.
 *
 * Rows are marked forwarded only once the CMS has taken them, so a failure
 * halfway through simply leaves the rest for next time. A duplicate reaching
 * the CMS is refused by its own rules and still counts as delivered.
 */
export async function forwardPendingEnquiries(limit = 25): Promise<number> {
  await ensureTable()

  const rows = await query<RowDataPacket>(
    `SELECT id, form_type, name, phone, course, message, email, source, ip, user_agent
       FROM enquiries
      WHERE forwarded_at IS NULL
      ORDER BY created_at ASC
      LIMIT ?`,
    [limit],
  )
  if (rows.length === 0) return 0

  // Imported here rather than at the top: lib/cms pulls in fetch plumbing that
  // this module has no other use for, and the common path never runs this.
  const { submitEnquiry } = await import("./cms")

  let moved = 0
  for (const row of rows) {
    try {
      const result = await submitEnquiry({
        studentName: String(row.name),
        phone: String(row.phone),
        email: row.email ? String(row.email) : undefined,
        courseName: String(row.course),
        message: row.message ? String(row.message) : undefined,
        formType: row.form_type ? String(row.form_type) : undefined,
        sourceUrl: row.source ? String(row.source) : undefined,
        ip: row.ip ? String(row.ip) : undefined,
        userAgent: row.user_agent ? String(row.user_agent) : undefined,
      })

      // A refusal for being a duplicate means the CMS already has it, which is
      // the outcome this is for. Anything else leaves the row for next time.
      if (!result.ok && !result.duplicate) continue

      await execute("UPDATE enquiries SET forwarded_at = NOW() WHERE id = ?", [row.id])
      moved += 1
    } catch {
      // The CMS is still down. Stop rather than hammer it — the next
      // submission will try again.
      break
    }
  }

  if (moved > 0) console.info(`[enquiry] forwarded ${moved} held enquiry(s) to the CMS`)
  return moved
}
