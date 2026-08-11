import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Joins class names and resolves conflicting Tailwind utilities so the last one
 * wins — without this, `cn('p-2', 'p-4')` emits both and the winner depends on
 * stylesheet order.
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}
