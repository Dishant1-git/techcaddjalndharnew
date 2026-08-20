/**
 * Mirrors `backend/src/modules/reviews/googleUrl.ts`.
 *
 * Restated rather than imported because the two apps are separate builds. The
 * server is the authority — it refuses a bad link whatever the browser thinks
 * — but repeating the rule here is what turns "the save failed" into a message
 * against the field the moment the editor leaves it.
 */

const EXACT_HOSTS = new Set([
  'g.page',
  'g.co',
  'goo.gl',
  'maps.app.goo.gl',
  'maps.google.com',
  'search.google.com',
])

/** google.com, google.co.in, google.de … but not google.evil.com. */
const GOOGLE_DOMAIN = /^(?:www\.)?google(?:\.[a-z]{2,3}){1,2}$/

export function isGoogleUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }

  if (url.protocol !== 'https:') return false

  const host = url.hostname.toLowerCase()
  return EXACT_HOSTS.has(host) || GOOGLE_DOMAIN.test(host)
}

export const GOOGLE_URL_MESSAGE =
  'Enter an https link to Google — a review, place or profile URL such as https://g.page/… or https://www.google.com/maps/…'
