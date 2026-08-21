import { z } from 'zod'

/** An empty string is kept — see the note in blogs.schema.ts. */
const optionalId = z.string().optional()

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

/** Mirrors `frontend/src/features/testimonials/testimonialSchema.ts`. */
const base = z.object({
  studentName: z.string().min(1, 'Student name is required.').max(80),
  photo: mediaRef.nullish(),
  courseId: optionalId,
  batch: z.string().optional(),
  rating: z
    .number('Choose a rating.')
    .int('Ratings are whole stars.')
    .min(1, 'Choose a rating.')
    .max(5, 'Ratings run from 1 to 5.'),
  quote: z
    .string()
    .min(1, 'The testimonial text is required.')
    .max(500, 'Keep testimonials under 500 characters.'),
  videoUrl: z.string().optional(),
  featured: z.boolean(),
  status: z.enum(['published', 'draft', 'review']),
})

export const testimonialSchema = base.extend({
  rating: z
    .number('Choose a rating.')
    .int('Ratings are whole stars.')
    .min(1, 'Choose a rating.')
    .max(5, 'Ratings run from 1 to 5.')
    .default(5),
  featured: z.boolean().default(false),
  status: z.enum(['published', 'draft', 'review']).default('draft'),
})

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const testimonialPatchSchema = base.partial()

export type TestimonialInput = z.infer<typeof testimonialSchema>
export type TestimonialPatch = z.infer<typeof testimonialPatchSchema>
