import { createContext } from 'react'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'neutral'
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

/** Separate module so `ConfirmProvider.tsx` exports only a component. */
export const ConfirmContext = createContext<ConfirmFn | null>(null)
