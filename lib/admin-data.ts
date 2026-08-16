import { query } from "@/lib/db"
import { ensureTable, FORM_TYPES } from "@/lib/enquiries"
import type { RowDataPacket } from "mysql2/promise"

/**
 * Everything the /admin dashboard reads.
 *
 * Read-only by design: the dashboard never writes to `enquiries`, so nothing
 * here has an INSERT, UPDATE or DELETE and the database user the site runs as
 * does not need one for the dashboard to work.
 *
 * The SQL lives here rather than in the pages, for the same reason
 * lib/enquiries.ts holds the form's SQL — the pages stay a layout story and
 * every query against the table is in one place.
 *
 * Two conventions worth knowing:
 *
 *  - `COUNT`/`SUM` come back from mysql2 as strings once they exceed a plain
 *    integer or come from a DECIMAL, so every aggregate goes through `num()`.
 *  - Timestamps are formatted in SQL, not in JavaScript. The column is a
 *    DATETIME with no zone and the rows are written with the database's clock;
 *    turning that into a JS Date reinterprets it in the Node process's zone,
 *    which silently shifts every displayed time when the two differ.
 */

/** The label the dashboard shows for rows written before `form_type` existed. */
export const UNATTRIBUTED = "Unattributed"

/** Every value the filter dropdown may take, in the order it lists them. */
export const FORM_TYPE_OPTIONS = [...Object.values(FORM_TYPES), UNATTRIBUTED]

