import { useContext } from 'react'

import { ToastContext, type ToastApi } from '../providers/toastContext'

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.')
  return context
}

/** Internal — the viewport needs the list itself, callers only need the API. */
export function useToastList() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToastList must be used inside <ToastProvider>.')
  return { toasts: context.toasts, dismiss: context.dismiss }
}
