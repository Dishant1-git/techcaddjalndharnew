import type { BaseEntity, User } from '../../types'
import { createHttpResource } from '../http/resource'

/**
 * Role is assigned by the server, not chosen here.
 *
 * There is one role — admin — so the CMS has nothing to pick and the API
 * defaults it.
 */
export type UserCreate = Omit<User, keyof BaseEntity | 'role'> & { role?: User['role'] }
export type UserUpdate = Partial<UserCreate>

/**
 * Live against the Express API.
 *
 * The API never returns password material. When a user is created without a
 * password it returns a one-time `temporaryPassword` alongside the record —
 * see `UserWithTemporaryPassword`.
 */
export const usersApi = createHttpResource<User, UserCreate, UserUpdate>('/users')

/** What `create` resolves to when the API generated a password. */
export interface UserWithTemporaryPassword extends User {
  temporaryPassword?: string
}
