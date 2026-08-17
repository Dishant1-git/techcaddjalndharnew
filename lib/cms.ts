/**
 * The CMS API, as seen from the website.
 *
 * Server-side only. Every call goes through `cmsFetch`, which is where the
 * timeout and the caching policy live: a marketing page must not hang because
 * the CMS is slow, and must not hit it on every request either.
 */
const BASE = (process.env.CMS_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "")

/**
 * How long a content response may be reused before it is fetched again.
 *
 * Zero in development: the whole point of running the CMS locally is to see an
 * edit immediately, and waiting out a cache window reads as the site being
 * broken. In production the cache is what keeps a marketing page off the
 * database on every request — and `/api/revalidate` clears it the moment
 * something is published, so the window is a backstop rather than the
 * mechanism.
 */
const CONTENT_TTL_SECONDS =
  process.env.CMS_CACHE_SECONDS !== undefined
    ? Number(process.env.CMS_CACHE_SECONDS)
    : process.env.NODE_ENV === "production"
      ? 300
      : 0

/** Lets `/api/revalidate` drop every cached CMS response in one call. */
export const CMS_CACHE_TAG = "cms"

/** A slow CMS should degrade the page, not hold the request open. */
const TIMEOUT_MS = Number(process.env.CMS_TIMEOUT_MS ?? 4000)

export class CmsUnavailableError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = "CmsUnavailableError"
  }
}

interface FetchOptions {
  /** Seconds; 0 disables caching for this call. */
  revalidate?: number
  method?: "GET" | "POST"
  body?: unknown
}

async function cmsFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate = CONTENT_TTL_SECONDS, method = "GET", body } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE}${path}`, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      // A POST is never cached; a GET is revalidated on Next's schedule and
      // tagged so a publish can drop the lot without waiting for it.
      ...(method === "POST" || revalidate === 0
        ? { cache: "no-store" as const }
        : { next: { revalidate, tags: [CMS_CACHE_TAG] } }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      throw new CmsUnavailableError(
        `CMS responded ${response.status} for ${path}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      )
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof CmsUnavailableError) throw error
    throw new CmsUnavailableError(`CMS request to ${path} failed`, error)
  } finally {
    clearTimeout(timer)
  }
}

/* ------------------------------------------------------------------ */
/* Shapes returned by the CMS                                           */
/* ------------------------------------------------------------------ */

export interface CmsMedia {
  id: string
  url: string
  alt: string
  width?: number
  height?: number
}

export interface CmsBlog {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  tags: string[]
  coverImage?: CmsMedia
  publishDate?: string
  updatedAt: string
}

export interface CmsTestimonial {
  id: string
  studentName: string
  quote: string
  rating: number
  batch?: string
  photo?: CmsMedia
  featured: boolean
}

export interface CmsGalleryAlbum {
  id: string
  title: string
  slug: string
  eventDate?: string
  cover?: CmsMedia
  images: { id: string; media: CmsMedia; caption?: string }[]
}

export interface CmsCourse {
  id: string
  title: string
  slug: string
  /** With the slug, the key the site looks a course page up by. */
  segment: 'courses' | 'internship-training' | 'after-12th-courses'
  tagline?: string
  demand?: string
  careers: string[]
  tools: string[]
  salary?: string
  shortDescription: string
  description: string
  duration: string
  fee: number
  discountedFee?: number
  level: string
  mode: string
  thumbnail?: CmsMedia
  highlights: string[]
  /**
   * The category chosen in the CMS.
   *
   * The name, not just the id: it is what the site groups a course under, and
   * resolving an id to a label would mean a second request for a string the
   * server already had.
   */
  categoryName?: string
  categorySlug?: string
  updatedAt: string
}

/** A promotional banner that is live right now — the CMS applies the schedule. */
export interface CmsBanner {
  id: string
  title: string
  altText: string
  linkUrl?: string
  ctaText?: string
  placement: 'home-hero' | 'course-page' | 'sidebar' | 'popup'
  order: number
  desktopImage?: { url: string; width?: number; height?: number }
  mobileImage?: { url: string; width?: number; height?: number }
}

export interface CmsFaq {
  id: string
  question: string
  answer: string
  category: string
  order: number
  featured: boolean
}

export interface CmsReview {
  id: string
  authorName: string
  rating: number
  quote: string
  reviewedOn?: string
  courseName?: string
  source: 'google' | 'website' | 'walk-in'
  order: number
}

