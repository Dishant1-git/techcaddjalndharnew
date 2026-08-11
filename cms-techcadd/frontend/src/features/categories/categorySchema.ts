import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(60, 'Keep names under 60 characters.'),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
  parentId: z.string().optional(),
  icon: z.string().optional(),
  accentColor: z.string().optional(),
  description: z.string().optional(),
  order: z.number(),
  status: z.enum(['published', 'draft', 'review']),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export function emptyCategory(order = 0): CategoryFormValues {
  return {
    name: '',
    slug: '',
    parentId: undefined,
    icon: 'Folder',
    accentColor: '#5f6fff',
    description: '',
    order,
    status: 'published',
  }
}

/** A curated subset of lucide icons, so the picker stays a short list. */
export const ICON_OPTIONS = [
  { value: 'Folder', label: 'Folder' },
  { value: 'BookOpen', label: 'Book' },
  { value: 'Code', label: 'Code' },
  { value: 'PenTool', label: 'Design' },
  { value: 'Megaphone', label: 'Marketing' },
  { value: 'Cpu', label: 'Hardware' },
  { value: 'Database', label: 'Data' },
  { value: 'ShieldCheck', label: 'Security' },
  { value: 'Camera', label: 'Media' },
  { value: 'Briefcase', label: 'Business' },
]
