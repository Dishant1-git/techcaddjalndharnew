import { useState, type ComponentPropsWithRef } from 'react'

import { cn } from '../../lib/cn'
import { controlBorder, controlClasses, useFieldContext } from './field'

interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  invalid?: boolean
  /** Shows a live "used / limit" counter beneath the control. */
  showCount?: boolean
}

export function Textarea({
  invalid,
  showCount = false,
  className,
  id,
  rows = 4,
  maxLength,
  onChange,
  defaultValue,
  value,
  ...props
}: TextareaProps) {
  const field = useFieldContext()
  const isInvalid = invalid ?? field?.invalid ?? false

  const [count, setCount] = useState(() => String(value ?? defaultValue ?? '').length)

  return (
    <div>
      <textarea
        id={id ?? field?.id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        onChange={(event) => {
          setCount(event.target.value.length)
          onChange?.(event)
        }}
        className={cn(controlClasses, controlBorder(isInvalid), 'resize-y px-3 py-2', className)}
        {...props}
      />

      {showCount && (
        <p
          className={cn(
            'mt-1 text-right text-xs',
            maxLength && count > maxLength * 0.9 ? 'text-amber-600' : 'text-slate-400',
          )}
        >
          {count}
          {maxLength ? ` / ${maxLength}` : ''}
        </p>
      )}
    </div>
  )
}
