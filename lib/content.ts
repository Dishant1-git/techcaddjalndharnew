import { cache } from "react"
import {
  CmsUnavailableError,
  cmsImageUrl,
  getBlogs,
  getCategories,
  getCourses,
  getFaqs,
  getGalleryAlbums,
  getReviews,
  getBanners,
  getSite,
  getTestimonials,
  type CmsBanner,
  type CmsBlog,
  type CmsFaq,
  type CmsGalleryAlbum,
  type CmsReview,
  type CmsTestimonial,
} from "./cms"
import { type Post } from "./blogs"
import { COURSE_CATEGORIES, type CourseCategory } from "./categories"
import { STATS, type Stat } from "./stats"
import { FAQ_CATEGORIES, type Faq } from "./faqs"
import { COURSE_SPECS, GENERIC_SPEC, type CourseSpec } from "./course-specs"
import { specFromCourse } from "./course-spec-from-cms"
import { COURSE_LABELS, type CatalogueEntry, type PageLayout } from "./course-pages"
import { GALLERY_TILES, type GalleryTile } from "./gallery"
import { type GoogleReview } from "./reviews"
import { TESTIMONIALS, type Testimonial } from "./testimonials"
import { SITE } from "./site"

/**
 * Content, from the CMS when it has any and from the checked-in constants when
 * it does not.
 *
 * Two kinds of loader live here, and which one a section gets is a judgement
 * about whether stand-in copy would be true.
 *
 * `withFallback` is for the sections that describe us: the course list, the
 * categories, the headline figures. That copy holds whether or not an editor
 * has touched the CMS, so publishing can be gradual and a CMS outage during a
 * deploy costs nothing.
 *
 * `cmsOnly` is for the sections that quote somebody: articles, questions
 * visitors asked, reviews they left. Inventing one of those is a claim about
 * the world, not a placeholder, so those pages render an empty state instead.
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

/**
 * Runs a loader that has no checked-in content behind it, and answers with an
 * empty list if it fails.
 *
 * For the sections nobody may invent: an article, a question somebody asked, a
 * review somebody left. Either an editor entered it or it does not exist, and
 * standing in for one with hand-written copy would put a byline, an answer or
 * a star rating on something that never happened. Every caller renders an
 * empty state instead, so a CMS outage costs a section rather than the page.
 */
async function cmsOnly<T>(label: string, load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load()
  } catch (error) {
    if (error instanceof CmsUnavailableError) {
      console.warn(`[content] ${label}: the CMS is unavailable —`, error.message)
    } else {
      console.error(`[content] ${label} failed:`, error)
    }
    return []
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
    // A CMS post has a body, so /blogs/<slug> renders it.
    hasArticle: true,
    from,
    to,
  }
}

/** The blog, from the CMS and nowhere else — see `cmsOnly`. */
export const loadPosts = cache(function loadPosts(): Promise<Post[]> {
  return cmsOnly("blogs", async () => (await getBlogs()).items.map(toPost))
})

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

export const loadTestimonials = cache(function loadTestimonials(): Promise<Testimonial[]> {
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
})

/** Albums are flattened: the marquee shows photographs, not albums. */
function toTiles(albums: CmsGalleryAlbum[]): GalleryTile[] {
  return albums.flatMap((album) =>
    album.images.map((image) => ({
      image: cmsImageUrl(image.media.url) ?? "",
      title: image.caption ?? album.title,
    })),
  ).filter((tile) => tile.image !== "")
}

export const loadGalleryTiles = cache(function loadGalleryTiles(): Promise<GalleryTile[]> {
  return withFallback(
    "gallery",
    async () => toTiles((await getGalleryAlbums()).items),
    GALLERY_TILES,
  )
})

/* ------------------------------------------------------------------ */
/* FAQs                                                                 */
/* ------------------------------------------------------------------ */

function toFaq(faq: CmsFaq): Faq {
  return {
    question: faq.question,
    answer: faq.answer,
    // The CMS stores a free-text category so a new section needs no migration.
    // The site's union type is narrower, so widen at the boundary rather than
    // dropping a question whose category is simply newer than this file.
    category: faq.category as Faq['category'],
  }
}

/** Every question on /faq, from the CMS and nowhere else — see `cmsOnly`. */
export const loadFaqs = cache(function loadFaqs(): Promise<Faq[]> {
  return cmsOnly('faqs', async () => (await getFaqs()).items.map(toFaq))
})

/**
 * The sections the FAQ page renders, in order.
 *
 * Derived from the questions rather than fixed, so adding a category in the
 * CMS is enough to make the section appear.
 */
