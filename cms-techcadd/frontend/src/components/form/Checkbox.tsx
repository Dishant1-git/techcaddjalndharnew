import { useId, type ReactNode } from 'react'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'

import { cn } from '../../lib/cn'

interface CheckboxProps {
  checked: boolean | 'indeterminate'
  onCheckedChange: (checked: boolean) => void
  label?: ReactNode
  description?: string
  disabled?: boolean
  /** Required when no visible label is rendered. */
  'aria-label'?: string
  className?: string
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
  ...props
}: CheckboxProps) {
  const id = useId()

  const control = (
    <RadixCheckbox.Root
      id={id}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      disabled={disabled}
      aria-label={props['aria-label']}
      className={cn(
        'grid size-4.5 shrink-0 place-items-center rounded border transition-colors',
        'border-slate-300 bg-white hover:border-slate-400',
        'data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-500',
        'data-[state=indeterminate]:border-primary-500 data-[state=indeterminate]:bg-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !label && className,
      )}
    >
      <RadixCheckbox.Indicator className="text-white">
        {checked === 'indeterminate' ? (
          <Minus size={12} strokeWidth={3} aria-hidden="true" />
        ) : (
          <Check size={12} strokeWidth={3} aria-hidden="true" />
        )}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )

  if (!label) return control

  return (
    <div className={cn('flex gap-2.5', className)}>
      <div className="pt-0.5">{control}</div>
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-slate-700 select-none">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
    </div>
  )
}
