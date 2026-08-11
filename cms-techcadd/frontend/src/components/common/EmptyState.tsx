import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  /** One short line explaining how the section fills up. */
  description?: string
  className?: string
}

/**
 * Neutral placeholder for a widget that has no records yet. Deliberately quiet
 * — an empty section should read as "nothing here yet", not as an error.
 */
export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-5 py-12 text-center',
        className,
      )}
    >
      <span
        className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-400"
        aria-hidden="true"
      >
        <Icon size={20} />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>}
    </div>
  )
}
