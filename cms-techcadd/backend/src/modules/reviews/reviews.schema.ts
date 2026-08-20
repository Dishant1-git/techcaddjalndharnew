import { z } from 'zod'

import { GOOGLE_URL_MESSAGE, isGoogleUrl } from './googleUrl.js'

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
  /**
   * Where this exact review can be read on Google.
   *
   * Empty string means "clear it", which is how every other nullable text
   * field on this record behaves; anything else has to survive isGoogleUrl.
   */
  googleUrl: z
    .string()
    .max(500, 'That link is too long to store.')
    .refine((value) => value === '' || isGoogleUrl(value), GOOGLE_URL_MESSAGE)
    .optional(),
  order: z.number(),
  status: z.enum(['published', 'draft', 'review']),
})

/**
 * A Google link on a review that was not left on Google.
 *
 * The button it produces says "Read on Google" beside the Google mark, so
 * pointing it at a place page from a walk-in review would misrepresent where
 * the words came from. Refused rather than silently dropped: the editor pasted
 * something deliberately and needs to know it will not be used.
 */
const refuseMismatchedLink = (
  values: { source?: string; googleUrl?: string },
  ctx: z.RefinementCtx,
) => {
  if (values.googleUrl && values.source && values.source !== 'google') {
    ctx.addIssue({
      code: 'custom',
      path: ['googleUrl'],
      message: 'Only a review with source "Google" can carry a Google link.',
    })
  }
}

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
}).superRefine(refuseMismatchedLink)

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const reviewPatchSchema = base.partial().superRefine(refuseMismatchedLink)

export type ReviewInput = z.infer<typeof reviewSchema>
export type ReviewPatch = z.infer<typeof reviewPatchSchema>
