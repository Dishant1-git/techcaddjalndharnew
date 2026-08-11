import { Router } from 'express'
import { z } from 'zod'

import { asyncHandler, badRequest, unauthorised } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './users.repo.js'
import { userPatchSchema, userSchema } from './users.schema.js'

export const usersRouter = Router()

usersRouter.use(requireAuth)

/**
 * Readable by any signed-in user.
 *
 * Enquiries are assigned to people, so every role needs the list to render a
 * name against an assignee. No password material is included.
 */
usersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

usersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

usersRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { user, temporaryPassword } = await repo.create(userSchema.parse(req.body))

    // Returned once, and only on creation — there is no way to read it back.
    res.status(201).json(temporaryPassword ? { ...(user as object), temporaryPassword } : user)
  }),
)

usersRouter.patch(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorised()
    const patch = userPatchSchema.parse(req.body)
    res.json(await repo.update(requireParam(req, 'id'), patch, req.user))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

usersRouter.delete(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorised()
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids, req.user)
    res.status(204).end()
  }),
)
