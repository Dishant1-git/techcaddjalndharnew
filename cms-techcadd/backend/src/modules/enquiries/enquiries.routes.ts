import { Router } from 'express'
import { z } from 'zod'

import { asyncHandler, badRequest } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './enquiries.repo.js'
import {
  enquiryBulkSchema,
  enquiryPatchSchema,
  enquirySchema,
} from './enquiries.schema.js'

export const enquiriesRouter = Router()

enquiriesRouter.use(requireAuth)

enquiriesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

// Declared before '/:id' so "bulk" is not read as an id.
enquiriesRouter.patch(
  '/bulk',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const updated = await repo.bulkUpdate(enquiryBulkSchema.parse(req.body))
    res.json({ updated })
  }),
)

enquiriesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

enquiriesRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.status(201).json(await repo.create(enquirySchema.parse(req.body)))
  }),
)

enquiriesRouter.patch(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.json(await repo.update(requireParam(req, 'id'), enquiryPatchSchema.parse(req.body)))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

enquiriesRouter.delete(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)