export const loadFaqCategories = cache(async function loadFaqCategories(): Promise<string[]> {
  const faqs = await loadFaqs()
  const seen = new Set<string>()
  const order: string[] = []

  // Keep the built-in order for categories we already know, then append any
  // new ones in the order they first appear.
  for (const known of FAQ_CATEGORIES) if (faqs.some((f) => f.category === known)) order.push(known)
  for (const faq of faqs) {
    if (order.includes(faq.category) || seen.has(faq.category)) continue
    seen.add(faq.category)
    order.push(faq.category)
  }

  return order
})

/** The homepage shows a short selection, chosen in the CMS by the featured flag. */
export const loadHomepageFaqs = cache(function loadHomepageFaqs(): Promise<Faq[]> {
  return cmsOnly('homepage faqs', async () => {
    const { items } = await getFaqs()
    const featured = items.filter((faq) => faq.featured)

    // Re-sorted by the CMS ordering field, because the list arrives grouped by
    // category. Six questions from six different sections read as an arbitrary
    // sample; in the editor's order they read as the six most asked, which is
    // what the flag is for.
    return (featured.length > 0 ? featured : items)
      .slice()
      .sort((a, b) => a.order - b.order)
      .slice(0, 6)
      .map(toFaq)
  })
})

/* ------------------------------------------------------------------ */
/* Reviews                                                              */
/* ------------------------------------------------------------------ */

/**
 * "2026-07-15" -> "July 2026".
 *
 * The CMS stores a DATE, but a review card shows month precision — printing the
 * raw `2026-07-15` next to the hand-written "July 2026" of the built-in
 * reviews would make the same list look like two different lists. Anything the
 * expected shape does not match is passed through, so a CMS that one day stores
 * a display string still renders it.
 */
const REVIEW_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function formatReviewDate(value: string | undefined): string {
  if (!value) return ""
  const match = /^(\d{4})-(\d{2})/.exec(value)
  if (!match) return value
  return `${REVIEW_MONTHS[Number(match[2]) - 1] ?? ""} ${match[1]}`.trim()
}

function toReview(review: CmsReview): GoogleReview {
  return {
    name: review.authorName,
    initials: initialsOf(review.authorName),
    rating: review.rating,
    date: formatReviewDate(review.reviewedOn),
    quote: review.quote,
    course: review.courseName ?? "",
    source: "google",
    googleUrl: review.googleUrl || undefined,
  }
}

/**
 * Only reviews left on Google, from the CMS and nowhere else — see `cmsOnly`.
 *
 * The card carries the Google mark, which tells a visitor something specific
 * about where the review came from. A walk-in comment rendered with that badge
 * would be a small lie, so the others are filtered out rather than relabelled
 * — and a review nobody wrote is the same lie with nobody to attribute it to,
 * which is why there is no checked-in list behind this one.
 */
export const loadReviews = cache(function loadReviews(): Promise<GoogleReview[]> {
  return cmsOnly("reviews", async () =>
    (await getReviews()).items.filter((review) => review.source === "google").map(toReview),
  )
})

/* ------------------------------------------------------------------ */
/* Contact details                                                      */
/* ------------------------------------------------------------------ */

/** The parts of SITE an office can change without a developer. */
export interface Contact {
  phone: string
  email: string
  street: string
  locality: string
  region: string
  postalCode: string
  /** Ready-made hrefs, so no caller has to strip spaces from a number. */
  phoneHref: string
  emailHref: string
}

/** tel: wants digits and a plus, not the spacing a human reads. */
const withHrefs = (c: Omit<Contact, "phoneHref" | "emailHref">): Contact => ({
  ...c,
  phoneHref: `tel:${c.phone.replace(/[^0-9+]/g, "")}`,
  emailHref: `mailto:${c.email}`,
})

/**
 * Contact details, from the CMS settings row where they have been filled in.
 *
 * These appear on the contact page, in the privacy notice, in the brochure PDF
 * and in the organisation schema — the NAP that has to match the Google
 * Business Profile character for character. That is exactly why it is one
 * loader rather than four reads: changing the number in the CMS has to move all
 * of them together, or the listing and the site start disagreeing.
 *
 * The CMS stores the address as a single block; the schema needs it split. A
 * value is therefore only taken when it can be parsed into the parts, and
 * otherwise the verified constant stands.
 */
