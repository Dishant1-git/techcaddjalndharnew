import { z } from 'zod'

import { blockLinkUrl } from '../shared/contentBlock.schema.js'

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

/**
 * An entry in an album.
 *
 * `id` is optional on the way in: the form generates one for newly added
 * images, but an importer has no reason to. The server assigns one either way.
 */
const galleryImage = z.object({
  id: z.string().optional(),
  media: mediaRef,
  caption: z.string().optional(),
  /**
   * Where the photograph goes when clicked, if anywhere.
   *
   * The same rule content blocks use: a path on this site, or a full http(s)
   * address, and nothing else — which is what keeps `javascript:` out of an
   * href. Empty means the tile is not a link.
   */
  linkUrl: blockLinkUrl.optional(),
  order: z.number().default(0),
})

/** Mirrors `frontend/src/features/gallery/gallerySchema.ts`. */
const base = z.object({
  title: z.string().min(1, 'Title is required.').max(80),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
  cover: mediaRef.nullish(),
  eventDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.'), z.literal('')])
    .optional(),
  description: z.string().optional(),
  images: z.array(galleryImage),
  status: z.enum(['published', 'draft', 'review']),
})

export const albumSchema = base.extend({
  images: z.array(galleryImage).default([]),
  status: z.enum(['published', 'draft', 'review']).default('draft'),
})

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const albumPatchSchema = base.partial()

export type AlbumInput = z.infer<typeof albumSchema>
export type AlbumPatch = z.infer<typeof albumPatchSchema>
export type GalleryImageInput = z.infer<typeof galleryImage>
