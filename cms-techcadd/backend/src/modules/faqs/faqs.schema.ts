import { z } from 'zod'

/** Mirrors `frontend/src/features/faqs/faqSchema.ts`. */
const base = z.object({
  question: z.string().min(1, 'A question is required.').max(300),
  answer: z.string().min(1, 'An answer is required.'),
  category: z.string().min(1, 'Choose a category.').max(80),
  order: z.number(),
  featured: z.boolean(),
  status: z.enum(['published', 'draft', 'review']),
})

export const faqSchema = base.extend({
  category: z.string().min(1).max(80).default('General'),
  order: z.number().default(0),
  featured: z.boolean().default(false),
  status: z.enum(['published', 'draft', 'review']).default('draft'),
})

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const faqPatchSchema = base.partial()

export type FaqInput = z.infer<typeof faqSchema>
export type FaqPatch = z.infer<typeof faqPatchSchema>
