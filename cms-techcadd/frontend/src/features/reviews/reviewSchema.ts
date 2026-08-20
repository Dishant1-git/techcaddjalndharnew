import { z } from 'zod'

import { GOOGLE_URL_MESSAGE, isGoogleUrl } from '../../lib/googleUrl'

export const reviewSchema = z
  .object({
    authorName: z.string().min(1, 'A name is required.').max(120),
    rating: z
      .number('Choose a rating.')
      .int('Ratings are whole stars.')
      .min(1, 'Choose a rating.')
      .max(5, 'Ratings run from 1 to 5.'),
    quote: z.string().min(1, 'The review text is required.'),
    reviewedOn: z.string().max(40).optional(),
    courseName: z.string().max(200).optional(),
    source: z.enum(['google', 'website', 'walk-in']),
    googleUrl: z
      .string()
      .max(500, 'That link is too long to store.')
      .refine((value) => value === '' || isGoogleUrl(value), GOOGLE_URL_MESSAGE)
      .optional(),
    order: z.number(),
    status: z.enum(['published', 'draft', 'review']),
  })
  .superRefine((values, ctx) => {
    // The button this produces reads "Read on Google" beside the Google mark,
    // so it may only appear on a review that was actually left there.
    if (values.googleUrl && values.source !== 'google') {
      ctx.addIssue({
        code: 'custom',
        path: ['googleUrl'],
        message: 'Only a review with source "Google" can carry a Google link.',
      })
    }
  })

export type ReviewFormValues = z.infer<typeof reviewSchema>

export function emptyReview(): ReviewFormValues {
  return {
    authorName: '',
    rating: 5,
    quote: '',
    reviewedOn: '',
    courseName: '',
    source: 'google',
    googleUrl: '',
    order: 0,
    status: 'draft',
  }
}

export const SOURCE_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'website', label: 'Website' },
  { value: 'walk-in', label: 'Walk-in' },
]
