import { Star } from 'lucide-react'

import { cn } from '../../lib/cn'
import { useFieldContext } from './field'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  max?: number
  /** Renders as static output — no buttons, no focus stops. */
  readOnly?: boolean
  size?: number
  className?: string
}

export function StarRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  size = 20,
  className,
}: StarRatingProps) {
  const field = useFieldContext()
  const stars = Array.from({ length: max }, (_, index) => index + 1)

  if (readOnly) {
    return (
      <span className={cn('inline-flex items-center gap-0.5', className)}>
        {stars.map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">
          {value} out of {max} stars
        </span>
      </span>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      aria-describedby={field?.describedBy}
      className={cn('inline-flex items-center gap-1', className)}
    >
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
          onClick={() => onChange?.(star)}
          className="rounded p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  )
}
