import { z } from 'zod'

/**
 * A CMS account.
 *
 * Mirrors `backend/src/modules/users/users.schema.ts`. The password rule is
 * length-based rather than character-class-based for the reason given there:
 * a rule that forces a symbol mostly produces `Password1!`.
 */
export const teamSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(120),
  email: z.email('Enter a valid email address.').max(190),
  role: z.enum(['admin', 'editor']),
  active: z.boolean(),
  /**
   * Blank on create means "let the server generate one".
   *
   * It returns the temporary password once, in the create response, so it can
   * be handed over. Blank on edit means "leave the current password alone" —
   * this form never displays an existing one because it never has one.
   */
  password: z
    .union([z.string().min(10, 'Use at least 10 characters.').max(200), z.literal('')])
    .optional(),
})

export type TeamFormValues = z.infer<typeof teamSchema>

export function emptyTeamMember(): TeamFormValues {
  return {
    name: '',
    email: '',
    // The common case is adding someone who writes content, and the narrower
    // of the two roles is the right thing to default to.
    role: 'editor',
    active: true,
    password: '',
  }
}

export const ROLE_OPTIONS = [
  { value: 'editor', label: 'Editor — content only' },
  { value: 'admin', label: 'Admin — content, settings and accounts' },
]

/** What each role may actually do, shown beside the choice. */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  editor:
    'Courses, pages, blogs, banners, gallery, FAQs, reviews, categories, testimonials and media.',
  admin:
    'Everything an editor can do, plus site settings, redirects, enquiries and other people’s accounts.',
}
