import { Image as ImageIcon } from 'lucide-react'

import { ContentStatusBadge } from '../../components/common/Badge'
import type { Column } from '../../components/data/DataTable'
import { formatShortDate } from '../../lib/format'
import type { Course } from '../../types'
import { assetUrl } from '../../api/client'

const modeLabels: Record<string, string> = {
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
      id: 'mode',
      header: 'Mode',
      hideBelow: 'lg',
      // An em dash, not a blank cell: "nobody has set this" and "the column
      // failed to render" look identical otherwise.
      cell: (course) => (course.mode ? (modeLabels[course.mode] ?? course.mode) : '—'),
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
