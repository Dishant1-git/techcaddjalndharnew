import { z } from 'zod'

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
  content: z.string(),
  publishDate: z.string().optional(),
  seo: seoBlockSchema,
  status: z.enum(['published', 'draft', 'review']),
  system: z.boolean(),
})

export type PageFormValues = z.infer<typeof pageSchema>

export function emptyPage(): PageFormValues {
  return {
    title: '',
    slug: '',
    template: 'default',
    content: '',
    publishDate: undefined,
    seo: { keywords: [] },
    status: 'draft',
    system: false,
  }
}

export const TEMPLATE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'landing', label: 'Landing page' },
  { value: 'contact', label: 'Contact' },
  { value: 'full-width', label: 'Full width' },
]
