import { Link } from 'react-router-dom'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '../../lib/cn'
import type { Stat, TrendDirection } from '../../types'

const trendMeta: Record<TrendDirection, { icon: typeof TrendingUp; className: string }> = {
  up: { icon: TrendingUp, className: 'text-emerald-600 bg-emerald-50' },
  down: { icon: TrendingDown, className: 'text-rose-600 bg-rose-50' },
  flat: { icon: Minus, className: 'text-slate-500 bg-slate-100' },
}

export function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon
  const trend = stat.trend ? trendMeta[stat.trend] : null

  return (
    <Link
      to={stat.path}
      className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-primary-300"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-500 group-hover:text-white">
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
        {stat.value.toLocaleString('en-IN')}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {trend ? (
          <>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                trend.className,
              )}
            >
              <trend.icon size={12} aria-hidden="true" />
              {stat.trend === 'flat' ? '0%' : `${stat.change}%`}
            </span>
            <span className="text-xs text-slate-500">{stat.comparison}</span>
          </>
        ) : (
          /* No comparison period yet — say so rather than showing a fake 0%. */
          <span className="text-xs text-slate-400">No activity recorded yet</span>
        )}
      </div>
    </Link>
  )
}
