import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '../../lib/cn'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/** Right-hand panel. Same focus guarantees as `Modal` — it is the same Radix primitive. */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50" />

        <Dialog.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl',
            className,
          )}
        >
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-slate-900">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-sm text-slate-500">
                  {description}
                </Dialog.Description>
              )}
            </div>

            <Dialog.Close
              aria-label="Close panel"
              className="-m-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
          </header>

          <div className="scrollbar-slim flex-1 overflow-y-auto p-5">{children}</div>

          {footer && (
            <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">
              {footer}
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
