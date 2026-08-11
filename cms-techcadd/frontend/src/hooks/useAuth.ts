import { useContext } from 'react'

import { AuthContext, type AuthContextValue, type Permission } from '../providers/authContext'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.')
  return context
}

/** `useCan('manage-users')` — gates UI only; the server must check too. */
export function useCan(permission: Permission): boolean {
  return useAuth().can(permission)
}
