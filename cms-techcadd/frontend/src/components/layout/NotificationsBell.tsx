import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, Inbox } from 'lucide-react'

import { enquiriesApi } from '../../api'
import { formatShortDate } from '../../lib/format'
import { Popover } from '../common/Popover'
import { Spinner } from '../feedback/Spinner'

/**
 * Unread means "enquiries still in the `new` state" — a real notification
 * table would replace this, but the count is at least true today.
 */
function useNewEnquiries() {
  return useQuery({
    queryKey: ['notifications', 'new-enquiries'],
    queryFn: () =>
      enquiriesApi.list({
        page: 1,
        pageSize: 6,
        filters: { status: 'new' },
        sort: { field: 'createdAt', dir: 'desc' },
      }),
  })
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const query = useNewEnquiries()

  const items = query.data?.items ?? []
  const count = query.data?.total ?? 0

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="w-80 p-0"
      trigger={
        <button
          type="button"
          aria-label={count > 0 ? `Notifications, ${count} new` : 'Notifications, none new'}
          aria-expanded={open}
          className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell size={20} aria-hidden="true" />
          {/* The badge only appears when something is genuinely waiting. */}
          {count > 0 && (
            <span
              className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white"
              aria-hidden="true"
            >
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      }
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Notifications</p>
        <p className="text-xs text-slate-500">
          {count === 0 ? 'Nothing needs attention' : `${count} new ${count === 1 ? 'enquiry' : 'enquiries'}`}
        </p>
      </div>

      {query.isLoading ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-slate-500">
          <Spinner />
          Loading…
        </p>
      ) : items.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <span className="mx-auto grid size-10 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Inbox size={18} aria-hidden="true" />
          </span>
          <p className="mt-2 text-sm text-slate-500">You&apos;re all caught up.</p>
        </div>
      ) : (
        <ul className="max-h-72 overflow-y-auto">
          {items.map((enquiry) => (
            <li key={enquiry.id}>
              <Link
                to="/enquiries"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <p className="truncate text-sm font-medium text-slate-900">
                  {enquiry.studentName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {enquiry.courseName} · {formatShortDate(enquiry.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-slate-100 p-1.5">
        <Link
          to="/enquiries"
          onClick={() => setOpen(false)}
          className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-primary-600 hover:bg-primary-50"
        >
          View all enquiries
        </Link>
      </div>
    </Popover>
  )
}
