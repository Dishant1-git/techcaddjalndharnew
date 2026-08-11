import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import { Spinner } from '../components/feedback/Spinner'
import { ConfirmContext, type ConfirmFn, type ConfirmOptions } from './confirmContext'

/**
 * Single mounted dialog driven by a promise, so call sites read as
 * `if (await confirm({...}))` instead of managing their own open state.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [pending, setPending] = useState(false)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const settle = useCallback((result: boolean) => {
    resolveRef.current?.(result)
    resolveRef.current = null
    setOptions(null)
    setPending(false)
  }, [])

  const confirm = useCallback<ConfirmFn>((next) => {
    setOptions(next)
    setPending(false)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const value = useMemo(() => confirm, [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Modal
        open={options !== null}
        onOpenChange={(open) => {
          if (!open) settle(false)
        }}
        title={options?.title ?? ''}
        description={options?.description}
        size="sm"
        dismissible={!pending}
        footer={
          <>
            <Button variant="secondary" disabled={pending} onClick={() => settle(false)}>
              {options?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant={options?.tone === 'neutral' ? 'primary' : 'danger'}
              disabled={pending}
              onClick={() => {
                setPending(true)
                settle(true)
              }}
            >
              {pending && <Spinner />}
              {options?.confirmLabel ?? 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This action cannot be undone. Please confirm you want to continue.
        </p>
      </Modal>
    </ConfirmContext.Provider>
  )
}
