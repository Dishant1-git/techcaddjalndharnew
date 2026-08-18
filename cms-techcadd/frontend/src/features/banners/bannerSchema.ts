import { z } from 'zod'

import type { Banner } from '../../types'

const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const bannerSchema = z
  .object({
    title: z.string().min(1, 'Title is required.').max(80, 'Keep titles under 80 characters.'),
    desktopImage: mediaRefSchema.nullish(),
    mobileImage: mediaRefSchema.nullish(),
    altText: z.string().min(1, 'Alt text is required for accessibility.'),
    linkUrl: z.string().optional(),
    ctaText: z.string().optional(),
    placement: z.enum(['home-hero', 'course-page', 'sidebar', 'popup']),
    order: z.number(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    status: z.enum(['published', 'draft', 'review']),
  })
  .superRefine((values, ctx) => {
    // A banner is artwork. Without either image the website has nothing to
    // render, so it saves happily and then never appears — the failure mode
    // that looks exactly like the save not having worked.
    if (!values.desktopImage && !values.mobileImage) {
      ctx.addIssue({
        code: 'custom',
        path: ['desktopImage'],
        message: 'Add an image — a banner with no artwork cannot be shown.',
      })
    }
    if (values.startsAt && values.endsAt && values.endsAt < values.startsAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'The end date must fall after the start date.',
      })
    }
    // A CTA with nowhere to go is a dead control on the live site.
    if (values.ctaText && !values.linkUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['linkUrl'],
        message: 'A link is required when the banner has CTA text.',
      })
    }
  })

export type BannerFormValues = z.infer<typeof bannerSchema>

export function emptyBanner(order = 0): BannerFormValues {
  return {
    title: '',
    desktopImage: undefined,
    mobileImage: undefined,
    altText: '',
    linkUrl: '',
    ctaText: '',
    placement: 'home-hero',
    order,
    startsAt: undefined,
    endsAt: undefined,
    status: 'draft',
  }
}

/**
 * Where a banner can be placed, and whether the website renders it yet.
 *
 * Only the homepage slot is built. Offering the others without saying so lets
 * an editor publish a banner that is correct in every visible respect and still
 * appears nowhere, with nothing to explain why.
 */
export const PLACEMENT_OPTIONS = [
  { value: 'home-hero', label: 'Home hero — shown on the website' },
  { value: 'course-page', label: 'Course page — not built yet' },
  { value: 'sidebar', label: 'Sidebar — not built yet' },
  { value: 'popup', label: 'Popup — not built yet' },
]

/** Placements the website actually renders today. */
export const LIVE_PLACEMENTS = new Set(['home-hero'])

export type ScheduleState = 'live' | 'scheduled' | 'expired' | 'inactive'

/**
 * What the public site would actually do with this banner right now —
 * "Published" alone is misleading once a schedule window is set.
 */
export function scheduleStateOf(banner: Banner, now = new Date()): ScheduleState {
  if (banner.status !== 'published') return 'inactive'

  const today = now.toISOString().slice(0, 10)
  if (banner.startsAt && today < banner.startsAt) return 'scheduled'
  if (banner.endsAt && today > banner.endsAt) return 'expired'
  return 'live'
}

export const SCHEDULE_META: Record<ScheduleState, { label: string; tone: 'success' | 'info' | 'neutral' | 'warning' }> =
  {
    live: { label: 'Live', tone: 'success' },
    scheduled: { label: 'Scheduled', tone: 'info' },
    expired: { label: 'Expired', tone: 'warning' },
    inactive: { label: 'Not published', tone: 'neutral' },
  }
