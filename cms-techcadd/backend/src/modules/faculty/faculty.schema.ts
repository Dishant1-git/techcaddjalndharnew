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

const social = z.object({
  linkedin: z.string().optional(),
  x: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
})

/** Mirrors `frontend/src/features/faculty/facultySchema.ts`. */
const base = z.object({
  name: z.string().min(1, 'Name is required.').max(80, 'Keep names under 80 characters.'),
  photo: mediaRef.nullish(),
  designation: z.string().min(1, 'Designation is required.'),
  qualifications: z.string(),
  expertise: z.array(z.string()),
  experienceYears: z
    .number('Years of experience is required.')
    .min(0, 'Experience cannot be negative.')
    .max(60, 'That looks too high — check the value.'),
  bio: z.string(),
  branchId: optionalId,
  email: z.union([z.email('Enter a valid email address.'), z.literal('')]).optional(),
  social,
  order: z.number(),
  status: z.enum(['published', 'draft', 'review']),
})

export const facultySchema = base.extend({
  qualifications: z.string().default(''),
  expertise: z.array(z.string()).default([]),
  bio: z.string().default(''),
  social: social.default({}),
  order: z.number().default(0),
  status: z.enum(['published', 'draft', 'review']).default('draft'),
})

/** Defaults stay off the patch schema, so drag-reorder cannot rewrite status. */
export const facultyPatchSchema = base.partial()

export type FacultyInput = z.infer<typeof facultySchema>
export type FacultyPatch = z.infer<typeof facultyPatchSchema>
