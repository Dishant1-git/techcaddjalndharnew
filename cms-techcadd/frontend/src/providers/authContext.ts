import { createContext } from 'react'

import type { Session } from '../api/resources/auth'
import type { UserRole } from '../types'

/** Coarse permissions. The server must enforce these too — hiding UI is not security. */
export type Permission = 'manage-users' | 'manage-settings' | 'delete-content' | 'publish-content'

/**
 * What each role may reach.
 *
 * The narrower role arrived exactly as this table was built to expect: the
 * call sites already say which permission each control needs, so adding
 * `editor` was a line here rather than an audit of every button.
 *
 * An editor publishes and deletes content. They do not touch settings or other
 * people's accounts — that is the whole difference between the two.
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ['manage-users', 'manage-settings', 'delete-content', 'publish-content'],
  editor: ['delete-content', 'publish-content'],
}

export function roleAllows(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
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
