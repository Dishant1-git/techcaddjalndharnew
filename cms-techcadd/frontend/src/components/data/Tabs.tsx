import type { ReactNode } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'

import { cn } from '../../lib/cn'

export interface TabItem {
  value: string
  label: string
  /** Count pill rendered beside the label. */
  badge?: number
}

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  items: TabItem[]
  children?: ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, items, children, className }: TabsProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange} className={className}>
      <RadixTabs.List className="scrollbar-slim flex gap-1 overflow-x-auto border-b border-slate-100 px-5">
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              'flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              'text-slate-500 hover:text-slate-800',
              'data-[state=active]:border-primary-500 data-[state=active]:text-primary-600',
            )}
          >
            {item.label}
            {item.badge !== undefined && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {item.badge}
              </span>
            )}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {children}
    </RadixTabs.Root>
  )
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixTabs.Content value={value} className="focus-visible:outline-none">
      {children}
    </RadixTabs.Content>
  )
}
