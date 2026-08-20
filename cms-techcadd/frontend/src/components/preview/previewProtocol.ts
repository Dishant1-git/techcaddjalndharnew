/**
 * The CMS half of the contract in the website's
 * components/preview/preview-protocol.ts. The two files must agree; they are
 * separate only because the apps do not share a module graph.
 */

export const PREVIEW_READY = 'techcadd:preview-ready'
export const PREVIEW_DRAFT = 'techcadd:preview-draft'
export const PREVIEW_SCROLL = 'techcadd:preview-scroll'

/** Sent back by the frame: things about the rendered page worth surfacing. */
export const PREVIEW_NOTICE = 'techcadd:preview-notice'

export type PreviewKind = 'course'

/** Where the public site is served from. Must match CMS_ADMIN_ORIGIN's peer. */
export const SITE_ORIGIN = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'http://localhost:3000'
).replace(/\/$/, '')

export const DEVICES = [
  { id: 'desktop', label: 'Desktop', width: null, icon: 'Monitor' },
  { id: 'tablet', label: 'Tablet', width: 834, icon: 'Tablet' },
  { id: 'mobile', label: 'Mobile', width: 390, icon: 'Smartphone' },
] as const

export type DeviceId = (typeof DEVICES)[number]['id']
