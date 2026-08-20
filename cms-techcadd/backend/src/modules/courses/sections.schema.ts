import { z } from 'zod'

/**
 * A block an editor adds to a course page.
 *
 * Shared by the API and, in mirrored form, by the CMS. The set of types is
 * closed because each one maps to a component on the website — a free-text
 * "type" would let an editor save a block nothing knows how to render, which
 * is the definition of a dead field.
 */

export const SECTION_TYPES = ['rich-text', 'image', 'video', 'cta'] as const

/**
 * Where a block may be anchored: the id of a generated section on the course
 * template. Kept as a list rather than free text so the CMS can offer a menu
 * and a renamed section cannot leave blocks pointing at nothing.
 */
export const SECTION_ANCHORS = [
  'hero',
  'overview',
  'who-can-do',
  'why-this-program',
  'modules',
  'what-you-will-learn',
  'tools',
  'outcomes',
  'projects',
  'why-techcadd',
  'reviews',
  'faqs',
  'cta',
  'enquiry',
] as const

/** Generated sections an editor may switch off. */
export const HIDEABLE_SECTIONS = [
  'overview',
  'who-can-do',
  'why-this-program',
  'modules',
  'what-you-will-learn',
  'tools',
  'outcomes',
  'projects',
  'why-techcadd',
  'reviews',
  'faqs',
  'related',
] as const

/**
 * Links are validated rather than trusted.
 *
 * Internal links start with '/', external ones must be http(s) — which rules
 * out `javascript:` and `data:`, both of which would otherwise be rendered
 * straight into an href. An empty string is allowed and means "no link".
 */
const linkUrl = z
  .string()
  .max(500, 'That link is too long to store.')
  .refine(
    (value) =>
      value === '' ||
      value.startsWith('/') ||
      /^https?:\/\//i.test(value),
    'Enter a path beginning with "/" for a page on this site, or a full https:// address.',
  )

export const courseSectionSchema = z
  .object({
    id: z.string().optional(),
    type: z.enum(SECTION_TYPES),
    title: z.string().max(200).optional(),
    body: z.string().optional(),
    media: z
      .object({
        id: z.string().min(1),
        url: z.string().optional(),
        alt: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      })
      .nullish(),
    linkUrl: linkUrl.optional(),
    linkLabel: z.string().max(120).optional(),
    linkTarget: z.enum(['same', 'new']).default('same'),
    anchor: z.enum(SECTION_ANCHORS),
    placement: z.enum(['before', 'after']).default('after'),
    visible: z.boolean().default(true),
  })
  .superRefine((section, ctx) => {
    // Each type has one thing it cannot render without. Saying so here means
    // the editor is told which box to fill rather than publishing a block that
    // renders as an empty strip on the live page.
    const required: Record<string, [keyof typeof section, string]> = {
      'rich-text': ['body', 'Add some text for this block.'],
      image: ['media', 'Choose an image for this block.'],
      video: ['linkUrl', 'Paste the video URL.'],
      cta: ['linkUrl', 'A call to action needs a link.'],
    }

    const [field, message] = required[section.type]!
    if (!section[field]) ctx.addIssue({ code: 'custom', path: [field], message })

    if (section.type === 'cta' && !section.linkLabel) {
      ctx.addIssue({
        code: 'custom',
        path: ['linkLabel'],
        message: 'A call to action needs button text.',
      })
    }
  })

export type CourseSectionInput = z.infer<typeof courseSectionSchema>
