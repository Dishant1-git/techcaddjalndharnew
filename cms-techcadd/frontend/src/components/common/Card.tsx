import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface CardProps {
  className?: string
  /** Removes the default padding — use with tables or edge-to-edge media. */
  flush?: boolean
  children: ReactNode
}

export function Card({ className, flush = false, children }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        !flush && 'p-5',
        className,
      )}
    >
      {children}
    </section>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  /** Right-aligned slot for links or buttons. */
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-5', className)}>{children}</div>
}
