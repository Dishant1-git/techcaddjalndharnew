import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'
import type { SortDirection } from '../../api'
import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { Alert } from '../feedback/Alert'
import { SkeletonTable } from '../feedback/Skeleton'
import { Checkbox } from '../form/Checkbox'

export interface Column<T> {
  id: string
  header: string
  /** Cell content. Receives the whole row. */
  cell: (row: T) => ReactNode
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  width?: string
  /** Hides the column below this breakpoint on the desktop table. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
  /** Omitted from the stacked mobile card — usually the primary column. */
  primary?: boolean
}

export interface SortState {
  field: string
  dir: SortDirection
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  getRowId: (row: T) => string
  /** Accessible description of the table's contents. */
  caption: string

  loading?: boolean
  error?: Error | null
  onRetry?: () => void

  sort?: SortState
  onSortChange?: (sort: SortState) => void

  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void

  rowActions?: (row: T) => ReactNode
  onRowClick?: (row: T) => void

  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
}

const hideBelowClasses: Record<NonNullable<Column<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  loading = false,
  error = null,
  onRetry,
  sort,
  onSortChange,
  selectedIds,
  onSelectionChange,
  rowActions,
  onRowClick,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyIcon,
}: DataTableProps<T>) {
  const selectable = Boolean(onSelectionChange)
  const selected = new Set(selectedIds ?? [])

  if (loading) return <SkeletonTable columns={columns.length} />

  if (error) {
    return (
      <div className="p-5">
        <Alert tone="error" title="Could not load these records">
          <p>{error.message}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" icon={RefreshCw} className="mt-3" onClick={onRetry}>
              Try again
            </Button>
          )}
        </Alert>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon ?? ArrowUpDown}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(getRowId(row)))
  const someSelected = rows.some((row) => selected.has(getRowId(row)))

  function toggleAll(checked: boolean) {
    if (!onSelectionChange) return
    onSelectionChange(checked ? rows.map(getRowId) : [])
  }

  function toggleRow(id: string, checked: boolean) {
    if (!onSelectionChange) return
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    onSelectionChange([...next])
  }

  function nextSort(column: Column<T>): SortState {
    const isCurrent = sort?.field === column.id
    return { field: column.id, dir: isCurrent && sort?.dir === 'asc' ? 'desc' : 'asc' }
  }

  return (
    <>
      {/* Desktop: a real table. */}
      <div className="scrollbar-slim hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>

          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {selectable && (
                <th scope="col" className="w-12 px-5 py-3">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                  />
                </th>
              )}

              {columns.map((column) => {
                const isSorted = sort?.field === column.id
                return (
                  <th
                    key={column.id}
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    aria-sort={
                      isSorted ? (sort?.dir === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                    className={cn(
                      'px-5 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase',
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center',
                      column.hideBelow && hideBelowClasses[column.hideBelow],
                    )}
                  >
                    {column.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(nextSort(column))}
                        className="inline-flex items-center gap-1 uppercase transition-colors hover:text-slate-800"
                      >
                        {column.header}
                        {isSorted ? (
                          sort?.dir === 'asc' ? (
                            <ArrowUp size={12} aria-hidden="true" />
                          ) : (
                            <ArrowDown size={12} aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}

              {rowActions && (
                <th scope="col" className="w-16 px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const id = getRowId(row)
              const isSelected = selected.has(id)

              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-slate-50 transition-colors last:border-0',
                    isSelected ? 'bg-primary-50/40' : 'hover:bg-slate-50/60',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {selectable && (
                    <td className="px-5 py-3.5" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => toggleRow(id, checked)}
                        aria-label={isSelected ? 'Deselect row' : 'Select row'}
                      />
                    </td>
                  )}

                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'px-5 py-3.5 text-slate-600',
                        column.align === 'right' && 'text-right',
                        column.align === 'center' && 'text-center',
                        column.hideBelow && hideBelowClasses[column.hideBelow],
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}

                  {rowActions && (
                    <td className="px-5 py-3.5" onClick={(event) => event.stopPropagation()}>
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards. A 7-column table on a 360px screen is unusable
          however much it scrolls. */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((row) => {
          const id = getRowId(row)
          const primary = columns.find((column) => column.primary) ?? columns[0]
          const rest = columns.filter((column) => column !== primary)

          return (
            <li key={id} className="p-4">
              <div className="flex items-start gap-3">
                {selectable && (
                  <div className="pt-0.5">
                    <Checkbox
                      checked={selected.has(id)}
                      onCheckedChange={(checked) => toggleRow(id, checked)}
                      aria-label={selected.has(id) ? 'Deselect row' : 'Select row'}
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">{primary.cell(row)}</div>

                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {rest.map((column) => (
                      <div key={column.id} className="min-w-0">
                        <dt className="text-[11px] tracking-wide text-slate-400 uppercase">
                          {column.header}
                        </dt>
                        <dd className="truncate text-sm text-slate-600">{column.cell(row)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {rowActions && <div className="shrink-0">{rowActions(row)}</div>}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
