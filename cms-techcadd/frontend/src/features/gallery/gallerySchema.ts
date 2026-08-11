import { z } from 'zod'

const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const galleryImageSchema = z.object({
  id: z.string(),
  media: mediaRefSchema,
  caption: z.string().optional(),
  order: z.number(),
})

export const albumSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(80),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
  cover: mediaRefSchema.nullish(),
  eventDate: z.string().optional(),
  description: z.string().optional(),
  images: z.array(galleryImageSchema),
  status: z.enum(['published', 'draft', 'review']),
})

export type AlbumFormValues = z.infer<typeof albumSchema>

export function emptyAlbum(): AlbumFormValues {
  return {
    title: '',
    slug: '',
    cover: undefined,
    eventDate: undefined,
    description: '',
    images: [],
    status: 'draft',
  }
}
