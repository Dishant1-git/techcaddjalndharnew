/**
 * A block of content an editor added in the CMS.
 *
 * One shape, used by courses and by pages. That is deliberate: the brief for
 * this CMS was that content added later should look and behave like content
 * added before it, and the surest way to get that is for both to be the same
 * record rendered by the same component. Two parallel "section" models would
 * drift the first time one of them gained a field.
 *
 * Courses extend this with an anchor, because a course block is positioned
 * relative to a generated section. A page is a flat ordered list, so it needs
 * nothing extra.
 */

export const CONTENT_BLOCK_TYPES = [
  'rich-text',
  'image',
  'video',
  'cta',
  'blogs',
] as const

export type ContentBlockType = (typeof CONTENT_BLOCK_TYPES)[number]

export interface ContentBlock {
  id?: string
  type: ContentBlockType
  title?: string
  /** Rich text for 'rich-text', a caption for 'image', a lead line for 'cta'. */
  body?: string
  media?: { id: string; url: string; alt: string; width?: number; height?: number }
  /** The embed for 'video'; the destination for 'cta' and optional links. */
  linkUrl?: string
  linkLabel?: string
  linkTarget: 'same' | 'new'
  visible: boolean
}

/**
 * Turns a YouTube or Vimeo watch URL into its embed form.
 *
 * Editors paste the address from the browser bar, which is the share URL and
 * not the embeddable one — dropping it straight into an iframe yields a refused
 * connection. Anything unrecognised passes through untouched, so a URL that is
 * already an embed still works.
 */
export function embedUrl(url: string): string {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  )
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return url
}
