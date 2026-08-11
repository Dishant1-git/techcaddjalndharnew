import { z } from 'zod'

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

/** A date the editor can also clear, which arrives as ''. */
const optionalDate = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.'), z.literal('')])
  .optional()

/** Mirrors `frontend/src/features/banners/bannerSchema.ts`. */
const base = z.object({
  title: z.string().min(1, 'Title is required.').max(80, 'Keep titles under 80 characters.'),
  desktopImage: mediaRef.nullish(),
  mobileImage: mediaRef.nullish(),
  altText: z.string().min(1, 'Alt text is required for accessibility.'),
  linkUrl: z.string().optional(),
  ctaText: z.string().optional(),
  placement: z.enum(['home-hero', 'course-page', 'sidebar', 'popup']),
  order: z.number(),
  startsAt: optionalDate,
  endsAt: optionalDate,
  status: z.enum(['published', 'draft', 'review']),
})

interface CrossFields {
  startsAt?: string
  endsAt?: string
  linkUrl?: string
  ctaText?: string
}

/**
 * The two cross-field rules from the form.
 *
 * A patch carries only the keys the caller sent, so a rule can only fire when
 * it can actually see both of its inputs. On a patch that sets `ctaText`
 * alone, the link may already be on the stored record — rejecting it would
 * make a valid edit impossible, so the rule waits until `linkUrl` is in the
 * payload too.
 */
function crossFieldRules(partial: boolean) {
  return (values: CrossFields, ctx: z.RefinementCtx): void => {
    if (values.startsAt && values.endsAt && values.endsAt < values.startsAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'The end date must fall after the start date.',
      })
    }

    // A CTA with nowhere to go is a dead control on the live site.
    const linkIsKnown = !partial || 'linkUrl' in values
    if (values.ctaText && linkIsKnown && !values.linkUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['linkUrl'],
        message: 'A link is required when the banner has CTA text.',
      })
    }
  }
}

export const bannerSchema = base
  .extend({
    placement: z.enum(['home-hero', 'course-page', 'sidebar', 'popup']).default('home-hero'),
    order: z.number().default(0),
    status: z.enum(['published', 'draft', 'review']).default('draft'),
  })
  .superRefine(crossFieldRules(false))

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const bannerPatchSchema = base.partial().superRefine(crossFieldRules(true))

export type BannerInput = z.infer<typeof bannerSchema>
export type BannerPatch = z.infer<typeof bannerPatchSchema>
