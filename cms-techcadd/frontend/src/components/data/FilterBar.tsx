import type { ReactNode } from 'react'
import { Search, X } from 'lucide-react'

import { cn } from '../../lib/cn'

export interface ActiveFilter {
  key: string
  label: string
  value: string
  onRemove: () => void
}

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  /** Selects and date pickers rendered beside the search field. */
  filters?: ReactNode
  activeFilters?: ActiveFilter[]
  onClearAll?: () => void
  /** Right-aligned slot — export buttons, view toggles. */
  actions?: ReactNode
  className?: string
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters,
  activeFilters = [],
  onClearAll,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('border-b border-slate-100 px-5 py-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-700 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-400"
          />
        </div>

        {filters}

        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400">Filters:</span>

          {activeFilters.map((filter) => (
            <span
              key={`${filter.key}:${filter.value}`}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 py-1 pr-1 pl-2 text-xs font-medium text-slate-700"
            >
              <span className="text-slate-500">{filter.label}:</span>
              {filter.value}
              <button
                type="button"
                onClick={filter.onRemove}
                aria-label={`Remove filter ${filter.label}: ${filter.value}`}
                className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))}

          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="ml-1 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}
