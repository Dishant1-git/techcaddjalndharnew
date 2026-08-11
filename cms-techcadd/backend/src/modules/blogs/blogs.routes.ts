import { Router } from 'express'
import { z } from 'zod'

import { asyncHandler, badRequest, unauthorised } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './blogs.repo.js'
import { blogPatchSchema, blogSchema } from './blogs.schema.js'

export const blogsRouter = Router()

blogsRouter.use(requireAuth)

blogsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

blogsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

blogsRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorised()
    // The form has no author field, so the signed-in user is the author.
    res.status(201).json(await repo.create(blogSchema.parse(req.body), req.user.userId))
  }),
)

blogsRouter.patch(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.json(await repo.update(requireParam(req, 'id'), blogPatchSchema.parse(req.body)))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

blogsRouter.delete(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)
