import { z } from 'zod'

export const REVIEW_SOURCES = ['google', 'website', 'walk-in'] as const

/** Mirrors `frontend/src/features/reviews/reviewSchema.ts`. */
const base = z.object({
  authorName: z.string().min(1, 'A name is required.').max(120),
  rating: z
    .number('Choose a rating.')
    .int('Ratings are whole stars.')
    .min(1, 'Choose a rating.')
    .max(5, 'Ratings run from 1 to 5.'),
  quote: z.string().min(1, 'The review text is required.'),
  /** Month precision, as displayed — "March 2026". */
  reviewedOn: z.string().max(40).optional(),
  courseName: z.string().max(200).optional(),
  source: z.enum(REVIEW_SOURCES),
  order: z.number(),
  status: z.enum(['published', 'draft', 'review']),
})

export const reviewSchema = base.extend({
  rating: z
    .number('Choose a rating.')
    .int('Ratings are whole stars.')
    .min(1, 'Choose a rating.')
    .max(5, 'Ratings run from 1 to 5.')
    .default(5),
  source: z.enum(REVIEW_SOURCES).default('google'),
  order: z.number().default(0),
  status: z.enum(['published', 'draft', 'review']).default('draft'),
})

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const reviewPatchSchema = base.partial()

export type ReviewInput = z.infer<typeof reviewSchema>
export type ReviewPatch = z.infer<typeof reviewPatchSchema>
