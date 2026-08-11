import { z } from 'zod'

/**
 * An optional reference to another record.
 *
 * An empty string is kept, not turned into undefined: undefined disappears from
 * the JSON body, so the server could not tell "leave it alone" from "clear it"
 * and an assigned relation could never be unset. The repositories convert '' to
 * NULL on write.
 */
const optionalId = z.string().optional()

/**
 * The shape, with no defaults attached.
 *
 * Defaults live only on the create schema below. `.partial()` does NOT strip a
 * `.default()` — `parse({ order: 5 })` would still return `status: 'draft'`, so
 * a drag-reorder that sends only `{ order }` would silently unpublish the
 * category. Keeping the base default-free makes that impossible.
 */
const base = z.object({
  name: z.string().min(1, 'Name is required.').max(60, 'Keep names under 60 characters.'),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
  parentId: optionalId,
  icon: z.string().optional(),
  accentColor: z.string().optional(),
  description: z.string().optional(),
  order: z.number(),
  status: z.enum(['published', 'draft', 'review']),
})

/** Create: the client sends the whole record, defaults fill any gaps. */
export const categorySchema = base.extend({
  order: z.number().default(0),
  status: z.enum(['published', 'draft', 'review']).default('draft'),
})

/** Update: only the keys actually sent are written. */
export const categoryPatchSchema = base.partial()

export type CategoryInput = z.infer<typeof categorySchema>
export type CategoryPatch = z.infer<typeof categoryPatchSchema>
