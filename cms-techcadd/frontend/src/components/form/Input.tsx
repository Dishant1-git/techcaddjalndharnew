import { useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'
import { controlBorder, controlClasses, useFieldContext } from './field'

interface InputProps extends Omit<ComponentPropsWithRef<'input'>, 'size'> {
  icon?: LucideIcon
  /** Rendered at the trailing edge — units, currency, a button. */
  suffix?: ReactNode
  invalid?: boolean
}

export function Input({
  icon: Icon,
  suffix,
  invalid,
  className,
  type = 'text',
  id,
  ...props
}: InputProps) {
  const field = useFieldContext()
  const [revealed, setRevealed] = useState(false)

  const isPassword = type === 'password'
  const isInvalid = invalid ?? field?.invalid ?? false
  const resolvedType = isPassword && revealed ? 'text' : type

  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      )}

      <input
        id={id ?? field?.id}
        type={resolvedType}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          controlClasses,
          controlBorder(isInvalid),
          'h-10 px-3',
          Icon && 'pl-9',
          (suffix || isPassword) && 'pr-10',
          className,
        )}
        {...props}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          aria-label={revealed ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {revealed ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      )}

      {suffix && !isPassword && (
        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  )
}
