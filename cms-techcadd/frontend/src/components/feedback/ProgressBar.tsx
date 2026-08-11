import { cn } from '../../lib/cn'

interface ProgressBarProps {
  /** 0–100. Values outside the range are clamped. */
  value: number
  label: string
  showValue?: boolean
  className?: string
}

export function ProgressBar({ value, label, showValue = false, className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div className={className}>
      {showValue && (
        <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="text-slate-500">{percentage}%</span>
        </div>
      )}

      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full bg-primary-500 transition-all')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
