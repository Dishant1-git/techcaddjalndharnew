import { Router } from 'express'
import { z } from 'zod'

import { asyncHandler, badRequest } from '../../http/errors.js'
import { requireParam } from '../../http/params.js'
import { parseListParams } from '../../http/listParams.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './courses.repo.js'
import { courseSchema } from './courses.schema.js'

export const coursesRouter = Router()

// Everything below requires a session.
coursesRouter.use(requireAuth)

coursesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

coursesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

coursesRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const input = courseSchema.parse(req.body)
    res.status(201).json(await repo.create(input))
  }),
)

coursesRouter.patch(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    // The CMS form always submits the complete record, so a full parse is
    // correct here — a partial merge would silently drop cleared fields.
    const input = courseSchema.parse(req.body)
    res.json(await repo.update(requireParam(req, 'id'), input))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

coursesRouter.delete(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)
