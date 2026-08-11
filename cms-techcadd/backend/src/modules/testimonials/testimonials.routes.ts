import { Router } from 'express'
import { z } from 'zod'

import { asyncHandler, badRequest } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './testimonials.repo.js'
import { testimonialPatchSchema, testimonialSchema } from './testimonials.schema.js'

export const testimonialsRouter = Router()

testimonialsRouter.use(requireAuth)

testimonialsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

testimonialsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

testimonialsRouter.post(
  '/',
  requireRole('editor'),
  asyncHandler(async (req, res) => {
    res.status(201).json(await repo.create(testimonialSchema.parse(req.body)))
  }),
)

testimonialsRouter.patch(
  '/:id',
  requireRole('editor'),
  asyncHandler(async (req, res) => {
    // Partial on purpose — the list toggles `featured` on its own.
    res.json(await repo.update(requireParam(req, 'id'), testimonialPatchSchema.parse(req.body)))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

testimonialsRouter.delete(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)
