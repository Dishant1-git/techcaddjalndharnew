/**
 * A blog card, as the site renders it.
 *
 * Every post comes from the CMS — `loadPosts` in lib/content.ts is the only
 * source, and there is no checked-in list behind it. This file holds the shape
 * and the date formatting the cards share, nothing else.
 */
export type Post = {
  title: string
  excerpt: string
  /** Where the post lives, and a stable key for the card. */
  href: string
  /**
   * Whether there is an article behind the card.
   *
   * Always true for a CMS post, which has a body and a page at its slug. Kept
   * optional so a card built some other way cannot link by accident — that
   * would be a 404 on every click.
   */
  hasArticle?: boolean
  category: string
  /** ISO date — formatted at render time so the markup stays locale-agnostic. */
  date: string
  readTime: string
  /**
   * Cover photograph. The editor's upload when the post has one, and one of the
   * repo's photographs cycled by position when it does not.
   */
  image: string
  /** Tailwind gradient pair, for cards whose art is a coloured placeholder. */
  from: string
  to: string
}

/** Stable across server and client — `toLocaleDateString` is not. */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

/** Shared by the homepage teasers and the /blogs index, so one post can never
 *  show two different dates depending on where it is rendered. */
export function formatPostDate(iso: string) {
  const [year, month, day] = iso.split("-")
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`
}
