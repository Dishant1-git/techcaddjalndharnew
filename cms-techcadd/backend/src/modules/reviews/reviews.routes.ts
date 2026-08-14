import { Router } from 'express'
import { z } from 'zod'

import { asyncHandler, badRequest } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './reviews.repo.js'
import { reviewPatchSchema, reviewSchema } from './reviews.schema.js'

export const reviewsRouter = Router()

reviewsRouter.use(requireAuth)

reviewsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

reviewsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

reviewsRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.status(201).json(await repo.create(reviewSchema.parse(req.body)))
  }),
)

reviewsRouter.patch(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    // Partial on purpose — drag-reorder sends `{ order }` on its own.
    res.json(await repo.update(requireParam(req, 'id'), reviewPatchSchema.parse(req.body)))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

reviewsRouter.delete(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)
