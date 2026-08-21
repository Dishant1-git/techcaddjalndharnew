import type { BaseEntity, User } from '../../types'
import { createHttpResource } from '../http/resource'

/**
 * Role is chosen in the Team form and sent; the API defaults it to `editor`
 * when it is absent, which is the safer of the two.
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
