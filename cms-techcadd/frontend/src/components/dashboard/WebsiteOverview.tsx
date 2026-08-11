import { Globe } from 'lucide-react'

import { websiteStatus } from '../../data/mockData'
import { useContentOverview } from '../../features/dashboard/useDashboard'
import { cn } from '../../lib/cn'
import type { BadgeTone, ContentOverviewItem, WebsiteStatus } from '../../types'
import { Badge } from '../common/Badge'
import { Card, CardBody, CardHeader } from '../common/Card'

const barClasses: Record<BadgeTone, string> = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400',
}

const stateMeta: Record<WebsiteStatus['state'], { tone: BadgeTone; label: string }> = {
  online: { tone: 'success', label: 'Online' },
  degraded: { tone: 'warning', label: 'Degraded' },
  offline: { tone: 'danger', label: 'Offline' },
}

export function WebsiteOverview() {
  const { data } = useContentOverview()
  const total = data?.total ?? 0

  // Each row is measured against all content, so the bars compare like with like.
  const contentOverview: ContentOverviewItem[] = [
    { id: 'published', label: 'Published Content', value: data?.published ?? 0, total, tone: 'success' },
    { id: 'draft', label: 'Draft Content', value: data?.draft ?? 0, total, tone: 'warning' },
    { id: 'review', label: 'Pending Review', value: data?.review ?? 0, total, tone: 'info' },
  ]

  return (
    <Card flush className="h-full">
      <CardHeader title="Website Overview" subtitle="Content health across the site" />
      <CardBody className="space-y-5">
        {contentOverview.map((item) => (
          <ProgressRow key={item.id} item={item} />
        ))}

        <StatusPanel status={websiteStatus} />
      </CardBody>
    </Card>
  )
}

function ProgressRow({ item }: { item: ContentOverviewItem }) {
  // No content at all yet — an empty bar rather than NaN.
  const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{item.label}</span>
        <span className="text-sm font-semibold text-slate-900">
          {item.value}
          {item.total > 0 && (
            <span className="ml-1 text-xs font-normal text-slate-400">/ {item.total}</span>
          )}
        </span>
      </div>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={item.label}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-all', barClasses[item.tone])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function StatusPanel({ status }: { status: WebsiteStatus }) {
  const meta = stateMeta[status.state]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-primary-600 ring-1 ring-slate-200">
        <Globe size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{status.label}</p>
        <p className="text-xs leading-relaxed text-slate-500">
          {status.uptime ? `${status.detail} · ${status.uptime}` : status.detail}
        </p>
      </div>
      <Badge tone={meta.tone} withDot>
        {meta.label}
      </Badge>
    </div>
  )
}
