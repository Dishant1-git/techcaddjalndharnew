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
 * A profile address, or nothing.
 *
 * Full URLs only. A handle on its own — "techcadd" — was accepted here and
 * rendered as href="techcadd" in the footer, which resolves against whatever
 * page the visitor is on and 404s. Empty clears the link, which is how an icon
 * is removed from the footer.
 */
const profileUrl = z
  .union([
    z.string().regex(/^https?:\/\//i, 'Enter the full address, starting with https://'),
    z.literal(''),
  ])
  .optional()

const social = z.object({
  linkedin: profileUrl,
  x: profileUrl,
  github: profileUrl,
  website: profileUrl,
  facebook: profileUrl,
  instagram: profileUrl,
  youtube: profileUrl,
})

const notifications = z.object({
  newEnquiryEmail: z.boolean(),
  dailyEnquiryDigest: z.boolean(),
  contentPublished: z.boolean(),
})

const integrations = z.object({
  whatsappNumber: z.string().optional(),
  analyticsId: z.string().optional(),
  recaptchaSecret: z.string().optional(),
})

/**
 * A headline figure, e.g. "15+" / "Years of Excellence".
 *
 * The value is a string, not a number: the site prints "15k+" and "98%", and
 * the suffix carries as much meaning as the digits.
 */
const stat = z.object({
  value: z.string().min(1, 'Enter a figure.').max(20, 'Keep figures short — they render large.'),
  label: z.string().min(1, 'Enter a label.').max(60, 'Keep labels under 60 characters.'),
})

/**
 * Everything is optional: this is a settings page where each card saves on its
 * own, so a request carries only the section that changed.
 *
 * `profile` is deliberately absent — it belongs to the signed-in user and is
 * filled in from the session, not stored here.
 */
export const settingsPatchSchema = z.object({
  siteName: z.string().min(1, 'A site name is required.').max(120).optional(),
  tagline: z.string().max(255).optional(),
  logo: mediaRef.nullish(),
  favicon: mediaRef.nullish(),
  contactEmail: z.union([z.email('Enter a valid email address.'), z.literal('')]).optional(),
  contactPhone: z.string().max(30).optional(),
  address: z.string().optional(),
  // A list, so it is replaced wholesale rather than merged — otherwise a
  // deleted row would come back on the next save.
  stats: z.array(stat).max(8, 'Eight figures is already more than the row can show.').optional(),
  social: social.partial().optional(),
  robotsTxt: z.string().max(10_000, 'That robots.txt is unusually long.').optional(),
  notifications: notifications.partial().optional(),
  integrations: integrations.partial().optional(),
})

export type SettingsPatch = z.infer<typeof settingsPatchSchema>
