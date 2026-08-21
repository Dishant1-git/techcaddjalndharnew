import { z } from 'zod'

import { assetUrl } from '../../api/client'
import { isSafeLink, LINK_MESSAGE } from '../../lib/links'

/**
 * A block of content an editor added.
 *
 * Mirrors `backend/src/modules/shared/contentBlock.schema.ts`, and is shared
 * between courses and pages for the same reason the backend shares it: they
 * store the same columns and render through the same component, so validating
 * them apart would only give the two somewhere to drift.
 *
 * The server is the authority — it refuses a bad block whatever the browser
 * thinks — but repeating the rules here turns "the save failed" into a message
 * against the field the moment the editor leaves it.
 */

export const CONTENT_BLOCK_TYPES = [
  { value: 'rich-text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'cta', label: 'Call to action' },
  { value: 'blogs', label: 'Recent blog posts' },
] as const

const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const contentBlockFields = {
  id: z.string().optional(),
  title: z.string().max(200).optional(),
  body: z.string().optional(),
  media: mediaRefSchema.nullish(),
  linkUrl: z
    .string()
    .max(500, 'That link is too long to store.')
    .refine((value) => value === '' || isSafeLink(value), LINK_MESSAGE)
    .optional(),
  linkLabel: z.string().max(120).optional(),
  linkTarget: z.enum(['same', 'new']),
  visible: z.boolean(),
}

/**
 * Each kind has one thing it cannot render without.
 *
 * Caught here so the editor is told which box to fill rather than publishing a
 * block that renders as an empty strip. 'blogs' is the exception — it draws on
 * the posts that exist, so there is nothing for an editor to supply.
 */
export function requireBlockContent(
  block: { type: string; body?: string; media?: unknown; linkUrl?: string; linkLabel?: string },
  ctx: z.RefinementCtx,
): void {
  const required: Record<string, [string, string]> = {
    'rich-text': ['body', 'Add some text for this block.'],
    image: ['media', 'Choose an image for this block.'],
    video: ['linkUrl', 'Paste the video URL.'],
    cta: ['linkUrl', 'A call to action needs a link.'],
  }

  const rule = required[block.type]
  if (rule) {
    const [field, message] = rule
    if (!(block as Record<string, unknown>)[field]) {
      ctx.addIssue({ code: 'custom', path: [field], message })
    }
  }

  if (block.type === 'cta' && !block.linkLabel) {
    ctx.addIssue({
      code: 'custom',
      path: ['linkLabel'],
      message: 'A call to action needs button text.',
    })
  }
}

/** A page block: the shared fields, in an order the editor controls. */
export const pageSectionSchema = z
  .object({
    ...contentBlockFields,
    type: z.enum(['rich-text', 'image', 'video', 'cta', 'blogs']),
  })
  .superRefine(requireBlockContent)

export type PageSectionValues = z.infer<typeof pageSectionSchema>

/**
 * Blocks with their image addresses made absolute, for the preview frame.
 *
 * Media is stored as a site-relative path, and the preview renders inside the
 * website's client bundle, where the API origin is not available to prefix it —
 * so "/uploads/photo.png" would be requested from the website and 404. The CMS
 * knows its own API origin, so it resolves the address before sending.
 *
 * The live site does the same thing on the server with `resolveBlockMedia`.
 */
export function blocksForPreview<T extends { media?: { url: string } | null }>(
  blocks: T[] | undefined,
): T[] {
  return (blocks ?? []).map((block) =>
    block.media?.url
      ? { ...block, media: { ...block.media, url: assetUrl(block.media.url) ?? block.media.url } }
      : block,
  )
}
