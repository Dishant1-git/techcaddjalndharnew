import {
  CmsUnavailableError,
  cmsImageUrl,
  getBlogs,
  getGalleryAlbums,
  getTestimonials,
  type CmsBlog,
  type CmsGalleryAlbum,
  type CmsTestimonial,
} from "./cms"
import { POSTS, type Post } from "./blogs"
import { GALLERY_TILES, type GalleryTile } from "./gallery"
import { TESTIMONIALS, type Testimonial } from "./testimonials"

/**
 * Content, from the CMS when it has any and from the checked-in constants when
 * it does not.
 *
 * The fallback is the point. Publishing is gradual — the CMS starts empty and
 * fills up one section at a time — and the site must not show an empty blog
 * page the moment it is wired up, nor go blank if the CMS is unreachable
 * during a deploy. Every loader here answers with something renderable.
 */

/** Photographs already in the repo, used when a CMS record has no cover. */
const FALLBACK_IMAGES = [
  "/assets/images/about/team.jpg",
  "/assets/images/about/lab-demo.webp",
  "/assets/images/about/mentoring.webp",
]

/**
 * Gradient pairs for cards whose art is a coloured placeholder.
 *
 * Presentation, so the CMS does not model it — cycling keeps a list of cards
 * from looking monotonous without an editor having to choose.
 */
const GRADIENTS = [
  { from: "from-brand-600", to: "to-brand-400" },
  { from: "from-accent-500", to: "to-brand-500" },
  { from: "from-brand-700", to: "to-accent-500" },
  { from: "from-ink", to: "to-brand-600" },
] as const

const gradient = (index: number) => GRADIENTS[index % GRADIENTS.length]!
const fallbackImage = (index: number) => FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]!

/** ~200 wpm over the stripped markup — close enough for a reading-time badge. */
function readingTime(html: string): string {
  const words = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

/** "Simranjeet Kaur" -> "SK", for the avatar placeholder. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/**
 * Runs a loader, and answers with the checked-in content if it fails.
 *
 * A page that renders yesterday's copy beats a page that 500s, so a CMS
 * outage is logged rather than thrown.
 */
async function withFallback<T>(
  label: string,
  load: () => Promise<T[]>,
  fallback: T[],
): Promise<T[]> {
  try {
    const items = await load()
    return items.length > 0 ? items : fallback
  } catch (error) {
    if (error instanceof CmsUnavailableError) {
      console.warn(`[content] ${label}: using built-in content —`, error.message)
    } else {
      console.error(`[content] ${label} failed:`, error)
    }
    return fallback
  }
}

function toPost(blog: CmsBlog, index: number): Post {
  const { from, to } = gradient(index)
  return {
    title: blog.title,
    excerpt: blog.excerpt,
    href: `/blogs/${blog.slug}`,
    // The CMS files posts by category and by tag; the card shows one word, and
    // a tag is the more specific of the two.
    category: blog.tags[0] ?? "Insights",
    date: (blog.publishDate ?? blog.updatedAt).slice(0, 10),
    readTime: readingTime(blog.body ?? ""),
    image: cmsImageUrl(blog.coverImage?.url) ?? fallbackImage(index),
    from,
    to,
  }
}

export function loadPosts(): Promise<Post[]> {
  return withFallback(
    "blogs",
    async () => (await getBlogs()).items.map(toPost),
    POSTS,
  )
}

function toTestimonial(item: CmsTestimonial, index: number): Testimonial {
  const { from, to } = gradient(index)
  return {
    quote: item.quote,
    name: item.studentName,
    // The CMS records the batch; the site shows a line under the name.
    role: item.batch ?? "Student",
    initials: initialsOf(item.studentName),
    from,
    to,
  }
}

export function loadTestimonials(): Promise<Testimonial[]> {
  return withFallback(
    "testimonials",
    async () => {
      const { items } = await getTestimonials()
      // Featured first — that is what the flag is for.
      return [...items]
        .sort((a, b) => Number(b.featured) - Number(a.featured))
        .map(toTestimonial)
    },
    TESTIMONIALS,
  )
}

/** Albums are flattened: the marquee shows photographs, not albums. */
function toTiles(albums: CmsGalleryAlbum[]): GalleryTile[] {
  return albums.flatMap((album) =>
    album.images.map((image) => ({
      image: cmsImageUrl(image.media.url) ?? "",
      title: image.caption ?? album.title,
    })),
  ).filter((tile) => tile.image !== "")
}

export function loadGalleryTiles(): Promise<GalleryTile[]> {
  return withFallback(
    "gallery",
    async () => toTiles((await getGalleryAlbums()).items),
    GALLERY_TILES,
  )
}
