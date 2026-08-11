import { createContext } from 'react'

import type { Session } from '../api/resources/auth'
import type { UserRole } from '../types'

/** Coarse permissions. The server must enforce these too — hiding UI is not security. */
export type Permission = 'manage-users' | 'manage-settings' | 'delete-content' | 'publish-content'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'super-admin': ['manage-users', 'manage-settings', 'delete-content', 'publish-content'],
  admin: ['manage-settings', 'delete-content', 'publish-content'],
  editor: ['publish-content'],
}

export function roleAllows(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * `loading` exists because the session now lives in an httpOnly cookie, so it
 * can only be resolved by asking the server. Without this state the app would
 * flash the login screen on every refresh before `/auth/me` came back.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  session: Session | null
  status: AuthStatus
  login(identifier: string, password: string): Promise<void>
  logout(): Promise<void>
  can(permission: Permission): boolean
}

/** Separate module so `AuthProvider.tsx` exports only a component. */
export const AuthContext = createContext<AuthContextValue | null>(null)
