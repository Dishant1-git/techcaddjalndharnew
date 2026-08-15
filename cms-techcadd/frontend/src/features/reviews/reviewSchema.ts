import { z } from 'zod'

export const reviewSchema = z.object({
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
  order: z.number(),
  status: z.enum(['published', 'draft', 'review']),
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
    order: 0,
    status: 'draft',
  }
}

export const SOURCE_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'website', label: 'Website' },
  { value: 'walk-in', label: 'Walk-in' },
]
