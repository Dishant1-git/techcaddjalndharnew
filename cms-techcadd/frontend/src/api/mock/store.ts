import type {
  Banner,
  Blog,
  Branch,
  Category,
  Course,
  EnquiryRecord,
  Faculty,
  GalleryAlbum,
  MediaItem,
  Page,
  Redirect,
  SiteSettings,
  Testimonial,
  User,
} from '../../types'

const STORAGE_KEY = 'techcadd-cms:db'
const SCHEMA_VERSION = 2

export interface Database {
  version: number
  courses: Course[]
  categories: Category[]
  pages: Page[]
  banners: Banner[]
  blogs: Blog[]
  faculty: Faculty[]
  branches: Branch[]
  testimonials: Testimonial[]
  galleryAlbums: GalleryAlbum[]
  enquiries: EnquiryRecord[]
  media: MediaItem[]
  redirects: Redirect[]
  users: User[]
  settings: SiteSettings
}

/** The site's own configuration. Structural, not content, so it has defaults. */
function defaultSettings(): SiteSettings {
  return {
    siteName: 'TechCadd',
    tagline: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    social: {},
    robotsTxt: 'User-agent: *\nAllow: /\n\nSitemap: https://techcadd.com/sitemap.xml',
    notifications: { newEnquiryEmail: true, dailyEnquiryDigest: false, contentPublished: false },
    integrations: {},
    profile: { name: 'techcadd-team', email: 'admin@techcadd.com' },
  }
}

/** Every collection starts empty — the CMS ships with no sample records. */
export function createEmptyDatabase(): Database {
  return {
    version: SCHEMA_VERSION,
    courses: [],
    categories: [],
    pages: [],
    banners: [],
    blogs: [],
    faculty: [],
    branches: [],
    testimonials: [],
    galleryAlbums: [],
    enquiries: [],
    media: [],
    redirects: [],
    users: [],
    settings: defaultSettings(),
  }
}

/** Collections only — `settings` is a singleton and is handled separately. */
export type CollectionKey = Exclude<keyof Database, 'version' | 'settings'>

let cache: Database | null = null

function isDatabase(value: unknown): value is Database {
  return typeof value === 'object' && value !== null && 'version' in value
}

export function readDatabase(): Database {
  if (cache) return cache

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null

    // A stored DB from an older schema is discarded rather than migrated —
    // there is no production data to preserve yet.
    if (isDatabase(parsed) && parsed.version === SCHEMA_VERSION) {
      cache = { ...createEmptyDatabase(), ...parsed }
      return cache
    }
  } catch {
    // Corrupt or unavailable storage falls back to an empty database.
  }

  cache = createEmptyDatabase()
  return cache
}

export function writeDatabase(db: Database): void {
  cache = db
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Quota or private-mode failures leave the in-memory cache authoritative.
  }
}

export function readCollection<K extends CollectionKey>(key: K): Database[K] {
  return readDatabase()[key]
}

export function writeCollection<K extends CollectionKey>(key: K, items: Database[K]): void {
  writeDatabase({ ...readDatabase(), [key]: items })
}

/** Wipes all records. Used by the dev-only reset action. */
export function resetDatabase(): void {
  writeDatabase(createEmptyDatabase())
}
