import { useMemo, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

import { cn } from '../../lib/cn'
import { Popover } from '../common/Popover'
import type { SelectOption } from './Select'
import { controlBorder, useFieldContext } from './field'

interface MultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  options: SelectOption[]
  placeholder?: string
  maxItems?: number
  invalid?: boolean
  className?: string
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  maxItems,
  invalid,
  className,
}: MultiSelectProps) {
  const field = useFieldContext()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const isInvalid = invalid ?? field?.invalid ?? false

  const selected = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? options.filter((o) => o.label.toLowerCase().includes(needle)) : options
  }, [options, query])

  const atLimit = maxItems !== undefined && value.length >= maxItems

  function toggle(option: SelectOption) {
    if (value.includes(option.value)) {
      onChange(value.filter((entry) => entry !== option.value))
      return
    }
    if (atLimit) return
    onChange([...value, option.value])
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className="w-(--radix-popover-trigger-width) p-0"
      trigger={
        <button
          type="button"
          id={field?.id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={isInvalid || undefined}
          aria-describedby={field?.describedBy}
          className={cn(
            'flex min-h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-left text-sm transition-colors',
            controlBorder(isInvalid),
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {selected.length === 0 && <span className="text-slate-400">{placeholder}</span>}
            {selected.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 py-0.5 pr-1 pl-2 text-xs font-medium text-slate-700"
              >
                {option.label}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${option.label}`}
                  onClick={(event) => {
                    // The chip lives inside the trigger, so its click must not
                    // also open the popover.
                    event.stopPropagation()
                    onChange(value.filter((entry) => entry !== option.value))
                  }}
                  className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                >
                  <X size={11} aria-hidden="true" />
                </span>
              </span>
            ))}
          </span>

          <ChevronDown size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
        </button>
      }
    >
      <div className="border-b border-slate-100 p-2">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search options"
            aria-label="Search options"
            className="h-8 w-full rounded-md border border-slate-200 pr-2 pl-8 text-sm outline-none focus:border-primary-400"
          />
        </div>
      </div>

      <ul role="listbox" aria-multiselectable className="scrollbar-slim max-h-60 overflow-y-auto p-1.5">
        {visible.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-slate-400">No matching options</li>
        )}

        {visible.map((option) => {
          const checked = value.includes(option.value)
          return (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={checked}
                disabled={option.disabled || (!checked && atLimit)}
                onClick={() => toggle(option)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  'hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40',
                  checked ? 'font-medium text-slate-900' : 'text-slate-700',
                )}
              >
                <span
                  className={cn(
                    'grid size-4 shrink-0 place-items-center rounded border',
                    checked ? 'border-primary-500 bg-primary-500 text-white' : 'border-slate-300',
                  )}
                  aria-hidden="true"
                >
                  {checked && <Check size={11} strokeWidth={3} />}
                </span>
                {option.label}
              </button>
            </li>
          )
        })}
      </ul>

      {maxItems !== undefined && (
        <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-400">
          {value.length} of {maxItems} selected
        </p>
      )}
    </Popover>
  )
}
