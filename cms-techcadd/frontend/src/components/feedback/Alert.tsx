import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'

export type AlertTone = 'info' | 'success' | 'warning' | 'error'

const toneMeta: Record<AlertTone, { icon: LucideIcon; container: string; iconClass: string }> = {
  info: { icon: Info, container: 'border-sky-200 bg-sky-50 text-sky-900', iconClass: 'text-sky-600' },
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconClass: 'text-emerald-600',
  },
  warning: {
    icon: AlertTriangle,
    container: 'border-amber-200 bg-amber-50 text-amber-900',
    iconClass: 'text-amber-600',
  },
  error: {
    icon: XCircle,
    container: 'border-rose-200 bg-rose-50 text-rose-900',
    iconClass: 'text-rose-600',
  },
}

interface AlertProps {
  tone?: AlertTone
  title?: string
  children?: ReactNode
  onDismiss?: () => void
  className?: string
}

export function Alert({ tone = 'info', title, children, onDismiss, className }: AlertProps) {
  const meta = toneMeta[tone]
  const Icon = meta.icon

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border p-4', meta.container, className)}
    >
      <Icon size={18} className={cn('mt-0.5 shrink-0', meta.iconClass)} aria-hidden="true" />

      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn('leading-relaxed', title && 'mt-1')}>{children}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 h-fit rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