/** Aggregates arrive as strings or null; a missing count is zero, not NaN. */
function num(value: unknown): number {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

export type EnquiryFilters = {
  /** Free text, matched against name, phone, course, email and message. */
  q: string
  /** One of FORM_TYPE_OPTIONS, or "" for all. */
  formType: string
  /** ISO dates, inclusive at both ends. */
  from: string
  to: string
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Turns whatever is in the URL into filters that are safe to build SQL from.
 *
 * Anything unrecognised becomes "no filter" rather than an error: a hand-edited
 * query string should show the unfiltered table, not a stack trace.
 */
export function parseFilters(params: Record<string, string | string[] | undefined>): EnquiryFilters {
  const one = (key: string) => {
    const value = params[key]
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
  }

  const formType = one("type")
  const from = one("from")
  const to = one("to")

  return {
    q: one("q").slice(0, 80),
    // Compared against the fixed list, so this value can only ever be one of
    // ours by the time it reaches a query.
    formType: FORM_TYPE_OPTIONS.includes(formType) ? formType : "",
    from: ISO_DATE.test(from) ? from : "",
    to: ISO_DATE.test(to) ? to : "",
  }
}

/** True when anything is narrowing the view — drives the "Clear" affordance. */
export function hasFilters(filters: EnquiryFilters): boolean {
  return Boolean(filters.q || filters.formType || filters.from || filters.to)
}

/**
 * LIKE treats `%` and `_` as wildcards, so a search for "50%" would otherwise
 * match everything. Escaped with a backslash, which is MySQL's default.
 */
function likeTerm(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

type Clause = { sql: string; values: (string | number)[] }

function whereFor(filters: EnquiryFilters): Clause {
  const parts: string[] = []
  const values: (string | number)[] = []

  if (filters.q) {
    parts.push(
      "(name LIKE ? OR phone LIKE ? OR course LIKE ? OR email LIKE ? OR message LIKE ?)",
    )
    const term = likeTerm(filters.q)
    values.push(term, term, term, term, term)
  }

  if (filters.formType === UNATTRIBUTED) {
    parts.push("(form_type IS NULL OR form_type = '')")
  } else if (filters.formType) {
    parts.push("form_type = ?")
    values.push(filters.formType)
  }

  if (filters.from) {
    parts.push("created_at >= ?")
    values.push(`${filters.from} 00:00:00`)
  }

  if (filters.to) {
    // Inclusive of the whole end day, without depending on the seconds
    // resolution of the column.
    parts.push("created_at < DATE_ADD(?, INTERVAL 1 DAY)")
    values.push(filters.to)
  }

  return { sql: parts.length ? `WHERE ${parts.join(" AND ")}` : "", values }
}

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */

export type Summary = {
  total: number
  callRequests: number
  today: number
  last7: number
  /** The seven days before that, so "last 7 days" can carry a change. */
  prev7: number
  last30: number
  /** Newest row, preformatted; null when the table is empty. */
  latest: string | null
}

export async function getSummary(): Promise<Summary> {
  const [row] = await query<
    RowDataPacket & Record<string, unknown>
  >(`
    SELECT
      COUNT(*)                                                   AS total,
      SUM(form_type = ?)                                         AS callRequests,
      SUM(created_at >= CURDATE())                               AS today,
      SUM(created_at >= CURDATE() - INTERVAL 6 DAY)              AS last7,
      SUM(created_at >= CURDATE() - INTERVAL 13 DAY
          AND created_at < CURDATE() - INTERVAL 6 DAY)           AS prev7,
      SUM(created_at >= CURDATE() - INTERVAL 29 DAY)             AS last30,
      DATE_FORMAT(MAX(created_at), '%d %b %Y, %h:%i %p')         AS latest
    FROM enquiries
  `, [FORM_TYPES.popup])

  return {
    total: num(row?.total),
    callRequests: num(row?.callRequests),
    today: num(row?.today),
    last7: num(row?.last7),
    prev7: num(row?.prev7),
    last30: num(row?.last30),
    latest: (row?.latest as string | null) ?? null,
  }
}

/* ------------------------------------------------------------------ */
/* Charts                                                              */
/* ------------------------------------------------------------------ */

export type TrendPoint = { day: string; label: string; count: number }

/**
 * Daily counts for the last `days` days, including the days with none.
 *
 * The gaps are filled here rather than in SQL: MySQL has no generate_series,
 * and a chart that silently skips its empty days reads as a busier week than
 * it was.
 */
export async function getDailyTrend(days = 14): Promise<TrendPoint[]> {
  const span = Math.min(90, Math.max(7, Math.trunc(days)))

  const rows = await query<RowDataPacket & { day: string; n: number }>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS n
     FROM enquiries
     WHERE created_at >= CURDATE() - INTERVAL ? DAY
     GROUP BY day
     ORDER BY day`,
    [span - 1],
  )

  const counts = new Map(rows.map((row) => [row.day, num(row.n)]))

  // Built from the database's idea of today, not the browser's: the counts
  // above are bucketed by the database clock, so the axis has to be too.
  const [clock] = await query<RowDataPacket & { today: string }>(
    "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today",
  )
  const today = new Date(`${clock?.today ?? new Date().toISOString().slice(0, 10)}T00:00:00Z`)

  const points: TrendPoint[] = []
  for (let offset = span - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() - offset)
    const day = date.toISOString().slice(0, 10)
    points.push({
      day,
      label: `${date.getUTCDate()} ${date.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}`,
      count: counts.get(day) ?? 0,
    })
  }

  return points
}

export type Slice = { label: string; count: number }

/** Every form, including the ones with no rows, so the legend never moves. */
export async function getFormTypeSplit(filters: EnquiryFilters): Promise<Slice[]> {
  const where = whereFor(filters)

  const rows = await query<RowDataPacket & { label: string; n: number }>(
    `SELECT COALESCE(NULLIF(form_type, ''), ?) AS label, COUNT(*) AS n
     FROM enquiries
     ${where.sql}
     GROUP BY label`,
    [UNATTRIBUTED, ...where.values],
  )

  const counts = new Map(rows.map((row) => [row.label, num(row.n)]))

  return FORM_TYPE_OPTIONS.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }))
    // Unattributed is a historical artefact, not a form: it earns a row only
    // when there is something in it.
    .filter((slice) => slice.label !== UNATTRIBUTED || slice.count > 0)
}

export async function getTopCourses(
  filters: EnquiryFilters,
  limit = 8,
): Promise<Slice[]> {
  const where = whereFor(filters)
  // Bounded and truncated to an integer here, because LIMIT cannot take a
  // placeholder in a prepared statement.
  const take = Math.min(20, Math.max(1, Math.trunc(limit)))

  const rows = await query<RowDataPacket & { label: string; n: number }>(
    `SELECT course AS label, COUNT(*) AS n
     FROM enquiries
     ${where.sql}
     GROUP BY course
     ORDER BY n DESC, course ASC
     LIMIT ${take}`,
    where.values,
  )

  return rows.map((row) => ({ label: row.label, count: num(row.n) }))
}

/* ------------------------------------------------------------------ */
/* The table                                                           */
/* ------------------------------------------------------------------ */

export type EnquiryRow = {
  id: number
  formType: string
  name: string
  phone: string
  course: string
  message: string | null
  email: string | null
  address: string | null
  source: string | null
  createdAt: string
  createdAtIso: string
}

const COLUMNS = `
  id,
  COALESCE(NULLIF(form_type, ''), '${UNATTRIBUTED}')       AS formType,
  name, phone, course, message, email, address, source,
  DATE_FORMAT(created_at, '%d %b %Y, %h:%i %p')            AS createdAt,
  DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s')             AS createdAtIso
`

export type Page = {
  rows: EnquiryRow[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export async function listEnquiries(
  filters: EnquiryFilters,
  page = 1,
  pageSize = 25,
): Promise<Page> {
  const where = whereFor(filters)

  const [count] = await query<RowDataPacket & { n: number }>(
    `SELECT COUNT(*) AS n FROM enquiries ${where.sql}`,
    where.values,
  )
  const total = num(count?.n)

  const size = Math.min(100, Math.max(10, Math.trunc(pageSize)))
  const pageCount = Math.max(1, Math.ceil(total / size))
  // Clamped rather than trusted: `?page=99999` should land on the last page,
  // and a negative offset is a SQL error.
  const current = Math.min(pageCount, Math.max(1, Math.trunc(page) || 1))
  const offset = (current - 1) * size

  const rows = await query<RowDataPacket & EnquiryRow>(
    `SELECT ${COLUMNS}
     FROM enquiries
     ${where.sql}
     ORDER BY created_at DESC, id DESC
     LIMIT ${size} OFFSET ${offset}`,
    where.values,
  )

  return { rows, total, page: current, pageSize: size, pageCount }
}

/** Every matching row, for the CSV export. Capped so one click cannot OOM. */
export async function listForExport(
  filters: EnquiryFilters,
  limit = 5000,
): Promise<EnquiryRow[]> {
  const where = whereFor(filters)
  const take = Math.min(20_000, Math.max(1, Math.trunc(limit)))

  return query<RowDataPacket & EnquiryRow>(
    `SELECT ${COLUMNS}
     FROM enquiries
     ${where.sql}
     ORDER BY created_at DESC, id DESC
     LIMIT ${take}`,
    where.values,
  )
}

/**
 * Creates the table if it is missing, so a fresh database shows an empty
 * dashboard rather than an error. A no-op after the first call in the process.
 */
export { ensureTable }
