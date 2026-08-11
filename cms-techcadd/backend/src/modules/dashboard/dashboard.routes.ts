import { Router } from 'express'

import { asyncHandler } from '../../http/errors.js'
import { requireAuth } from '../../middleware/auth.js'
import * as dashboard from './dashboard.repo.js'
import * as searchRepo from './search.repo.js'

export const dashboardRouter = Router()

dashboardRouter.use(requireAuth)

dashboardRouter.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    res.json(await dashboard.summary())
  }),
)

export const searchRouter = Router()

searchRouter.use(requireAuth)

searchRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const term = String(req.query.q ?? '').trim()

    // Two characters is the shortest that narrows anything; a single letter
    // would scan every table to return noise.
    if (term.length < 2) {
      res.json({ groups: [] })
      return
    }

    res.json({ groups: await searchRepo.search(term) })
  }),
)
