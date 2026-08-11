import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { cn } from '../../lib/cn'

export interface Crumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumb?: Crumb[]
  /** Right-aligned action buttons. */
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
              {breadcrumb.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight size={12} className="text-slate-300" aria-hidden="true" />
                  )}
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-slate-700">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-700">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
