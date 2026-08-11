import { z } from 'zod'

/** A site-relative path. Absolute URLs belong on the origin they point at. */
const path = z
  .string()
  .min(1, 'A path is required.')
  .max(500, 'That path is too long.')
  .refine((value) => value.startsWith('/'), 'Start the path with a slash.')

const base = z.object({
  from: path,
  to: path,
  // 301 is cached hard by browsers, so the wrong one is expensive to undo;
  // anything outside the pair is a typo.
  type: z.union([z.literal(301), z.literal(302)]),
  enabled: z.boolean(),
})

/** A redirect to itself would loop until the browser gives up. */
const notSelfReferential = (values: { from?: string; to?: string }, ctx: z.RefinementCtx) => {
  if (values.from && values.to && values.from === values.to) {
    ctx.addIssue({
      code: 'custom',
      path: ['to'],
      message: 'A redirect cannot point at itself.',
    })
  }
}

export const redirectSchema = base
  .extend({
    type: z.union([z.literal(301), z.literal(302)]).default(301),
    enabled: z.boolean().default(true),
  })
  .superRefine(notSelfReferential)

/** Defaults stay off the patch schema — see the note in categories.schema.ts. */
export const redirectPatchSchema = base.partial().superRefine(notSelfReferential)

export type RedirectInput = z.infer<typeof redirectSchema>
export type RedirectPatch = z.infer<typeof redirectPatchSchema>
