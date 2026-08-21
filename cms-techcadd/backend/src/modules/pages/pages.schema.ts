import { z } from 'zod'

import { pageSectionSchema } from '../shared/contentBlock.schema.js'

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

const seo = z.object({
  metaTitle: z.string().max(60, 'Keep meta titles under 60 characters.').optional(),
  metaDescription: z.string().max(160, 'Keep meta descriptions under 160 characters.').optional(),
  keywords: z.array(z.string()),
  ogImage: mediaRef.nullish(),
  canonicalUrl: z.string().optional(),
})

/**
 * Mirrors `frontend/src/features/pages/pageSchema.ts`.
 *
 * Defaults stay off this base so `.partial()` produces a true patch — see the
 * note in categories.schema.ts.
 */
const base = z.object({
  title: z.string().min(1, 'Title is required.').max(120, 'Keep titles under 120 characters.'),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
  template: z.string().min(1, 'Choose a template.'),
  /** Where the website links to this page. 'none' means nowhere. */
  navPlacement: z.enum(['none', 'header', 'footer']),
  /** Shorter wording for the menu. Falls back to the title. */
  navLabel: z.string().max(80).optional(),
  navOrder: z.number().int(),
  content: z.string(),
  // The editor sends '' when the date is cleared, so accept it alongside a date.
  publishDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.'), z.literal('')])
    .optional(),
  seo,
  status: z.enum(['published', 'draft', 'review']),
  system: z.boolean(),
  /** Blocks the editor arranged, in the order they render. */
  sections: z.array(pageSectionSchema),
})

export const pageSchema = base.extend({
  template: z.string().min(1, 'Choose a template.').default('default'),
  navPlacement: z.enum(['none', 'header', 'footer']).default('none'),
  navOrder: z.number().int().default(0),
  content: z.string().default(''),
  seo: seo.default({ keywords: [] }),
  status: z.enum(['published', 'draft', 'review']).default('draft'),
  system: z.boolean().default(false),
  sections: z.array(pageSectionSchema).default([]),
})

export const pagePatchSchema = base.partial()

export type PageInput = z.infer<typeof pageSchema>
export type PagePatch = z.infer<typeof pagePatchSchema>
