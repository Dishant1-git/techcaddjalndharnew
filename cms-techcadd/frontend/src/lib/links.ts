/**
 * Whether a link an editor typed is one the site may render.
 *
 * Two shapes are allowed and nothing else:
 *   /contact             a path on this site
 *   https://example.com  another site
 *
 * Everything else is refused, which is what keeps `javascript:` and `data:`
 * out of an href. Those are the two that turn a link field into a way to run
 * script on the page, and an editor has no legitimate reason to type either.
 *
 * Mirrors the server rule in `backend/src/modules/shared/contentBlock.schema.ts`.
 * The server is the authority; this exists so the error lands on the field
 * rather than arriving as a failed save.
 */
export function isSafeLink(value: string): boolean {
  return value.startsWith('/') || /^https?:\/\//i.test(value)
}

export const LINK_MESSAGE =
  'Enter a path beginning with "/" for a page on this site, or a full https:// address.'

/** True when the link leaves this site — drives the "opens in a new tab" hint. */
export function isExternalLink(value: string | undefined): boolean {
  return /^https?:\/\//i.test(value ?? '')
}
