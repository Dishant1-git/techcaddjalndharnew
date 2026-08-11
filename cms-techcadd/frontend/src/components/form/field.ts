import { createContext, useContext } from 'react'

export interface FieldContextValue {
  id: string
  describedBy?: string
  invalid: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

/**
 * Controls read their id and `aria-describedby` from here so the wiring between
 * label, hint and error message cannot drift out of sync.
 *
 * Lives outside `FormField.tsx` because a module that exports both components
 * and non-components breaks fast refresh.
 */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext)
}

/** Shared control chrome so every input type looks identical. */
export const controlClasses =
  'w-full rounded-lg border bg-white text-sm text-slate-900 transition-colors placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

export function controlBorder(invalid: boolean): string {
  return invalid
    ? 'border-rose-300 focus:border-rose-400 focus:outline-rose-500'
    : 'border-slate-200 hover:border-slate-300 focus:border-primary-400'
}