export const loadContact = cache(async function loadContact(): Promise<Contact> {
  const fallback: Contact = withHrefs({
    phone: SITE.phone,
    email: SITE.email,
    street: SITE.street,
    locality: SITE.locality,
    region: SITE.region,
    postalCode: SITE.postalCode,
  })

  try {
    const site = await getSite()

    return withHrefs({
      phone: site.contactPhone?.trim() || fallback.phone,
      email: site.contactEmail?.trim() || fallback.email,
      // Street only. Locality, region and postcode stay on the constant: they
      // are the parts Google matches most strictly, and a free-text box is the
      // wrong shape to hold them reliably.
      street: site.address?.trim() || fallback.street,
      locality: fallback.locality,
      region: fallback.region,
      postalCode: fallback.postalCode,
    })
  } catch (error) {
    if (error instanceof CmsUnavailableError) {
      console.warn("[content] contact details: using built-in values —", error.message)
    } else {
      console.error("[content] contact details failed:", error)
    }
    return fallback
  }
})

/* ------------------------------------------------------------------ */
/* Banners                                                              */
/* ------------------------------------------------------------------ */

/**
 * Promotional banners for one slot.
 *
 * No fallback, deliberately: there is no built-in banner to fall back to, and
 * an empty list is the correct answer when nothing is scheduled. A CMS outage
 * therefore hides the promo rather than breaking the page around it.
 */
export const loadBanners = cache(async function loadBanners(
  placement: CmsBanner["placement"],
): Promise<CmsBanner[]> {
  try {
    return (await getBanners(placement)).items
  } catch (error) {
    if (error instanceof CmsUnavailableError) {
      console.warn(`[content] banners (${placement}): none shown —`, error.message)
    } else {
      console.error("[content] banners failed:", error)
    }
    return []
  }
})

/* ------------------------------------------------------------------ */
/* Headline figures                                                     */
/* ------------------------------------------------------------------ */

/**
 * The numbers on the stats band, from the CMS settings row.
 *
 * Only the figure and the label come from the CMS. The orbit duration, the
 * stagger offset, the zig-zag lift and the ring size are animation timing —
 * they make the four dots never line up, which is a visual decision nobody
 * should have to make in a settings form. They are cycled by position instead,
 * so a fifth figure gets sensible motion for free.
 */
export const loadStats = cache(async function loadStats(): Promise<Stat[]> {
  const presentation = STATS.map(({ duration, offset, lift, size }) => ({
    duration,
    offset,
    lift,
    size,
  }))

  return withFallback(
    "stats",
    async () => {
      const { stats } = await getSite()
      return stats.map((stat, index) => ({
        value: stat.value,
        label: stat.label,
        ...presentation[index % presentation.length]!,
      }))
    },
    STATS,
  )
})

/* ------------------------------------------------------------------ */
/* Course categories                                                    */
/* ------------------------------------------------------------------ */

/**
 * The category cards, from the CMS.
 *
 * `href` is derived from the slug rather than stored: a category card links to
 * the course page of the same name, and a free-text URL field is one typo away
 * from a dead link on the homepage.
 *
 * The gradient pair is presentation and is cycled by position, but a CMS
 * accent colour wins when one is set — that is a deliberate choice an editor
 * made, unlike the fallback.
 */
export const loadCourseCategories = cache(function loadCourseCategories(): Promise<CourseCategory[]> {
  return withFallback(
    "categories",
    async () => {
      const { items } = await getCategories()
      return items.map((category, index) => {
        // Keep the built-in art for a category the site already knows.
        const known = COURSE_CATEGORIES.find((c) => c.id === category.slug)
        const { from, to } = known ?? CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]!

        return {
          // The slug is the identity: it is unique per category, and it is
          // what React keys the card list on. The icon is presentation and
          // is free to repeat — an editor may well give two categories the
          // same glyph, which is why the two are no longer one field.
          id: category.slug,
          icon: category.icon || category.slug,
          label: category.name,
          blurb: category.description ?? "",
          href: `/courses/${category.slug}`,
          image: known?.image,
          from,
          to,
        }
      })
    },
    COURSE_CATEGORIES,
  )
})

/** Fallback cover treatments for categories the site has no art for. */
const CATEGORY_GRADIENTS = [
  { from: "from-brand-500", to: "to-brand-900" },
  { from: "from-violet-500", to: "to-brand-800" },
  { from: "from-accent-400", to: "to-brand-800" },
  { from: "from-emerald-400", to: "to-brand-900" },
  { from: "from-rose-400", to: "to-brand-800" },
  { from: "from-sky-400", to: "to-brand-900" },
] as const

/* ------------------------------------------------------------------ */
/* Course page copy                                                     */
/* ------------------------------------------------------------------ */

/**
 * Courses that exist in the CMS but not in the site's navigation.
 *
 * Without this a course created in the CMS has no page at all: the built-in
 * catalogue is derived from the menus, so a course nobody has added a menu link
 * for is invisible to the router and 404s. These entries give it a route, a
 * listing card and a sitemap line; editing the menus is still how it gets into
 * the dropdown.
 */
