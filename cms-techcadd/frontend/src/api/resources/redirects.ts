import type { BaseEntity, Redirect } from '../../types'
import { createHttpResource } from '../http/resource'

export type RedirectCreate = Omit<Redirect, keyof BaseEntity>
export type RedirectUpdate = Partial<RedirectCreate>

/** Live against the Express API. */
export const redirectsApi = createHttpResource<Redirect, RedirectCreate, RedirectUpdate>(
  '/redirects',
)
