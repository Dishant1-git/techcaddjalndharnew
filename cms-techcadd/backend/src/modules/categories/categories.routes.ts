import { Router } from 'express'
import { z } from 'zod'

import { asyncHandler, badRequest } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './categories.repo.js'
import { categoryPatchSchema, categorySchema } from './categories.schema.js'

export const categoriesRouter = Router()

categoriesRouter.use(requireAuth)

categoriesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

categoriesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

categoriesRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.status(201).json(await repo.create(categorySchema.parse(req.body)))
  }),
)

categoriesRouter.patch(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    // Partial on purpose — drag-reorder sends `{ order }` on its own.
    const patch = categoryPatchSchema.parse(req.body)
    res.json(await repo.update(requireParam(req, 'id'), patch))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

categoriesRouter.delete(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)
