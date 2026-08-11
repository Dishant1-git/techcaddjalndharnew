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
export type UserRole = 'super-admin' | 'admin' | 'editor'

/* ------------------------------------------------------------------ */
/* Courses                                                              */
/* ------------------------------------------------------------------ */

export interface SyllabusModule {
  id: string
  title: string
  topics: string[]
  hours?: number
}

export interface Course extends BaseEntity {
  title: string
  slug: string
  categoryId?: string
  shortDescription: string
  description: string
  duration: string
  fee: number
  discountedFee?: number
  level: CourseLevel
  mode: CourseMode
  thumbnail?: MediaRef | null
  gallery: MediaRef[]
  syllabus: SyllabusModule[]
  highlights: string[]
  eligibility?: string
  certification?: string
  branchIds: string[]
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

export interface Page extends BaseEntity {
  title: string
  slug: string
  template: string
  content: string
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

export interface SocialLinks {
  linkedin?: string
  x?: string
  github?: string
  website?: string
}

export interface Faculty extends BaseEntity {
  name: string
  photo?: MediaRef | null
  designation: string
  qualifications: string
  expertise: string[]
  experienceYears: number
  bio: string
  branchId?: string
  email?: string
  social: SocialLinks
  order: number
  status: ContentStatus
}

/* ------------------------------------------------------------------ */
/* Branches                                                             */
/* ------------------------------------------------------------------ */

export interface OpeningHours {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  open?: string
  close?: string
  closed: boolean
}

export interface Branch extends BaseEntity {
  name: string
  code: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  phones: string[]
  email?: string
  mapEmbedUrl?: string
  latitude?: number
  longitude?: number
  hours: OpeningHours[]
  photos: MediaRef[]
  managerId?: string
  status: ContentStatus
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
  branchName: string
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

export interface SiteSettings {
  siteName: string
  tagline?: string
  logo?: MediaRef | null
  favicon?: MediaRef | null
  contactEmail?: string
  contactPhone?: string
  address?: string
  social: SocialLinks
  /** Edited from the SEO module. */
  robotsTxt: string
  notifications: NotificationPreferences
  integrations: Integrations
  /** Stands in for the signed-in user until auth lands. */
  profile: { name: string; email: string }
}
