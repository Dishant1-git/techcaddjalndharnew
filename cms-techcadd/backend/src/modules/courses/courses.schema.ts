import { z } from 'zod'

/**
 * Mirrors `frontend/src/features/courses/courseSchema.ts`.
 *
 * Client-side validation is a convenience; this is the guarantee. Anyone can
 * POST straight to the API, so every rule the form enforces has to exist here
 * too — and the messages are kept identical so the CMS shows the same text
 * whichever side rejects it.
 */
/**
 * Optional image slots accept null as well as being absent.
 *
 * An image is an object, so '' cannot carry "cleared" the way it does for a
 * scalar id. Absent still means "leave it alone"; null means "remove it".
 * Without this the remove button on the form has no way to reach the server.
 */
const mediaRef = z.object({
  id: z.string().min(1),
  url: z.string().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const syllabusModule = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Module title is required.'),
  topics: z.array(z.string()).default([]),
  hours: z.number().min(0).optional(),
})

const seo = z.object({
  metaTitle: z.string().max(60, 'Keep meta titles under 60 characters.').optional(),
  metaDescription: z.string().max(160, 'Keep meta descriptions under 160 characters.').optional(),
  keywords: z.array(z.string()).default([]),
  ogImage: mediaRef.nullish(),
  canonicalUrl: z.string().optional(),
})

/**
 * An optional reference to another record.
 *
 * An empty string is kept, not turned into undefined: undefined disappears from
 * the JSON body, so the server could not tell "leave it alone" from "clear it"
 * and an assigned relation could never be unset. The repositories convert '' to
 * NULL on write.
 */
const optionalId = z.string().optional()

export const courseSchema = z
  .object({
    title: z.string().min(1, 'Title is required.').max(120, 'Keep titles under 120 characters.'),
    slug: z
      .string()
      .min(1, 'Slug is required.')
      .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
    categoryId: optionalId,
    shortDescription: z
      .string()
      .min(1, 'A short description is required.')
      .max(200, 'Keep this under 200 characters.'),
    description: z.string().default(''),
    duration: z.string().min(1, 'Duration is required.'),
    fee: z.number('Fee is required.').min(0, 'Fee cannot be negative.'),
    discountedFee: z.number().min(0, 'Discounted fee cannot be negative.').optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    mode: z.enum(['online', 'offline', 'hybrid']),
    thumbnail: mediaRef.nullish(),
    gallery: z.array(mediaRef).default([]),
    syllabus: z.array(syllabusModule).default([]),
    highlights: z.array(z.string()).default([]),
    eligibility: z.string().optional(),
    certification: z.string().optional(),
    branchIds: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    seo: seo.default({ keywords: [] }),
    status: z.enum(['published', 'draft', 'review']).default('draft'),
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

export type CourseInput = z.infer<typeof courseSchema>
