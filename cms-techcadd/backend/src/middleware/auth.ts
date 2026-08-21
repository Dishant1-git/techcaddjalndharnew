import type { NextFunction, Request, Response } from 'express'

import { forbidden, unauthorised } from '../http/errors.js'
import { resolveSession, type SessionUser, type UserRole } from '../modules/auth/auth.service.js'

export const SESSION_COOKIE = 'techcadd_session'

declare module 'express-serve-static-core' {
  interface Request {
    user?: SessionUser
    sessionId?: string
  }
}

/** Attaches `req.user` when a valid session cookie is present. Never rejects. */
export async function attachUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.signedCookies?.[SESSION_COOKIE] as string | undefined
  if (!sessionId) return next()

  try {
    const user = await resolveSession(sessionId)
    if (user) {
      req.user = user
      req.sessionId = sessionId
    }
    next()
  } catch (error) {
    next(error)
  }
}

/** Rejects the request unless a session was resolved. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(unauthorised())
  next()
}

/**
 * Higher clears lower. An editor may do everything content; an admin may also
 * reach settings, redirects, enquiries and other people's accounts.
 */
const RANK: Record<UserRole, number> = { editor: 1, admin: 2 }

/**
 * Role gate for mutating routes.
 *
 * Content modules ask for `editor`; the ones that can change how the site runs
 * or who can reach it — settings, redirects, enquiries, users — ask for
 * `admin`. Keeping the gate at every mutating route, even where it is the
 * lower of the two, is what made adding the second role a matter of choosing a
 * word per module rather than rediscovering which routes mutate data.
 *
 * This is the real check either way. `useCan()` in the CMS only hides buttons;
 * anyone can call the API directly.
 */
export function requireRole(minimum: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(unauthorised())
    if (RANK[req.user.role] < RANK[minimum]) return next(forbidden())
    next()
  }
}
