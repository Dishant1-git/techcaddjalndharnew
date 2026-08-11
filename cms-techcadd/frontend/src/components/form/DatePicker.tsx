import { useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { format, isValid, parseISO } from 'date-fns'
import { CalendarDays, X } from 'lucide-react'

import { cn } from '../../lib/cn'
import { Popover } from '../common/Popover'
import { controlBorder, useFieldContext } from './field'

import 'react-day-picker/style.css'

/** Shared day-grid styling so both pickers look identical. */
const dayPickerClassNames = {
  root: 'rdp-root text-sm',
  month_caption: 'flex items-center justify-center h-9 font-semibold text-slate-900 text-sm',
  nav: 'absolute inset-x-1 top-1 flex justify-between',
  button_previous: 'rounded-md p-1.5 text-slate-500 hover:bg-slate-100',
  button_next: 'rounded-md p-1.5 text-slate-500 hover:bg-slate-100',
  weekday: 'text-[11px] font-medium text-slate-400',
  day_button: 'size-8 rounded-md hover:bg-slate-100',
  selected: '[&>button]:bg-primary-500 [&>button]:text-white [&>button]:hover:bg-primary-600',
  today: 'font-semibold text-primary-600',
  outside: 'text-slate-300',
  disabled: 'text-slate-300 line-through',
}

function toDate(value?: string): Date | undefined {
  if (!value) return undefined
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : undefined
}

function toIso(date?: Date): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined
}

interface DatePickerProps {
  /** ISO date, `yyyy-MM-dd`. */
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  fromDate?: Date
  toDate?: Date
  invalid?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select a date',
  fromDate,
  toDate: maxDate,
  invalid,
  className,
}: DatePickerProps) {
  const field = useFieldContext()
  const [open, setOpen] = useState(false)
  const selected = toDate(value)
  const isInvalid = invalid ?? field?.invalid ?? false

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className="p-2"
      trigger={
        <button
          type="button"
          id={field?.id}
          aria-invalid={isInvalid || undefined}
          aria-describedby={field?.describedBy}
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 text-left text-sm transition-colors',
            controlBorder(isInvalid),
            className,
          )}
        >
          <CalendarDays size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className={cn('flex-1 truncate', !selected && 'text-slate-400')}>
            {selected ? format(selected, 'dd MMM yyyy') : placeholder}
          </span>
          {selected && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear date"
              onClick={(event) => {
                event.stopPropagation()
                onChange(undefined)
              }}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} aria-hidden="true" />
            </span>
          )}
        </button>
      }
    >
      <DayPicker
        mode="single"
        selected={selected}
        defaultMonth={selected}
        disabled={[
          ...(fromDate ? [{ before: fromDate }] : []),
          ...(maxDate ? [{ after: maxDate }] : []),
        ]}
        onSelect={(date) => {
          onChange(toIso(date))
          setOpen(false)
        }}
        classNames={dayPickerClassNames}
      />
    </Popover>
  )
}

interface DateRangePickerProps {
  value?: { from?: string; to?: string }
  onChange: (value: { from?: string; to?: string }) => void
  placeholder?: string
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Select a date range',
  className,
}: DateRangePickerProps) {
  const field = useFieldContext()
  const [open, setOpen] = useState(false)

  const range: DateRange | undefined = value?.from
    ? { from: toDate(value.from), to: toDate(value.to) }
    : undefined

  const label = range?.from
    ? `${format(range.from, 'dd MMM')} – ${range.to ? format(range.to, 'dd MMM yyyy') : '…'}`
    : placeholder

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className="p-2"
      trigger={
        <button
          type="button"
          id={field?.id}
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 text-left text-sm transition-colors',
            controlBorder(false),
            className,
          )}
        >
          <CalendarDays size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className={cn('flex-1 truncate', !range?.from && 'text-slate-400')}>{label}</span>
          {range?.from && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear date range"
              onClick={(event) => {
                event.stopPropagation()
                onChange({})
              }}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} aria-hidden="true" />
            </span>
          )}
        </button>
      }
    >
      <DayPicker
        mode="range"
        selected={range}
        defaultMonth={range?.from}
        numberOfMonths={1}
        onSelect={(next) => onChange({ from: toIso(next?.from), to: toIso(next?.to) })}
        classNames={dayPickerClassNames}
      />
    </Popover>
  )
}
