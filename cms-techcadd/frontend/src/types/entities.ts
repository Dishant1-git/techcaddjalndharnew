import type { ContentStatus, EnquiryStatus } from './index'

/* ------------------------------------------------------------------ */
/* Shared                                                               */
/* ------------------------------------------------------------------ */

export interface BaseEntity {
  id: string
  /** ISO timestamp. */
  createdAt: string
  updatedAt: string
}

/**
 * A reference to an item in the media library.
 *
 * Image slots are typed `MediaRef | null` rather than just optional: absent
 * means "leave it alone" on a patch, and null means "remove it". `undefined`
 * cannot say the second, because JSON.stringify drops the key entirely.
 */
export interface MediaRef {
  id: string
  url: string
  alt: string
  width?: number
  height?: number
}

/** Embedded in every module that surfaces on the public site. */
export interface SeoFields {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  ogImage?: MediaRef | null
  canonicalUrl?: string
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseMode = 'online' | 'offline' | 'hybrid'
export type EnquirySource = 'website' | 'walk-in' | 'phone' | 'referral' | 'social'
export type BannerPlacement = 'home-hero' | 'course-page' | 'sidebar' | 'popup'
/** The CMS has a single role: an admin can do everything. */
export type UserRole = 'admin' | 'editor'

/* ------------------------------------------------------------------ */
/* Courses                                                              */
/* ------------------------------------------------------------------ */

export interface SyllabusModule {
  id: string
  title: string
  topics: string[]
  hours?: number
}

export type CourseSegment = 'courses' | 'internship-training' | 'after-12th-courses'

export interface Course extends BaseEntity {
  title: string
  slug: string
  /** Which part of the site the course belongs to; with the slug, its page key. */
  segment: CourseSegment
  categoryId?: string
  shortDescription: string
  /** The copy the public course page is generated from — see migration 013. */
  tagline?: string
  demand?: string
  careers: string[]
  tools: string[]
  salary?: string
  description: string
  duration: string
  /**
   * Absent when nobody has decided.
   *
   * The course page's facts strip keeps the segment's generic wording until one
   * is set, rather than printing a level no one graded.
   */
  level?: CourseLevel | ''
  mode?: CourseMode | ''
  thumbnail?: MediaRef | null
  syllabus: SyllabusModule[]
  highlights: string[]
  eligibility?: string
  certification?: string
  featured: boolean
  seo: SeoFields
  status: ContentStatus
}

/* ------------------------------------------------------------------ */
/* Categories                                                           */
/* ------------------------------------------------------------------ */

export interface Category extends BaseEntity {
  name: string
  slug: string
  /** Null at the root. Nesting is capped at two levels. */
  parentId?: string
  icon?: string
  accentColor?: string
  description?: string
  order: number
  status: ContentStatus
}

/* ------------------------------------------------------------------ */
/* Pages                                                                */
/* ------------------------------------------------------------------ */

/** One block of content on a page. See features/shared/contentBlockSchema.ts. */
export interface PageSection {
  id?: string
  type: 'rich-text' | 'image' | 'video' | 'cta' | 'blogs'
  title?: string
  body?: string
  media?: MediaRef | null
  linkUrl?: string
  linkLabel?: string
  linkTarget: 'same' | 'new'
  visible: boolean
}

export interface Page extends BaseEntity {
  title: string
  slug: string
  template: string
  /** The legacy single-field body. Rendered when the page has no blocks. */
  content: string
  /** Blocks the editor arranged, in order. */
  sections: PageSection[]
  publishDate?: string
  seo: SeoFields
  status: ContentStatus
  /** System pages (home, contact) cannot be deleted. */
  system: boolean
}

/* ------------------------------------------------------------------ */
/* Banners                                                              */
/* ------------------------------------------------------------------ */

export interface Banner extends BaseEntity {
  title: string
  desktopImage?: MediaRef | null
  mobileImage?: MediaRef | null
  altText: string
  linkUrl?: string
  ctaText?: string
  placement: BannerPlacement
  order: number
  startsAt?: string
  endsAt?: string
  status: ContentStatus
}

/* ------------------------------------------------------------------ */
/* Blogs                                                                */
/* ------------------------------------------------------------------ */

export interface Blog extends BaseEntity {
  title: string
  slug: string
  authorId?: string
  categoryId?: string
  tags: string[]
  coverImage?: MediaRef | null
  excerpt: string
  body: string
  publishDate?: string
  seo: SeoFields
  status: ContentStatus
}

/* ------------------------------------------------------------------ */
/* Faculty                                                              */
/* ------------------------------------------------------------------ */

/**
 * Site-wide profile addresses.
 *
 * Matches the server, which has accepted all of these since the settings
 * module was written — this list had only four of them, so three networks
 * could be stored and never edited.
 */
export interface SocialLinks {
  instagram?: string
  linkedin?: string
  facebook?: string
  youtube?: string
  x?: string
  github?: string
  website?: string
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                         */
/* ------------------------------------------------------------------ */

export interface Testimonial extends BaseEntity {
  studentName: string
  photo?: MediaRef | null
  courseId?: string
  batch?: string
  rating: number
  quote: string
  videoUrl?: string
  featured: boolean
  status: ContentStatus
}

/* ------------------------------------------------------------------ */
/* Gallery                                                              */
/* ------------------------------------------------------------------ */

export interface GalleryImage {
  id: string
  media: MediaRef
  caption?: string
  /** Where the photograph goes when clicked. Absent means it is not a link. */
  linkUrl?: string
  order: number
}

export interface GalleryAlbum extends BaseEntity {
  title: string
  slug: string
  cover?: MediaRef | null
  eventDate?: string
  description?: string
  images: GalleryImage[]
  status: ContentStatus
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                            */
/* ------------------------------------------------------------------ */

export interface EnquiryNote {
  id: string
  author: string
  body: string
  createdAt: string
}

export interface EnquiryRecord extends BaseEntity {
  studentName: string
  phone: string
  email?: string
  courseId?: string
  courseName: string
  branchId?: string
  source: EnquirySource
  message?: string
  status: EnquiryStatus
  assigneeId?: string
  followUpDate?: string
  notes: EnquiryNote[]
}

/* ------------------------------------------------------------------ */
/* Media                                                                */
/* ------------------------------------------------------------------ */

export interface MediaItem extends BaseEntity {
  filename: string
  url: string
  mimeType: string
  /** Bytes. */
  size: number
  width?: number
  height?: number
  alt: string
  folder?: string
  /**
   * How many records currently show this file.
   *
   * Counted from the foreign keys that point at media, so it covers course
   * thumbnails, page and course blocks, banners, blog covers, the site logo
   * and the rest. Deleting a file in use does not break the page — the
   * reference is set to null — the picture simply stops appearing, which is
   * harder to notice than a broken image and worth warning about.
   */
  usageCount?: number
}

/* ------------------------------------------------------------------ */
/* SEO                                                                  */
/* ------------------------------------------------------------------ */

export interface Redirect extends BaseEntity {
  from: string
  to: string
  type: 301 | 302
  enabled: boolean
}

/* ------------------------------------------------------------------ */
/* Users                                                                */
/* ------------------------------------------------------------------ */

export interface User extends BaseEntity {
  name: string
  email: string
  role: UserRole
  avatar?: MediaRef | null
  active: boolean
  /**
   * Mock-only credential digest. Real authentication hashes and verifies on
   * the server — never trust a password check that runs in the browser.
   */
  passwordHash?: string
}

/* ------------------------------------------------------------------ */
/* Site settings — a singleton, not a collection                        */
/* ------------------------------------------------------------------ */

export interface NotificationPreferences {
  newEnquiryEmail: boolean
  dailyEnquiryDigest: boolean
  contentPublished: boolean
}

export interface Integrations {
  whatsappNumber?: string
  analyticsId?: string
  /** Masked in the UI; revealed on demand. */
  recaptchaSecret?: string
}

/**
 * One headline figure, e.g. "15k+" / "Students Trained".
 *
 * The value is a string because the site prints "15k+" and "98%" — the suffix
 * carries as much meaning as the digits, and a number field would lose it.
 */
export interface SiteStat {
  value: string
  label: string
}

export interface SiteSettings {
  siteName: string
  tagline?: string
  logo?: MediaRef | null
  favicon?: MediaRef | null
  contactEmail?: string
  contactPhone?: string
  address?: string
  /** The headline figures the homepage and about page print. */
  stats: SiteStat[]
  social: SocialLinks
  /** Edited from the SEO module. */
  robotsTxt: string
  notifications: NotificationPreferences
  integrations: Integrations
  /** Stands in for the signed-in user until auth lands. */
  profile: { name: string; email: string }
}

/* ------------------------------------------------------------------ */
/* FAQs                                                                 */
/* ------------------------------------------------------------------ */

export interface Faq extends BaseEntity {
  question: string
  answer: string
  /** Free text: the site groups by whatever categories exist. */
  category: string
  order: number
  /** The homepage shows a short selection rather than every question. */
  featured: boolean
  status: ContentStatus
}

/* ------------------------------------------------------------------ */
/* Reviews                                                              */
/* ------------------------------------------------------------------ */

/** Only reviews genuinely left on Google may carry 'google' — the card shows the Google mark. */
export type ReviewSource = 'google' | 'website' | 'walk-in'

export interface Review extends BaseEntity {
  authorName: string
  /** Whole stars, 1–5. */
  rating: number
  quote: string
  /** Month precision, as displayed — "March 2026". */
  reviewedOn?: string
  courseName?: string
  source: ReviewSource
  order: number
  status: ContentStatus
}
