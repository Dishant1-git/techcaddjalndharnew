/**
 * The shape of a review, and the headline numbers above them.
 *
 * Deliberately separate from lib/testimonials.ts: those are marketing quotes
 * chosen for the homepage band, these carry the shape a review actually has —
 * a star rating, a date and the place it was left.
 *
 * The reviews themselves come from the CMS and nowhere else — `loadReviews` in
 * lib/content.ts is the only source. There is no checked-in list on purpose:
 * the cards carry the Google mark, which tells a visitor this was left on a
 * profile they can go and check, and a written-in review makes that false.
 */

export type GoogleReview = {
  name: string
  initials: string
  /** Whole stars, 1–5. */
  rating: number
  /** Display string rather than an ISO date — these are month-precision. */
  date: string
  quote: string
  /** What they trained in, shown as a chip. */
  course: string
  /** Drives the Google badge. Only reviews genuinely left there may use it. */
  source: "google"
}

/**
 * Headline numbers for the reviews page.
 *
 * TODO: still hand-written, and the CMS has no field for them — unlike the
 * reviews below the band, which now come from it. These must match the live
 * Google Business Profile: a rating shown here that disagrees with the one on
 * Google is worse than showing no number at all.
 */
export const REVIEW_META = {
  rating: "4.9",
  outOf: "5",
  count: "750+",
  placed: "10,000+",
}
