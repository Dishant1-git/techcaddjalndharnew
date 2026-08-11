import { useContext } from 'react'

import { ConfirmContext, type ConfirmFn } from '../providers/confirmContext'

/**
 * Returns a promise-based confirm:
 *
 * ```ts
 * if (await confirm({ title: 'Delete 3 courses?' })) remove(ids)
 * ```
 */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm must be used inside <ConfirmProvider>.')
  return confirm
}
