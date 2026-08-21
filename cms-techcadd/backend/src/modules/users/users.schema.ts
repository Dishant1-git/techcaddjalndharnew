import { z } from 'zod'

/** Optional image slots accept null — see the note in blogs.schema.ts. */
const mediaRef = z.object({
  id: z.string().min(1),
  url: z.string().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

/**
 * Who can do what.
 *
 * `editor` is the content role: everything an author needs to publish, and
 * nothing that changes how the site runs or who can sign in.
 */
export const ROLES = ['admin', 'editor'] as const

/**
 * Long rather than complex.
 *
 * Length beats character-class rules for real-world strength, and a rule that
 * forces a symbol mostly produces `Password1!`.
 */
const password = z
  .string()
  .min(10, 'Use at least 10 characters.')
  .max(200, 'That password is too long.')

const base = z.object({
  name: z.string().min(1, 'Name is required.').max(120),
  email: z.email('Enter a valid email address.').max(190),
  role: z.enum(ROLES),
  avatar: mediaRef.nullish(),
  active: z.boolean(),
})

export const userSchema = base.extend({
  // Editor by default: the common case is adding someone who writes content,
  // and the safer of the two is the right thing to fall back to.
  role: z.enum(ROLES).default('editor'),
  active: z.boolean().default(true),
  /**
   * Optional: the CMS form does not collect one.
   *
   * When it is absent the API generates a temporary password and returns it
   * once, so an admin can hand it over. Once a mailer exists this should
   * become an invitation link instead.
   */
  password: password.optional(),
})

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const userPatchSchema = base.partial().extend({
  password: password.optional(),
})

export type UserInput = z.infer<typeof userSchema>
export type UserPatch = z.infer<typeof userPatchSchema>
