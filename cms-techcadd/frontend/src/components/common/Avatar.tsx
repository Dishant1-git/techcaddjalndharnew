import { cn } from '../../lib/cn'

interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
} as const

/** "Priya Sharma" → "PS"; single-word names keep their first two letters. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('shrink-0 rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-primary-100 font-semibold text-primary-700',
        sizeClasses[size],
        className,
      )}
      // The name is always adjacent in the UI, so the fallback is decorative.
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  )
}
