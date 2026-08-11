import { z } from 'zod'

const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const testimonialSchema = z.object({
  studentName: z.string().min(1, 'Student name is required.').max(80),
  photo: mediaRefSchema.nullish(),
  courseId: z.string().optional(),
  batch: z.string().optional(),
  rating: z.number().min(1, 'Choose a rating.').max(5),
  quote: z
    .string()
    .min(1, 'The testimonial text is required.')
    .max(500, 'Keep testimonials under 500 characters.'),
  videoUrl: z.string().optional(),
  featured: z.boolean(),
  status: z.enum(['published', 'draft', 'review']),
})

export type TestimonialFormValues = z.infer<typeof testimonialSchema>

export function emptyTestimonial(): TestimonialFormValues {
  return {
    studentName: '',
    photo: undefined,
    courseId: undefined,
    batch: '',
    rating: 5,
    quote: '',
    videoUrl: '',
    featured: false,
    status: 'published',
  }
}

export const RATING_OPTIONS = [
  { value: '5', label: '5 stars' },
  { value: '4', label: '4 stars' },
  { value: '3', label: '3 stars' },
  { value: '2', label: '2 stars' },
  { value: '1', label: '1 star' },
]
