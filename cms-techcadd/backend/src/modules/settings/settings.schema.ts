import { z } from 'zod'

/** Optional image slots accept null — see the note in faculty.schema.ts. */
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
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
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
  social: social.partial().optional(),
  robotsTxt: z.string().max(10_000, 'That robots.txt is unusually long.').optional(),
  notifications: notifications.partial().optional(),
  integrations: integrations.partial().optional(),
})

export type SettingsPatch = z.infer<typeof settingsPatchSchema>
