import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '../../lib/cn'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: ModalSize
  children: ReactNode
  /** Right-aligned action row pinned below the body. */
  footer?: ReactNode
  /** Suppresses outside-click and Escape — use while a submit is in flight. */
  dismissible?: boolean
  className?: string
}

/**
 * Radix Dialog handles the focus trap, Escape, scroll lock and focus restore —
 * the parts hand-rolled modals reliably get wrong.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
  footer,
  dismissible = true,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50" />

        <Dialog.Content
          onInteractOutside={(event) => {
            if (!dismissible) event.preventDefault()
          }}
          onEscapeKeyDown={(event) => {
            if (!dismissible) event.preventDefault()
          }}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl',
            sizeClasses[size],
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

            {dismissible && (
              <Dialog.Close
                aria-label="Close dialog"
                className="-m-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} aria-hidden="true" />
              </Dialog.Close>
            )}
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
