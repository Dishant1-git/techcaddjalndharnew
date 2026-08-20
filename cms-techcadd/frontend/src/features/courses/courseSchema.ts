import { z } from 'zod'

const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const seoSchema = z.object({
  metaTitle: z.string().max(60, 'Keep meta titles under 60 characters.').optional(),
  metaDescription: z.string().max(160, 'Keep meta descriptions under 160 characters.').optional(),
  keywords: z.array(z.string()),
  ogImage: mediaRefSchema.nullish(),
  canonicalUrl: z.string().optional(),
})

const syllabusModuleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Module title is required.'),
  topics: z.array(z.string()),
  hours: z.number().min(0).optional(),
})

export const SECTION_TYPES = [
  { value: 'rich-text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'cta', label: 'Call to action' },
] as const

/**
 * The generated sections of the course page, in the order they render.
 *
 * `hideable` is false for the three that are structural — the hero carries the
 * title and the facts, and the CTA and enquiry form are how the page converts.
 * A block can still be anchored to them.
 */
export const PAGE_SECTIONS = [
  { id: 'hero', label: 'Hero', hideable: false },
  { id: 'overview', label: 'Overview & video', hideable: true },
  { id: 'who-can-do', label: 'Who can do this', hideable: true },
  { id: 'why-this-program', label: 'The case for it', hideable: true },
  { id: 'modules', label: 'Modules by duration', hideable: true },
  { id: 'what-you-will-learn', label: 'What you will learn', hideable: true },
  { id: 'tools', label: 'Tools', hideable: true },
  { id: 'outcomes', label: 'Future scope', hideable: true },
  { id: 'projects', label: 'Hands-on projects', hideable: true },
  { id: 'why-techcadd', label: 'Why techcadd', hideable: true },
  { id: 'reviews', label: 'Reviews', hideable: true },
  { id: 'faqs', label: 'FAQs', hideable: true },
  { id: 'cta', label: 'Call to action', hideable: false },
  { id: 'enquiry', label: 'Enquiry form', hideable: false },
] as const

const SECTION_ANCHORS = PAGE_SECTIONS.map((s) => s.id)

/**
 * A link an editor typed. Mirrors the server rule in sections.schema.ts.
 *
 * Internal links start with '/', external ones must be http(s). That rules out
 * `javascript:` and `data:`, which would otherwise go straight into an href.
 */
const linkUrl = z
  .string()
  .max(500, 'That link is too long to store.')
  .refine(
    (value) => value === '' || value.startsWith('/') || /^https?:\/\//i.test(value),
    'Enter a path beginning with "/" for a page on this site, or a full https:// address.',
  )

export const courseSectionSchema = z
  .object({
    id: z.string().optional(),
    type: z.enum(['rich-text', 'image', 'video', 'cta']),
    title: z.string().max(200).optional(),
    body: z.string().optional(),
    media: mediaRefSchema.nullish(),
    linkUrl: linkUrl.optional(),
    linkLabel: z.string().max(120).optional(),
    linkTarget: z.enum(['same', 'new']),
    anchor: z.enum(SECTION_ANCHORS as unknown as [string, ...string[]]),
    placement: z.enum(['before', 'after']),
    visible: z.boolean(),
  })
  .superRefine((section, ctx) => {
    // Each kind has one thing it cannot render without. Caught here so the
    // editor is told which box to fill rather than publishing an empty strip.
    const required: Record<string, [string, string]> = {
      'rich-text': ['body', 'Add some text for this block.'],
      image: ['media', 'Choose an image for this block.'],
      video: ['linkUrl', 'Paste the video URL.'],
      cta: ['linkUrl', 'A call to action needs a link.'],
    }

    const [field, message] = required[section.type]!
    if (!(section as Record<string, unknown>)[field]) {
      ctx.addIssue({ code: 'custom', path: [field], message })
    }

    if (section.type === 'cta' && !section.linkLabel) {
      ctx.addIssue({
        code: 'custom',
        path: ['linkLabel'],
        message: 'A call to action needs button text.',
      })
    }
  })

export type CourseSectionValues = z.infer<typeof courseSectionSchema>

export const courseSchema = z
  .object({
    title: z.string().min(1, 'Title is required.').max(120, 'Keep titles under 120 characters.'),
    slug: z
      .string()
      .min(1, 'Slug is required.')
      .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
    categoryId: z.string().optional(),
    segment: z.enum(['courses', 'internship-training', 'after-12th-courses']),
    tagline: z.string().max(300).optional(),
    demand: z.string().optional(),
    careers: z.array(z.string()),
    tools: z.array(z.string()),
    salary: z.string().max(120).optional(),
    shortDescription: z
      .string()
      .min(1, 'A short description is required.')
      .max(200, 'Keep this under 200 characters.'),
    description: z.string(),
    duration: z.string().min(1, 'Duration is required.'),
    fee: z.number('Fee is required.').min(0, 'Fee cannot be negative.'),
    discountedFee: z.number().min(0, 'Discounted fee cannot be negative.').optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    mode: z.enum(['online', 'offline', 'hybrid']),
    thumbnail: mediaRefSchema.nullish(),
    gallery: z.array(mediaRefSchema),
    syllabus: z.array(syllabusModuleSchema),
    highlights: z.array(z.string()),
    eligibility: z.string().optional(),
    certification: z.string().optional(),
    branchIds: z.array(z.string()),
    /** Overrides the generated overview. One paragraph per line. */
    overview: z.string().optional(),
    videoUrl: z.string().max(500).optional(),
    videoTitle: z.string().max(200).optional(),
    hiddenSections: z.array(z.string()),
    sections: z.array(courseSectionSchema),
    featured: z.boolean(),
    seo: seoSchema,
    status: z.enum(['published', 'draft', 'review']),
  })
  .superRefine((values, ctx) => {
    // A "discount" above the real price would display as a price increase.
    if (values.discountedFee !== undefined && values.discountedFee > values.fee) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountedFee'],
        message: 'The discounted fee must be lower than the full fee.',
      })
    }
  })

export type CourseFormValues = z.infer<typeof courseSchema>

export function emptyCourse(): CourseFormValues {
  return {
    title: '',
    slug: '',
    categoryId: undefined,
    segment: 'courses',
    tagline: '',
    demand: '',
    careers: [],
    tools: [],
    salary: '',
    shortDescription: '',
    description: '',
    duration: '',
    fee: 0,
    discountedFee: undefined,
    level: 'beginner',
    mode: 'offline',
    thumbnail: undefined,
    gallery: [],
    syllabus: [],
    highlights: [],
    eligibility: '',
    certification: '',
    branchIds: [],
    overview: '',
    videoUrl: '',
    videoTitle: '',
    hiddenSections: [],
    sections: [],
    featured: false,
    seo: { keywords: [] },
    status: 'draft',
  }
}

export const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const MODE_OPTIONS = [
  { value: 'offline', label: 'Offline' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
]
