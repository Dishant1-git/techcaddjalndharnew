import { Router } from 'express'
import { z } from 'zod'

import { asyncHandler, badRequest } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './faqs.repo.js'
import { faqPatchSchema, faqSchema } from './faqs.schema.js'

export const faqsRouter = Router()

faqsRouter.use(requireAuth)

faqsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

// Before '/:id', or "categories" is read as an id.
faqsRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    res.json({ items: await repo.categories() })
  }),
)

faqsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

faqsRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.status(201).json(await repo.create(faqSchema.parse(req.body)))
  }),
)

faqsRouter.patch(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    // Partial on purpose — drag-reorder sends `{ order }` on its own.
    res.json(await repo.update(requireParam(req, 'id'), faqPatchSchema.parse(req.body)))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

faqsRouter.delete(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)
