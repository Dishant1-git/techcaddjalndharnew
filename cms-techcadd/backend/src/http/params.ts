import type { Request } from 'express'

import { badRequest } from './errors.js'

/**
 * Reads a route parameter.
 *
 * Express always populates a declared `:param`, but `noUncheckedIndexedAccess`
 * types it as possibly undefined — and asserting is cheaper than a non-null
 * bang that would hide a genuine routing mistake.
 */
export function requireParam(req: Request, name: string): string {
  const value = req.params[name]
  if (typeof value !== 'string' || value.length === 0) {
    throw badRequest(`Missing "${name}" in the request path.`)
  }
  return value
}
