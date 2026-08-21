import { z } from 'zod'

/**
 * A block of content an editor added, as the API accepts it.
 *
 * One schema for course blocks and page blocks. They store the same columns and
 * render through the same component, so validating them apart would only create
 * somewhere for the two to drift — the first time one gained a rule, the other
 * would quietly not have it.
 *
 * Courses extend this with an anchor and a placement, because a course block is
 * positioned against a generated section. A page is a flat ordered list.
 */

export const CONTENT_BLOCK_TYPES = ['rich-text', 'image', 'video', 'cta', 'blogs'] as const

export type ContentBlockType = (typeof CONTENT_BLOCK_TYPES)[number]

/**
 * Links are validated rather than trusted.
 *
 * Internal links start with '/', external ones must be http(s) — which rules
 * out `javascript:` and `data:`, both of which would otherwise be rendered
 * straight into an href. An empty string is allowed and means "no link".
 */
export const blockLinkUrl = z
  .string()
  .max(500, 'That link is too long to store.')
  .refine(
    (value) => value === '' || value.startsWith('/') || /^https?:\/\//i.test(value),
    'Enter a path beginning with "/" for a page on this site, or a full https:// address.',
  )

const blockMedia = z.object({
  id: z.string().min(1),
  url: z.string().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const contentBlockFields = {
  id: z.string().optional(),
  title: z.string().max(200).optional(),
  body: z.string().optional(),
  media: blockMedia.nullish(),
  linkUrl: blockLinkUrl.optional(),
  linkLabel: z.string().max(120).optional(),
  linkTarget: z.enum(['same', 'new']).default('same'),
  visible: z.boolean().default(true),
}

/**
 * Each kind has one thing it cannot render without.
 *
 * Checked here so the editor is told which box to fill, rather than publishing
 * a block that renders as an empty strip on the live page. 'blogs' is the
 * exception — it draws its content from the posts that exist, so there is
 * nothing for an editor to supply.
 */
export function requireBlockContent(
  block: {
    type: string
    body?: string
    media?: unknown
    linkUrl?: string
    linkLabel?: string
  },
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
  .object({ ...contentBlockFields, type: z.enum(CONTENT_BLOCK_TYPES) })
  .superRefine(requireBlockContent)

export type PageSectionInput = z.infer<typeof pageSectionSchema>
