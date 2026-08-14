import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'

import { asyncHandler, notFound } from '../../http/errors.js'
import { query, queryOne, type Row } from '../../db/pool.js'
import * as blogsRepo from '../blogs/blogs.repo.js'
import * as coursesRepo from '../courses/courses.repo.js'
import * as enquiriesRepo from '../enquiries/enquiries.repo.js'
import * as galleryRepo from '../gallery/gallery.repo.js'
import * as pagesRepo from '../pages/pages.repo.js'
import * as testimonialsRepo from '../testimonials/testimonials.repo.js'

/**
 * What the public website may read and write.
 *
 * Deliberately a separate router with no `requireAuth`: every other module is
 * behind a session, and mounting public access on those would be one forgotten
 * middleware away from exposing drafts and enquiry records.
 *
 * Two rules hold everywhere below:
 *   - `status: 'published'` is forced, never taken from the query string, so a
 *     crafted request cannot read a draft.
 *   - Nothing here accepts an id from the caller for anything but a lookup.
 */
export const publicRouter = Router()

/** Only what a marketing page renders — no internal notes or audit fields. */
const PUBLISHED = { status: 'published' } as const
const MAX_PAGE_SIZE = 100

function listParams(limit: number) {
  return {
    page: 1,
    pageSize: Math.min(limit, MAX_PAGE_SIZE),
    filters: { ...PUBLISHED },
    sort: undefined,
    search: undefined,
  }
}

const limitFrom = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, MAX_PAGE_SIZE) : fallback
}

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

publicRouter.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const result = await coursesRepo.list(listParams(limitFrom(req.query.limit, 50)))
    res.json({ items: result.items, total: result.total })
  }),
)

publicRouter.get(
  '/courses/:slug',
  asyncHandler(async (req, res) => {
    const row = await queryOne<Row>(
      "SELECT id FROM courses WHERE slug = ? AND status = 'published' LIMIT 1",
      [req.params.slug],
    )
    if (!row) throw notFound('Course')
    res.json(await coursesRepo.get(row.id as string))
  }),
)

publicRouter.get(
  '/blogs',
  asyncHandler(async (req, res) => {
    const result = await blogsRepo.list(listParams(limitFrom(req.query.limit, 50)))
    res.json({ items: result.items, total: result.total })
  }),
)

publicRouter.get(
  '/blogs/:slug',
  asyncHandler(async (req, res) => {
    const row = await queryOne<Row>(
      "SELECT id FROM blogs WHERE slug = ? AND status = 'published' LIMIT 1",
      [req.params.slug],
    )
    if (!row) throw notFound('Post')
    res.json(await blogsRepo.get(row.id as string))
  }),
)

publicRouter.get(
  '/testimonials',
  asyncHandler(async (req, res) => {
    const result = await testimonialsRepo.list(listParams(limitFrom(req.query.limit, 50)))
    res.json({ items: result.items, total: result.total })
  }),
)

publicRouter.get(
  '/gallery',
  asyncHandler(async (req, res) => {
    const result = await galleryRepo.list(listParams(limitFrom(req.query.limit, 50)))
    res.json({ items: result.items, total: result.total })
  }),
)

publicRouter.get(
  '/pages/:slug',
  asyncHandler(async (req, res) => {
    const row = await queryOne<Row>(
      "SELECT id FROM pages WHERE slug = ? AND status = 'published' LIMIT 1",
      [req.params.slug],
    )
    if (!row) throw notFound('Page')
    res.json(await pagesRepo.get(row.id as string))
  }),
)

/** Enabled redirects, so the site can apply them in middleware. */
publicRouter.get(
  '/redirects',
  asyncHandler(async (_req, res) => {
    const rows = await query<Row>(
      'SELECT from_path, to_path, type FROM redirects WHERE enabled = 1',
    )
    res.json({
      items: rows.map((row) => ({
        from: row.from_path,
        to: row.to_path,
        type: Number(row.type),
      })),
    })
  }),
)

/* ------------------------------------------------------------------ */
/* Enquiries                                                            */
/* ------------------------------------------------------------------ */

/**
 * Anyone on the internet can reach this, so it carries its own limit.
 *
 * The website in front of it already rate-limits and verifies a captcha, but
 * this endpoint must stand on its own — it is reachable directly.
 */
const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many enquiries from this address. Try again shortly.' },
})

/**
 * What a public form may set.
 *
 * A narrow schema on purpose: `status`, `assigneeId` and `notes` belong to the
 * staff workflow, and letting a form set them would let anyone file an enquiry
 * as already-converted or assign work to a colleague.
 */
const publicEnquirySchema = z.object({
  studentName: z.string().min(1, 'Name is required.').max(120),
  phone: z.string().min(6, 'A contact number is required.').max(30),
  email: z.union([z.email('Enter a valid email address.'), z.literal('')]).optional(),
  courseName: z.string().max(200).default(''),
  branchName: z.string().max(120).default(''),
  message: z.string().max(2000).optional(),
  source: z.enum(['website', 'walk-in', 'phone', 'referral', 'social']).default('website'),
  // Recorded by the site: which form, which page, and who submitted it.
  formType: z.string().max(32).optional(),
  sourceUrl: z.string().max(500).optional(),
  ip: z.string().max(45).optional(),
  userAgent: z.string().max(255).optional(),
})

const MAX_PER_PHONE_PER_DAY = 3
const MAX_PER_IP_PER_HOUR = 8

/**
 * Refuses a repeat submission.
 *
 * This check used to live on the website, against its own table. It has to run
 * wherever the enquiries actually are — otherwise the same number could be
 * submitted all day and every one would be recorded.
 */
async function isDuplicate(phone: string, ip?: string): Promise<boolean> {
  const byPhone = await queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM enquiries
      WHERE phone = ? AND created_at > NOW() - INTERVAL 1 DAY`,
    [phone],
  )
  if (Number(byPhone?.n ?? 0) >= MAX_PER_PHONE_PER_DAY) return true

  if (!ip) return false

  const byIp = await queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM enquiries
      WHERE ip = ? AND created_at > NOW() - INTERVAL 1 HOUR`,
    [ip],
  )
  return Number(byIp?.n ?? 0) >= MAX_PER_IP_PER_HOUR
}

publicRouter.post(
  '/enquiries',
  enquiryLimiter,
  asyncHandler(async (req, res) => {
    const input = publicEnquirySchema.parse(req.body)

    if (await isDuplicate(input.phone, input.ip)) {
      // 429 rather than an error: the enquiry did reach us, we are simply not
      // recording it again. The site shows a reassuring message.
      res.status(429).json({
        message: 'We already have your enquiry. A counsellor will call you shortly.',
      })
      return
    }

    await enquiriesRepo.create({
      ...input,
      // Every public submission starts at the beginning of the pipeline.
      status: 'new',
      notes: [],
      courseId: undefined,
      branchId: undefined,
      assigneeId: undefined,
      followUpDate: undefined,
    })

    // Deliberately not the created record: an enquiry is not the submitter's to
    // read back, and the id is of no use to them.
    res.status(201).json({ ok: true })
  }),
)
