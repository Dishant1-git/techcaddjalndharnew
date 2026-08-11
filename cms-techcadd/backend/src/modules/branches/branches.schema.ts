import { z } from 'zod'

/**
 * An optional reference to another record.
 *
 * An empty string is kept, not turned into undefined: undefined disappears from
 * the JSON body, so the server could not tell "leave it alone" from "clear it"
 * and an assigned relation could never be unset. The repositories convert '' to
 * NULL on write.
 */
const optionalId = z.string().optional()

const mediaRef = z.object({
  id: z.string().min(1),
  url: z.string().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const hours = z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.boolean(),
})

/** Mirrors `frontend/src/features/branches/branchSchema.ts`. */
const base = z.object({
  name: z.string().min(1, 'Name is required.').max(80),
  code: z
    .string()
    .min(1, 'A short code is required.')
    .regex(/^[A-Z0-9-]+$/, 'Use uppercase letters, numbers and hyphens only.'),
  addressLine1: z.string().min(1, 'Address is required.'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required.'),
  state: z.string().min(1, 'State is required.'),
  // Indian PIN codes are six digits and never start with zero.
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code.'),
  phones: z
    .array(z.string().regex(/^[0-9+\-\s()]{7,18}$/, 'Enter a valid phone number.'))
    .min(1, 'Add at least one phone number.'),
  email: z.union([z.email('Enter a valid email address.'), z.literal('')]).optional(),
  mapEmbedUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  hours: z.array(hours),
  photos: z.array(mediaRef),
  managerId: optionalId,
  status: z.enum(['published', 'draft', 'review']),
})

export const branchSchema = base.extend({
  hours: z.array(hours).default([]),
  photos: z.array(mediaRef).default([]),
  status: z.enum(['published', 'draft', 'review']).default('draft'),
})

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const branchPatchSchema = base.partial()

export type BranchInput = z.infer<typeof branchSchema>
export type BranchPatch = z.infer<typeof branchPatchSchema>
