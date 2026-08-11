import type { ReactNode } from 'react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import type { LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'

interface DropdownMenuProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function DropdownMenu({
  trigger,
  children,
  align = 'end',
  className,
}: DropdownMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 min-w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg',
            className,
          )}
        >
          {children}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}

interface DropdownItemProps {
  icon?: LucideIcon
  tone?: 'default' | 'danger'
  disabled?: boolean
  onSelect?: () => void
  children: ReactNode
}

export function DropdownItem({
  icon: Icon,
  tone = 'default',
  disabled,
  onSelect,
  children,
}: DropdownItemProps) {
  return (
    <Menu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none select-none',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        tone === 'danger'
          ? 'text-rose-600 data-[highlighted]:bg-rose-50'
          : 'text-slate-700 data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900',
      )}
    >
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </Menu.Item>
  )
}

export function DropdownSeparator() {
  return <Menu.Separator className="my-1.5 h-px bg-slate-100" />
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <Menu.Label className="px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
      {children}
    </Menu.Label>
  )
}
