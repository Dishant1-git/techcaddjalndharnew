import { useCallback, useMemo, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { authApi, type Session } from '../api/resources/auth'
import {
  AuthContext,
  roleAllows,
  type AuthContextValue,
  type AuthStatus,
  type Permission,
} from './authContext'

const SESSION_KEY = ['auth', 'session'] as const

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  /**
   * The session is resolved from the server, not from storage. Retry is off:
   * a 401 is the ordinary signed-out answer, not a failure worth repeating.
   */
  const session = useQuery({
    queryKey: SESSION_KEY,
    queryFn: () => authApi.current().then((value) => value ?? null),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const loginMutation = useMutation({
    mutationFn: ({ identifier, password }: { identifier: string; password: string }) =>
      authApi.login(identifier, password),
    onSuccess: (user) => queryClient.setQueryData<Session | null>(SESSION_KEY, user),
  })

  const login = useCallback(
    async (identifier: string, password: string) => {
      await loginMutation.mutateAsync({ identifier, password })
    },
    [loginMutation],
  )

  const logout = useCallback(async () => {
    await authApi.logout()
    // Drop every cached record — the next user must not see the last one's data.
    queryClient.clear()
    queryClient.setQueryData<Session | null>(SESSION_KEY, null)
  }, [queryClient])

  const current = session.data ?? null

  const can = useCallback(
    (permission: Permission) => (current ? roleAllows(current.role, permission) : false),
    [current],
  )

  const status: AuthStatus = session.isPending
    ? 'loading'
    : current
      ? 'authenticated'
      : 'unauthenticated'

  const value = useMemo<AuthContextValue>(
    () => ({ session: current, status, login, logout, can }),
    [current, status, login, logout, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
