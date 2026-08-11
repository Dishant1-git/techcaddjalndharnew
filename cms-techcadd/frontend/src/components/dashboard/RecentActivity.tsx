import {
  BookOpen,
  FileText,
  History,
  Newspaper,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useRecentActivity, type ActivityEntry } from '../../features/dashboard/useDashboard'
import { formatShortDate } from '../../lib/format'
import { Card, CardBody, CardHeader } from '../common/Card'
import { EmptyState } from '../common/EmptyState'

const kindMeta: Record<ActivityEntry['kind'], { icon: LucideIcon; className: string }> = {
  course: { icon: BookOpen, className: 'bg-primary-50 text-primary-600' },
  blog: { icon: Newspaper, className: 'bg-emerald-50 text-emerald-600' },
  page: { icon: FileText, className: 'bg-slate-100 text-slate-600' },
}

export function RecentActivity() {
  const { data } = useRecentActivity()
  const recentActivities = data ?? []

  return (
    <Card flush className="h-full">
      <CardHeader title="Recent Activity" subtitle="Latest changes made in the CMS" />
      {recentActivities.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity yet"
          description="Edits made in the CMS will be logged here as they happen."
        />
      ) : (
      <CardBody>
        <ol className="relative space-y-5">
          {recentActivities.map((activity, index) => {
            const { icon: Icon, className } = kindMeta[activity.kind]
            const isLast = index === recentActivities.length - 1

            return (
              <li key={activity.id} className="relative flex gap-3">
                {!isLast && (
                  <span
                    className="absolute top-9 left-4 h-full w-px -translate-x-1/2 bg-slate-100"
                    aria-hidden="true"
                  />
                )}

                <span
                  className={`relative grid size-8 shrink-0 place-items-center rounded-full ${className}`}
                >
                  <Icon size={15} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1 pb-1">
                  <p className="truncate text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{activity.title}</span>
                  </p>
                  {/* Derived from the record's own timestamp — there is no audit
                      log, so the actor is genuinely unknown. */}
                  <p className="mt-0.5 text-xs text-slate-400">
                    {activity.kind} updated · {formatShortDate(activity.updatedAt)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </CardBody>
      )}
    </Card>
  )
}
