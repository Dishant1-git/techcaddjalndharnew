import { cn } from '../../lib/cn'

/**
 * Placeholder block. Compose these to mirror the real layout — a page-sized
 * spinner tells the user nothing about what is arriving.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn('block animate-pulse rounded-md bg-slate-200/70 motion-reduce:animate-none', className)}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span className={cn('block space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          // A ragged last line reads as text rather than a solid block.
          className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </span>
  )
}

export function SkeletonTable({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="p-5" role="status" aria-label="Loading records">
      <span className="sr-only">Loading records…</span>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4">
            {Array.from({ length: columns }, (_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={cn('h-4 flex-1', columnIndex === 0 && 'max-w-[28%] flex-[2]')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Loading records"
    >
      <span className="sr-only">Loading records…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-lg border border-slate-200 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
