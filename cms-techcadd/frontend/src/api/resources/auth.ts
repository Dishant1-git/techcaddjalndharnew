import { request } from '../client'
import type { UserRole } from '../../types'

export interface Session {
  userId: string
  name: string
  email: string
  role: UserRole
}

/**
 * Talks to the Express auth endpoints.
 *
 * There is no token to store: the session is an httpOnly cookie the browser
 * sends automatically, which is why `current()` is a network call rather than a
 * synchronous read. A token in localStorage would be readable by any XSS.
 */
export const authApi = {
  /** Resolves the signed-in user, or undefined when signed out. */
  async current(): Promise<Session | undefined> {
    try {
      return await request<Session>('/auth/me')
    } catch {
      // A 401 here is the normal signed-out case, not an error worth surfacing.
      return undefined
    }
  },

  login(identifier: string, password: string): Promise<Session> {
    return request<Session>('/auth/login', { method: 'POST', body: { identifier, password } })
  },

  logout(): Promise<void> {
    return request<void>('/auth/logout', { method: 'POST' })
  },

  requestPasswordReset(email: string): Promise<void> {
    return request<void>('/auth/forgot-password', { method: 'POST', body: { email } })
  },

  resetPassword(token: string, password: string): Promise<void> {
    return request<void>('/auth/reset-password', { method: 'POST', body: { token, password } })
  },

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return request<void>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    })
  },
}
