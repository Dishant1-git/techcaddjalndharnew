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

const RANK: Record<UserRole, number> = { editor: 1, admin: 2, 'super-admin': 3 }

/**
 * Role gate for mutating routes.
 *
 * This is the real check. `useCan()` in the CMS only hides buttons — anyone can
 * call the API directly, so permission has to be enforced here.
 */
export function requireRole(minimum: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(unauthorised())
    if (RANK[req.user.role] < RANK[minimum]) return next(forbidden())
    next()
  }
}
