import { Link } from 'react-router-dom'
import { Eye, Inbox } from 'lucide-react'

import { useRecentEnquiries } from '../../features/dashboard/useDashboard'
import { formatShortDate } from '../../lib/format'
import type { EnquiryRecord } from '../../types'
import { EnquiryStatusBadge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card, CardHeader } from '../common/Card'
import { EmptyState } from '../common/EmptyState'

const columns = ['Student Name', 'Phone', 'Course', 'Status', 'Date', 'Action'] as const

export function RecentEnquiries() {
  const { data } = useRecentEnquiries()
  const recentEnquiries = data?.items ?? []

  return (
    <Card flush>
      <CardHeader
        title="Recent Enquiries"
        subtitle="Latest admission enquiries"
        action={
          <Link to="/enquiries">
            <Button variant="secondary" size="sm">
              View all
            </Button>
          </Link>
        }
      />

      {recentEnquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No enquiries yet"
          description="Enquiries submitted through the website will land here."
        />
      ) : (
        <EnquiriesTable rows={recentEnquiries} />
      )}
    </Card>
  )
}

/** Horizontal scroll keeps every column readable on small screens. */
function EnquiriesTable({ rows }: { rows: EnquiryRecord[] }) {
  return (
      <div className="scrollbar-slim overflow-x-auto">
        <table className="w-full min-w-215 border-collapse text-left text-sm">
          <caption className="sr-only">
            The most recent admission enquiries with their current status
          </caption>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-5 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((enquiry) => (
              <tr
                key={enquiry.id}
                className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/60"
              >
                <th scope="row" className="px-5 py-3.5 text-left font-medium text-slate-900">
                  {enquiry.studentName}
                  <span className="mt-0.5 block text-xs font-normal text-slate-400">
                    {enquiry.id}
                  </span>
                </th>
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                  <a href={`tel:${enquiry.phone.replace(/\s/g, '')}`} className="hover:text-primary-600">
                    {enquiry.phone}
                  </a>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{enquiry.courseName}</td>
                <td className="px-5 py-3.5">
                  <EnquiryStatusBadge status={enquiry.status} />
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                  {formatShortDate(enquiry.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    aria-label={`View enquiry from ${enquiry.studentName}`}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  )
}
