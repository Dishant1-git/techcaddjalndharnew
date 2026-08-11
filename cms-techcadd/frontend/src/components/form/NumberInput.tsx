import { Minus, Plus } from 'lucide-react'

import { cn } from '../../lib/cn'
import { controlBorder, controlClasses, useFieldContext } from './field'

interface NumberInputProps {
  value: number | ''
  onChange: (value: number | '') => void
  min?: number
  max?: number
  step?: number
  /** Rendered inside the control, e.g. "₹" or "hrs". */
  prefix?: string
  suffix?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  disabled,
  invalid,
  className,
}: NumberInputProps) {
  const field = useFieldContext()
  const isInvalid = invalid ?? field?.invalid ?? false

  function clamp(next: number): number {
    if (min !== undefined && next < min) return min
    if (max !== undefined && next > max) return max
    return next
  }

  function nudge(delta: number) {
    const base = value === '' ? 0 : value
    onChange(clamp(base + delta))
  }

  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
          {prefix}
        </span>
      )}

      <input
        id={field?.id}
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        onChange={(event) => {
          const raw = event.target.value
          onChange(raw === '' ? '' : Number(raw))
        }}
        onBlur={() => {
          if (value !== '') onChange(clamp(value))
        }}
        className={cn(
          controlClasses,
          controlBorder(isInvalid),
          // Native spinners are tiny and inconsistent; ours are the buttons.
          'h-10 px-3 pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          prefix && 'pl-7',
          className,
        )}
      />

      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
        {suffix && <span className="mr-1 text-xs text-slate-400">{suffix}</span>}
        <button
          type="button"
          onClick={() => nudge(-step)}
          disabled={disabled}
          aria-label="Decrease"
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
        >
          <Minus size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => nudge(step)}
          disabled={disabled}
          aria-label="Increase"
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
