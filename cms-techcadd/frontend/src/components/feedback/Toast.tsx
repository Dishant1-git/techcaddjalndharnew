import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { useToastList } from '../../hooks/useToast'
import { cn } from '../../lib/cn'
import type { ToastRecord, ToastVariant } from '../../providers/toastContext'

const variantMeta: Record<ToastVariant, { icon: LucideIcon; iconClass: string }> = {
  success: { icon: CheckCircle2, iconClass: 'text-emerald-600' },
  error: { icon: XCircle, iconClass: 'text-rose-600' },
  info: { icon: Info, iconClass: 'text-sky-600' },
  warning: { icon: AlertTriangle, iconClass: 'text-amber-600' },
}

/** Mount once, near the router root. */
export function ToastViewport() {
  const { toasts, dismiss } = useToastList()

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>,
    document.body,
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord
  onDismiss: (id: string) => void
}) {
  const { icon: Icon, iconClass } = variantMeta[toast.variant]
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (toast.duration === null) return
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div
      // Errors interrupt; everything else waits for a pause in speech.
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full max-w-sm gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg',
        !reducedMotion && 'animate-toast-in',
      )}
    >
      <Icon size={18} className={cn('mt-0.5 shrink-0', iconClass)} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{toast.description}</p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              onDismiss(toast.id)
            }}
            className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="-m-1 h-fit rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
