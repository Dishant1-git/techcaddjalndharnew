import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastRecord {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  /** ms; `null` keeps the toast until dismissed. */
  duration: number | null
}

export interface ToastOptions {
  description?: string
  action?: ToastRecord['action']
  duration?: number | null
}

export interface ToastApi {
  success(title: string, options?: ToastOptions): string
  error(title: string, options?: ToastOptions): string
  info(title: string, options?: ToastOptions): string
  warning(title: string, options?: ToastOptions): string
  dismiss(id: string): void
}

export interface ToastContextValue extends ToastApi {
  toasts: ToastRecord[]
}

/** Separate module so `ToastProvider.tsx` exports only a component. */
export const ToastContext = createContext<ToastContextValue | null>(null)
