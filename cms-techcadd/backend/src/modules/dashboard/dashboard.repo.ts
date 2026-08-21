import { query, queryOne, type Row } from '../../db/pool.js'
import * as coursesRepo from '../courses/courses.repo.js'
import * as enquiriesRepo from '../enquiries/enquiries.repo.js'

/** One scalar count. */
async function count(sql: string, params: unknown[] = []): Promise<number> {
  const row = await queryOne<{ n: number }>(sql, params)
  return Number(row?.n ?? 0)
}

export interface TrendPoint {
  /** ISO date, oldest first. */
  date: string
  value: number
}

/**
 * Enquiries per day for the last seven days, including days with none.
 *
 * Grouped in SQL rather than in the browser. The page previously fetched two
 * thousand enquiries to bucket them client-side, which grows without bound and
 * ships the entire table over the wire to render seven numbers.
 */
async function enquiryTrend(): Promise<TrendPoint[]> {
  const rows = await query<Row>(
    `SELECT DATE(created_at) AS day, COUNT(*) AS n
       FROM enquiries
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)`,
  )

  const counts = new Map<string, number>()
  for (const row of rows) counts.set(String(row.day), Number(row.n))

  // The query only returns days that have rows; the chart needs all seven.
  const today = new Date()
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - offset))
    const key = localDate(date)
    return { date: key, value: counts.get(key) ?? 0 }
  })
}

/**
 * A YYYY-MM-DD key in the server's own timezone.
 *
 * Not `toISOString()`, which is UTC. The counts above come from MySQL's
 * `DATE(created_at)` and the window from `CURDATE()`, both of which are the
 * server's local date — so a UTC key does not match them wherever the two
 * disagree. In IST (UTC+5:30) they disagree from 18:30 until midnight every
 * day: the last bar was labelled yesterday and every enquiry taken that
 * evening vanished from the chart, then reappeared the next morning.
 */
function localDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

interface Recent {
  id: string
  title: string
  kind: 'course' | 'blog' | 'page'
  updatedAt: string
}

/**
 * The most recently touched content across three tables.
 *
 * UNION ALL, so the database does the interleaving and returns six rows rather
 * than three separate pages the client has to merge and trim.
 */
async function recentActivity(): Promise<Recent[]> {
  const rows = await query<Row>(
    `(SELECT id, title, 'course' AS kind, updated_at FROM courses ORDER BY updated_at DESC LIMIT 6)
     UNION ALL
     (SELECT id, title, 'blog'   AS kind, updated_at FROM blogs   ORDER BY updated_at DESC LIMIT 6)
     UNION ALL
     (SELECT id, title, 'page'   AS kind, updated_at FROM pages   ORDER BY updated_at DESC LIMIT 6)
     ORDER BY updated_at DESC
     LIMIT 6`,
  )

  return rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    kind: row.kind as Recent['kind'],
    updatedAt: row.updated_at as string,
  }))
}

/** Counts by status across the four content tables that have one. */
async function contentOverview(): Promise<Record<string, number>> {
  const rows = await query<Row>(
    `SELECT status, SUM(n) AS n FROM (
       SELECT status, COUNT(*) AS n FROM courses  GROUP BY status
       UNION ALL SELECT status, COUNT(*) FROM blogs   GROUP BY status
       UNION ALL SELECT status, COUNT(*) FROM pages   GROUP BY status
       UNION ALL SELECT status, COUNT(*) FROM banners GROUP BY status
     ) AS combined
     GROUP BY status`,
  )

  const overview = { published: 0, draft: 0, review: 0, total: 0 }
  for (const row of rows) {
    const status = String(row.status) as keyof typeof overview
    if (status in overview) overview[status] = Number(row.n)
  }
  overview.total = overview.published + overview.draft + overview.review

  return overview
}

/**
 * Everything the dashboard needs, in one request.
 *
 * The page used to issue around twenty, most of them count-only list calls.
 * Bundling them costs one round trip and lets the counts be consistent with
 * each other rather than sampled at twenty different moments.
 */
export async function summary(): Promise<unknown> {
  const [
    courses, enquiries, blogs, publishedPages,
    newEnquiriesToday, pendingReview, liveCourses,
    trend, overview, activity, recentEnquiries, recentCourses,
  ] = await Promise.all([
    count('SELECT COUNT(*) AS n FROM courses'),
    count('SELECT COUNT(*) AS n FROM enquiries'),
    count('SELECT COUNT(*) AS n FROM blogs'),
    count("SELECT COUNT(*) AS n FROM pages WHERE status = 'published'"),

    count('SELECT COUNT(*) AS n FROM enquiries WHERE DATE(created_at) = CURDATE()'),
    count("SELECT COUNT(*) AS n FROM courses WHERE status = 'review'"),
    count("SELECT COUNT(*) AS n FROM courses WHERE status = 'published'"),

    enquiryTrend(),
    contentOverview(),
    recentActivity(),

    // Through the modules' own list functions rather than a bespoke query, so
    // these rows are byte-for-byte what /api/enquiries and /api/courses return
    // and the dashboard components need no separate shape.
    enquiriesRepo.list({
      page: 1, pageSize: 8, sort: { field: 'createdAt', dir: 'desc' }, filters: {},
    }),
    coursesRepo.list({
      page: 1, pageSize: 6, sort: { field: 'updatedAt', dir: 'desc' }, filters: {},
    }),
  ])

  return {
    totals: { courses, enquiries, blogs, publishedPages },
    today: { newEnquiries: newEnquiriesToday, pendingReview, liveCourses },
    enquiryTrend: trend,
    contentOverview: overview,
    recentActivity: activity,
    recentEnquiries: recentEnquiries.items,
    recentCourses: recentCourses.items,
  }
}