/**
 * The CMS course list, fetched once per render rather than once per reader.
 *
 * Four things here need it — the catalogue, the specs, the page layouts and
 * the enquiry-form label check — and each used to call `getCourses` itself.
 * With CMS_CACHE_SECONDS at 0, which is the development default, that was four
 * identical round trips for every page rendered. During a build of fifty course
 * pages it was enough extra load to start timing out other pages' CMS calls,
 * which showed up as blog posts quietly dropping out of the prerender.
 *
 * `cache` dedupes within one render pass, so the four readers below now share
 * a single response.
 */
const loadCourses = cache(async function loadCourses() {
  return (await getCourses(100)).items
})
export const loadCourseCatalogue = cache(async function loadCourseCatalogue(): Promise<CatalogueEntry[]> {
  try {
    const items = await loadCourses()

    // Every CMS course, including ones the menus already list: mergedCatalogue
    // keeps the menu's group and takes the CMS's name, so renaming a course
    // here reaches the site instead of being dropped on the floor.
    return items
      .map((course) => ({
        segment: course.segment,
        slug: course.slug,
        label: course.title,
        // The category chosen in the CMS is the group the site files it under,
        // so the two agree. Without a category there is nothing to group by,
        // and a neutral heading beats inventing one.
        group: course.categoryName ?? "More courses",
      }))
  } catch (error) {
    if (error instanceof CmsUnavailableError) {
      console.warn("[content] course catalogue: using built-in content —", error.message)
    } else {
      console.error("[content] course catalogue failed:", error)
    }
    return []
  }
})

/**
 * Whether a course name may be submitted on an enquiry or brochure form.
 *
 * The built-in set is derived from the navigation; a course added in the CMS is
 * not in it, so without this check its own enquiry form would be rejected by
 * the API that the page itself points at.
 */
export const isKnownCourseLabel = cache(async function isKnownCourseLabel(label: string): Promise<boolean> {
  if (COURSE_LABELS.has(label)) return true

  try {
    const items = await loadCourses()
    return items.some((course) => course.title === label)
  } catch {
    // The CMS being down must not start rejecting enquiries for built-in
    // courses — those already returned true above — so fail closed only for
    // the names we genuinely cannot confirm.
    return false
  }
})

/**
 * The specs each course page is generated from, with the CMS taking priority.
 *
 * Merged over the checked-in specs rather than replacing them: a course whose
 * copy has not been entered in the CMS yet keeps the page it has today, and a
 * course the CMS knows about but this file does not still gets one. Only the
 * fields an editor actually filled in are taken, so a half-completed record
 * cannot blank a tagline that was already written.
 */
/**
 * Per-course page arrangement from the CMS, keyed the way getCoursePage looks
 * it up.
 *
 * Split from `loadCourseSpecs` because the two answer different questions —
 * one is the copy a page is generated from, the other is which sections that
 * page has and in what order — and because a course with nothing arranged
 * should contribute no entry at all rather than an empty one, so that
 * `getCoursePage` can skip the whole step.
 */
export const loadCourseLayouts = cache(async function loadCourseLayouts(): Promise<
  Record<string, PageLayout>
> {
  try {
    const items = await loadCourses()
    const layouts: Record<string, PageLayout> = {}

    for (const course of items) {
      const layout: PageLayout = {
        hiddenSections: course.hiddenSections?.length ? course.hiddenSections : undefined,
        blocks: course.sections?.length ? course.sections : undefined,
        overview: course.overview || undefined,
        videoUrl: course.videoUrl || undefined,
        videoTitle: course.videoTitle || undefined,
      }

      if (Object.values(layout).some((value) => value !== undefined)) {
        layouts[`${course.segment}/${course.slug}`] = layout
      }
    }

    return layouts
  } catch (error) {
    if (error instanceof CmsUnavailableError) {
      console.warn('[content] course layouts: using built-in content —', error.message)
    } else {
      console.error('[content] course layouts failed:', error)
    }
    return {}
  }
})

export const loadCourseSpecs = cache(async function loadCourseSpecs(): Promise<Record<string, CourseSpec>> {
  try {
    const items = await loadCourses()
    const merged: Record<string, CourseSpec> = { ...COURSE_SPECS }

    for (const course of items) {
      const key = `${course.segment}/${course.slug}`
      // The same mapping the CMS preview runs, so what an editor is shown
      // before saving is what this produces after.
      merged[key] = specFromCourse(course, merged[key] ?? GENERIC_SPEC)
    }

    return merged
  } catch (error) {
    if (error instanceof CmsUnavailableError) {
      console.warn('[content] course specs: using built-in content —', error.message)
    } else {
      console.error('[content] course specs failed:', error)
    }
    return COURSE_SPECS
  }
})
