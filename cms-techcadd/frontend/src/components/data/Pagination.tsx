import { ChevronLeft, ChevronRight } from 'lucide-react'

import { PAGE_SIZE_OPTIONS } from '../../api'
import { cn } from '../../lib/cn'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  className?: string
}

/** Windowed page numbers with ellipses, e.g. `1 … 4 5 6 … 20`. */
function pageNumbers(current: number, last: number): (number | 'gap')[] {
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1)

  const pages = new Set([1, last, current, current - 1, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b)

  const result: (number | 'gap')[] = []
  let previous = 0

  for (const page of sorted) {
    if (previous && page - previous > 1) result.push('gap')
    result.push(page)
    previous = page
  }

  return result
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3',
        className,
      )}
    >
      <p className="text-xs text-slate-500" aria-live="polite">
        Showing <span className="font-medium text-slate-700">{first}</span>–
        <span className="font-medium text-slate-700">{last}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          Per page
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <PageButton
            label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </PageButton>

          {pageNumbers(page, lastPage).map((entry, index) =>
            entry === 'gap' ? (
              <span key={`gap-${index}`} className="px-1 text-xs text-slate-400" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? 'page' : undefined}
                className={cn(
                  'h-8 min-w-8 rounded-md px-2 text-xs font-medium transition-colors',
                  entry === page
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {entry}
              </button>
            ),
          )}

          <PageButton
            label="Next page"
            disabled={page >= lastPage}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </PageButton>
        </div>
      </div>
    </nav>
  )
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-8 place-items-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}
