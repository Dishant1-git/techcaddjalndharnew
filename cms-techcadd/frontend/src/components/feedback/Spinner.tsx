import { Loader2 } from 'lucide-react'

import { cn } from '../../lib/cn'

/** Inline only — buttons and small async regions. Pages get skeletons. */
export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin motion-reduce:animate-none', className)}
      aria-hidden="true"
    />
  )
}
