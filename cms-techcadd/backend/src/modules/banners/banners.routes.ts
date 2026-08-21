import { Router } from 'express'
import { z } from 'zod'

import { asyncHandler, badRequest } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './banners.repo.js'
import { bannerPatchSchema, bannerSchema } from './banners.schema.js'

export const bannersRouter = Router()

bannersRouter.use(requireAuth)

bannersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

bannersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

bannersRouter.post(
  '/',
  requireRole('editor'),
  asyncHandler(async (req, res) => {
    res.status(201).json(await repo.create(bannerSchema.parse(req.body)))
  }),
)

bannersRouter.patch(
  '/:id',
  requireRole('editor'),
  asyncHandler(async (req, res) => {
    // Partial on purpose — drag-reorder sends `{ order }` on its own.
    res.json(await repo.update(requireParam(req, 'id'), bannerPatchSchema.parse(req.body)))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

bannersRouter.delete(
  '/',
  requireRole('editor'),
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)
