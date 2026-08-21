import { Link } from 'react-router-dom'
import { SITE_LABEL } from '../../config/brand'
import { CalendarDays, Mail, Plus } from 'lucide-react'

import { BookOpen, ClipboardCheck } from 'lucide-react'

import { useTodaySnapshot } from '../../features/dashboard/useDashboard'
import { useAuth } from '../../hooks/useAuth'
import { formatLongDate } from '../../lib/format'
import { Button } from '../common/Button'

export function WelcomeSection() {
  const now = new Date()
  const { session } = useAuth()

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            <CalendarDays size={14} className="text-primary-500" aria-hidden="true" />
            <time dateTime={now.toISOString().slice(0, 10)}>{formatLongDate(now)}</time>
          </p>

          <h2 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">
            Welcome back, {session?.name ?? 'there'} <span aria-hidden="true"></span>
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Here&apos;s what&apos;s happening with the {SITE_LABEL} today.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/courses">
              <Button icon={Plus}>Add Course</Button>
            </Link>
            <Link to="/enquiries">
              <Button variant="secondary">View Enquiries</Button>
            </Link>
          </div>
        </div>

        <TodayPanel />
      </div>
    </section>
  )
}

function TodayPanel() {
  const { data } = useTodaySnapshot()

  const tiles = [
    { id: 'new-enquiries', label: 'New enquiries', value: data?.newEnquiries ?? 0, icon: Mail },
    { id: 'pending-review', label: 'Pending review', value: data?.pendingReview ?? 0, icon: ClipboardCheck },
    { id: 'live-courses', label: 'Live courses', value: data?.liveCourses ?? 0, icon: BookOpen },
  ]

  return (
    <div className="rounded-xl bg-primary-50/70 p-4 ring-1 ring-primary-100 lg:w-80">
      <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
        Today at a glance
      </p>

      <dl className="mt-3 grid grid-cols-3 gap-3">
        {tiles.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="rounded-lg bg-white p-3 text-center ring-1 ring-white">
              <Icon size={16} className="mx-auto text-primary-500" aria-hidden="true" />
              <dd className="mt-1.5 text-lg font-semibold text-slate-900">{item.value}</dd>
              <dt className="text-[11px] leading-tight text-slate-500">{item.label}</dt>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
