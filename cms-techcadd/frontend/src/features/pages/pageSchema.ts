import { z } from 'zod'

import { pageSectionSchema } from '../shared/contentBlockSchema'

const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const seoBlockSchema = z.object({
  metaTitle: z.string().max(60, 'Keep meta titles under 60 characters.').optional(),
  metaDescription: z.string().max(160, 'Keep meta descriptions under 160 characters.').optional(),
  keywords: z.array(z.string()),
  ogImage: mediaRefSchema.nullish(),
  canonicalUrl: z.string().optional(),
})

export const pageSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(120, 'Keep titles under 120 characters.'),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
  template: z.string().min(1, 'Choose a template.'),
  /** Where the website links to this page. 'none' means nowhere. */
  navPlacement: z.enum(['none', 'header', 'footer']),
  navLabel: z.string().max(80, 'Keep menu labels short.').optional(),
  navOrder: z.number().int(),
  content: z.string(),
  publishDate: z.string().optional(),
  seo: seoBlockSchema,
  status: z.enum(['published', 'draft', 'review']),
  system: z.boolean(),
  /** Blocks the editor arranged, in the order they render. */
  sections: z.array(pageSectionSchema),
})

export type PageFormValues = z.infer<typeof pageSchema>

export function emptyPage(): PageFormValues {
  return {
    title: '',
    slug: '',
    template: 'default',
    // Not advertised until somebody decides it should be.
    navPlacement: 'none',
    navLabel: '',
    navOrder: 0,
    content: '',
    publishDate: undefined,
    seo: { keywords: [] },
    status: 'draft',
    system: false,
    sections: [],
  }
}

/**
 * Where a page is linked from.
 *
 * "Nowhere" is the honest default and it is spelled out rather than left
 * blank: a published page with no menu entry is reachable only by typing its
 * address, and an editor should be told that rather than discovering it.
 */
export const NAV_PLACEMENT_OPTIONS = [
  { value: 'none', label: 'Nowhere — reachable only by its link' },
  { value: 'header', label: 'Main menu' },
  { value: 'footer', label: 'Footer, under Support' },
]

export const TEMPLATE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'landing', label: 'Landing page' },
  { value: 'contact', label: 'Contact' },
  { value: 'full-width', label: 'Full width' },
]
