import { z } from 'zod'

/** An empty string is kept — see the note in blogs.schema.ts. */
const optionalId = z.string().optional()

/**
 * A note on the timeline.
 *
 * `id` and `createdAt` are optional on the way in: the drawer generates both
 * for a note the user has just typed, but the server fills either gap so an
 * API caller can post `{ author, body }` alone.
 */
const enquiryNote = z.object({
  id: z.string().optional(),
  author: z.string().min(1, 'A note needs an author.'),
  body: z.string().min(1, 'A note cannot be empty.'),
  createdAt: z.string().optional(),
})

const base = z.object({
  studentName: z.string().min(1, 'Student name is required.').max(120),
  // Deliberately loose: enquiries arrive by phone and walk-in, and a rejected
  // number is worse than an oddly formatted one.
  phone: z.string().min(6, 'Enter a contact number.').max(30),
  email: z.union([z.email('Enter a valid email address.'), z.literal('')]).optional(),
  courseId: optionalId,
  courseName: z.string().max(200),
  source: z.enum(['website', 'walk-in', 'phone', 'referral', 'social']),
  /** Where this specific submission came from — see migration 011. */
  formType: z.string().max(32).optional(),
  sourceUrl: z.string().max(500).optional(),
  ip: z.string().max(45).optional(),
  userAgent: z.string().max(255).optional(),
  message: z.string().optional(),
  status: z.enum(['new', 'contacted', 'follow-up', 'converted', 'closed']),
  assigneeId: optionalId,
  followUpDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.'), z.literal('')])
    .optional(),
  notes: z.array(enquiryNote),
})

export const enquirySchema = base.extend({
  courseName: z.string().max(200).default(''),
  source: z.enum(['website', 'walk-in', 'phone', 'referral', 'social']).default('website'),
  status: z.enum(['new', 'contacted', 'follow-up', 'converted', 'closed']).default('new'),
  notes: z.array(enquiryNote).default([]),
})

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const enquiryPatchSchema = base.partial()

/** Bulk actions from the list: reassign, restatus or set a follow-up date. */
export const enquiryBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Select at least one enquiry.'),
  status: z.enum(['new', 'contacted', 'follow-up', 'converted', 'closed']).optional(),
  assigneeId: optionalId,
  followUpDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.'), z.literal('')])
    .optional(),
})

export type EnquiryInput = z.infer<typeof enquirySchema>
export type EnquiryPatch = z.infer<typeof enquiryPatchSchema>
export type EnquiryBulk = z.infer<typeof enquiryBulkSchema>
export type EnquiryNoteInput = z.infer<typeof enquiryNote>
