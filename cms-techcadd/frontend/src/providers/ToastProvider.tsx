import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { createId } from '../lib/id'
import {
  ToastContext,
  type ToastContextValue,
  type ToastOptions,
  type ToastRecord,
  type ToastVariant,
} from './toastContext'

const DEFAULT_DURATION = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((variant: ToastVariant, title: string, options?: ToastOptions) => {
    const id = createId('toast')
    // Errors persist — they usually need an action, and auto-dismissing one the
    // user hasn't read loses the only report of a failure.
    const fallback = variant === 'error' ? null : DEFAULT_DURATION
    const duration = options?.duration === undefined ? fallback : options.duration

    setToasts((current) => [
      ...current,
      { id, variant, title, description: options?.description, action: options?.action, duration },
    ])

    return id
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      dismiss,
      success: (title, options) => push('success', title, options),
      error: (title, options) => push('error', title, options),
      info: (title, options) => push('info', title, options),
      warning: (title, options) => push('warning', title, options),
    }),
    [toasts, dismiss, push],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
