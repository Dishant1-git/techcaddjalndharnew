import type { ComponentPropsWithRef } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/cn'
import { controlBorder, controlClasses, useFieldContext } from './field'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  options: SelectOption[]
  /** Leading blank entry, e.g. "All categories". */
  placeholder?: string
  invalid?: boolean
}

/**
 * A native `<select>`. It is keyboard- and screen-reader-correct for free, and
 * on mobile it opens the platform picker — both worth more than custom styling.
 */
export function Select({
  options,
  placeholder,
  invalid,
  className,
  id,
  ...props
}: SelectProps) {
  const field = useFieldContext()
  const isInvalid = invalid ?? field?.invalid ?? false

  return (
    <div className="relative">
      <select
        id={id ?? field?.id}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          controlClasses,
          controlBorder(isInvalid),
          'h-10 appearance-none pr-9 pl-3',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  )
}