export interface CmsCategory {
  id: string
  name: string
  slug: string
  description?: string
  /** Key into the site's icon set; unknown values fall back to a generic mark. */
  icon?: string
  accentColor?: string
  order: number
}

/** A standalone page written in the CMS — policies, notices, landing copy. */
export interface CmsPage {
  id: string
  title: string
  slug: string
  template: string
  content: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    canonicalUrl?: string
  }
}

export interface CmsRedirect {
  from: string
  to: string
  /** 301 or 302. */
  type: number
}

/** Site-wide facts, from the settings row. */
export interface CmsSite {
  siteName: string
  tagline?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  stats: { value: string; label: string }[]
  social: Record<string, string | undefined>
}

interface ListResponse<T> {
  items: T[]
  total: number
}

/* ------------------------------------------------------------------ */
/* Reads                                                                */
/* ------------------------------------------------------------------ */

export const getBlogs = (limit = 50) =>
  cmsFetch<ListResponse<CmsBlog>>(`/public/blogs?limit=${limit}`)

export const getBlog = (slug: string) =>
  cmsFetch<CmsBlog>(`/public/blogs/${encodeURIComponent(slug)}`)

export const getTestimonials = (limit = 50) =>
  cmsFetch<ListResponse<CmsTestimonial>>(`/public/testimonials?limit=${limit}`)

export const getGalleryAlbums = (limit = 50) =>
  cmsFetch<ListResponse<CmsGalleryAlbum>>(`/public/gallery?limit=${limit}`)

export const getFaqs = (limit = 100) =>
  cmsFetch<ListResponse<CmsFaq>>(`/public/faqs?limit=${limit}`)

export const getReviews = (limit = 50) =>
  cmsFetch<ListResponse<CmsReview>>(`/public/reviews?limit=${limit}`)

export const getCourses = (limit = 50) =>
  cmsFetch<ListResponse<CmsCourse>>(`/public/courses?limit=${limit}`)

export const getPage = (slug: string) =>
  cmsFetch<CmsPage>(`/public/pages/${encodeURIComponent(slug)}`)

export const getRedirects = () =>
  cmsFetch<ListResponse<CmsRedirect>>("/public/redirects", { revalidate: 300 })

export const getCategories = (limit = 50) =>
  cmsFetch<ListResponse<CmsCategory>>(`/public/categories?limit=${limit}`)

export const getSite = () => cmsFetch<CmsSite>("/public/site")

export const getBanners = (placement: CmsBanner["placement"]) =>
  cmsFetch<ListResponse<CmsBanner>>(`/public/banners?placement=${placement}`)

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

export interface CmsEnquiry {
  studentName: string
  phone: string
  email?: string
  courseName?: string
  message?: string
  formType?: string
  sourceUrl?: string
  ip?: string
  userAgent?: string
}

export type EnquiryResult =
  | { ok: true }
  /** The CMS already has this submission; the visitor should be reassured, not shown an error. */
  | { ok: false; duplicate: true; message: string }

/**
 * Files an enquiry with the CMS.
 *
 * Throws `CmsUnavailableError` when the CMS cannot be reached, so the caller
 * can fall back rather than lose the lead.
 */
export async function submitEnquiry(enquiry: CmsEnquiry): Promise<EnquiryResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE}/public/enquiries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(enquiry),
      cache: "no-store",
      signal: controller.signal,
    })

    if (response.status === 429) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string }
      return {
        ok: false,
        duplicate: true,
        message:
          payload.message ?? "We already have your enquiry. A counsellor will call you shortly.",
      }
    }

    if (!response.ok) {
      throw new CmsUnavailableError(`CMS responded ${response.status} to an enquiry`)
    }

    return { ok: true }
  } catch (error) {
    if (error instanceof CmsUnavailableError) throw error
    throw new CmsUnavailableError("CMS could not be reached to file the enquiry", error)
  } finally {
    clearTimeout(timer)
  }
}

/** The CMS origin, for turning its relative media paths into absolute URLs. */
export const CMS_ORIGIN = BASE.replace(/\/api$/, "")

/** Uploads are stored as `/uploads/<name>`; the site is on another origin. */
export function cmsImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (/^(https?:|data:)/i.test(url)) return url
  return `${CMS_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`
}
