import { Image as ImageIcon } from 'lucide-react'

import { ContentStatusBadge } from '../../components/common/Badge'
import type { Column } from '../../components/data/DataTable'
import { formatShortDate } from '../../lib/format'
import type { Course } from '../../types'
import { assetUrl } from '../../api/client'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const modeLabels: Record<Course['mode'], string> = {
  online: 'Online',
  offline: 'Offline',
  hybrid: 'Hybrid',
}

export function buildCourseColumns(
  categoryNameById: Map<string, string>,
): Column<Course>[] {
  return [
    {
      id: 'title',
      header: 'Course',
      primary: true,
      sortable: true,
      cell: (course) => (
        <div className="flex items-center gap-3">
          {course.thumbnail ? (
            <img
              src={assetUrl(course.thumbnail.url)}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded object-cover"
            />
          ) : (
            <span
              className="grid size-10 shrink-0 place-items-center rounded bg-slate-100 text-slate-400"
              aria-hidden="true"
            >
              <ImageIcon size={16} />
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{course.title}</p>
            <p className="truncate text-xs text-slate-400">/{course.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'categoryId',
      header: 'Category',
      hideBelow: 'lg',
      cell: (course) =>
        course.categoryId ? (
          (categoryNameById.get(course.categoryId) ?? '—')
        ) : (
          <span className="text-slate-400">Uncategorised</span>
        ),
    },
    {
      id: 'duration',
      header: 'Duration',
      hideBelow: 'xl',
      cell: (course) => course.duration,
    },
    {
      id: 'fee',
      header: 'Fee',
      sortable: true,
      align: 'right',
      cell: (course) => (
        <span className="whitespace-nowrap">
          {course.discountedFee !== undefined ? (
            <>
              <span className="font-medium text-slate-900">
                {currency.format(course.discountedFee)}
              </span>
              <s className="ml-1.5 text-xs text-slate-400">{currency.format(course.fee)}</s>
            </>
          ) : (
            currency.format(course.fee)
          )}
        </span>
      ),
    },
    {
      id: 'mode',
      header: 'Mode',
      hideBelow: 'lg',
      cell: (course) => modeLabels[course.mode],
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      cell: (course) => <ContentStatusBadge status={course.status} />,
    },
    {
      id: 'updatedAt',
      header: 'Updated',
      sortable: true,
      hideBelow: 'xl',
      cell: (course) => (
        <span className="whitespace-nowrap text-slate-500">
          {formatShortDate(course.updatedAt)}
        </span>
      ),
    },
  ]
}
