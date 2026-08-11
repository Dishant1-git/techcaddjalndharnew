import { useId } from 'react'
import * as RadixSwitch from '@radix-ui/react-switch'

import { cn } from '../../lib/cn'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}: SwitchProps) {
  const id = useId()

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      {label && (
        <div className="min-w-0">
          <label htmlFor={id} className="text-sm font-medium text-slate-700 select-none">
            {label}
          </label>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      )}

      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          'bg-slate-200 data-[state=checked]:bg-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <RadixSwitch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5.5" />
      </RadixSwitch.Root>
    </div>
  )
}
