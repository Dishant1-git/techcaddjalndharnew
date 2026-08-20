/**
 * Whether a URL really points at Google.
 *
 * The reviews page renders this behind a button reading "Read on Google", next
 * to the Google mark. That is a claim about where the words came from, so the
 * address behind it has to be checkable — a link to anywhere else under that
 * label is a lie the CMS would be helping to tell. Hence an allowlist of hosts
 * rather than a general "is this a URL" check.
 *
 * The list is Google's own review and maps surfaces:
 *   google.com/maps/...        a place or a review permalink
 *   <cc>.google.com            the regional domains, e.g. google.co.in
 *   g.page / g.co              the short links a Business Profile hands out
 *   goo.gl, maps.app.goo.gl    the older and current maps share links
 *
 * http is refused as well as unknown hosts: these links are printed on a page
 * served over https, and an http one would be blocked or downgraded anyway.
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
