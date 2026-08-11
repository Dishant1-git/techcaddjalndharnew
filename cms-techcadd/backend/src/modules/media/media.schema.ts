import { z } from 'zod'

/**
 * Only metadata is editable.
 *
 * The bytes, size, mime type and dimensions are facts about the stored file,
 * not fields — letting a client rewrite them would make the row lie about
 * what is on disk.
 */
export const mediaPatchSchema = z.object({
  filename: z.string().min(1, 'A filename is required.').max(255).optional(),
  alt: z.string().max(255, 'Keep alt text under 255 characters.').optional(),
  folder: z.string().max(120).optional(),
})

/** Sent alongside the files as a form field. */
export const uploadFieldsSchema = z.object({
  folder: z.string().max(120).optional(),
})

export type MediaPatch = z.infer<typeof mediaPatchSchema>
