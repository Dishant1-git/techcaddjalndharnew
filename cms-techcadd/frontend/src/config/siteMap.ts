/**
 * Where each kind of content ends up on the public website.
 *
 * An editor filling in a form cannot tell, from the form alone, whether they
 * are writing something that appears on the homepage, on a page of its own, or
 * nowhere at all until a developer wires it up. That gap is where "I saved it
 * and nothing happened" comes from, so it is answered here in one place and
 * shown on every form.
 *
 * Keeping it as data rather than prose in each form means a module that is not
 * yet connected has to say so explicitly, instead of quietly omitting the note.
 */

/** The public site. Set VITE_SITE_URL when it is not on the usual dev port. */
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'http://localhost:3000'
).replace(/\/$/, '')

export interface Placement {
  /** Where this content shows up, in a sentence an editor can act on. */
  where: string
  /**
   * The public URL of one record, when it has a page of its own.
   *
   * Undefined means the content appears inside other pages rather than at its
   * own address — a testimonial has no URL, a blog post does.
   */
  url?: (record: Record<string, unknown>) => string | undefined
  /**
   * Set when nothing on the website reads this yet.
   *
   * The honest alternative to leaving the module out of this map, which would
   * read as "no note needed" rather than "this goes nowhere".
   */
  notLive?: string
}

const slugUrl = (prefix: string) => (record: Record<string, unknown>) => {
  const slug = record.slug
  return typeof slug === 'string' && slug ? `${SITE_URL}${prefix}${slug}` : undefined
}

export const SITE_MAP: Record<string, Placement> = {
  blogs: {
    where: 'The blog index at /blogs, and a page of its own.',
    url: slugUrl('/blogs/'),
  },
  courses: {
    where:
      'Its own course page, the listing for its section, the course dropdown in the menus and the sitemap. The category you choose is the heading it is filed under.',
    url: (record) => {
      const { slug, segment } = record
      if (typeof slug !== 'string' || !slug) return undefined
      const section = typeof segment === 'string' && segment ? segment : 'courses'
      return `${SITE_URL}/${section}/${slug}`
    },
  },
  categories: {
    where: 'The category cards on the homepage. The slug decides which course page the card opens.',
  },
  pages: {
    where: 'A page of its own at the address below.',
    url: slugUrl('/'),
  },
  faqs: {
    where:
      'The /faq page, grouped under the category you enter. Featured questions also appear in the homepage FAQ section.',
  },
  reviews: {
    where:
      'The /reviews page. Only reviews with source "Google" are shown there, because the card carries the Google mark.',
  },
  testimonials: {
    where: 'The testimonials carousel on the homepage. Featured ones are shown first.',
  },
  gallery: {
    where: 'The /gallery page, as a photo wall grouped by album.',
  },
  banners: {
    where:
      'The homepage, directly under the hero — but only for the "Home hero" placement, which is the only one the website renders today. A banner also needs artwork, and needs today to fall inside its start and end dates.',
  },
  settings: {
    where:
      'Site-wide. The headline figures appear on the about page; the rest is used for contact details and metadata.',
  },
  redirects: {
    where: 'Applied to every visitor request, so an old address sends people to the new one.',
  },
  enquiries: {
    where: 'Received from the website forms. Nothing here is published back to it.',
  },
  media: {
    where: 'Used by whatever content references it — a cover photo, a banner, a gallery image.',
  },
  seo: {
    where: 'Meta titles and descriptions are used on the pages they belong to.',
  },
  branches: {
    where: '',
    notLive:
      'Nothing on the website reads branches yet — it has no locations section. These records are for internal reference until one is built.',
  },
  faculty: {
    where: '',
    notLive:
      'Nothing on the website reads faculty yet — it has no trainers section. These records are for internal reference until one is built.',
  },
}
