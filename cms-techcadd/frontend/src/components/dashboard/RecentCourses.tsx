import { Link } from 'react-router-dom'
import { BookOpen, Eye, Image as ImageIcon, Users } from 'lucide-react'

import { useRecentCourses } from '../../features/dashboard/useDashboard'
import type { Course } from '../../types'
import { ContentStatusBadge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card, CardBody, CardHeader } from '../common/Card'
import { EmptyState } from '../common/EmptyState'
import { assetUrl } from '../../api/client'

export function RecentCourses() {
  const { data } = useRecentCourses()
  const popularCourses = data?.items ?? []

  return (
    <Card flush>
      <CardHeader
        title="Recent Courses"
        subtitle="Most recently updated"
        action={
          <Link to="/courses">
            <Button variant="secondary" size="sm">
              View all
            </Button>
          </Link>
        }
      />
      {popularCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Add your first course and it will show up here."
        />
      ) : (
        <CardBody>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {popularCourses.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        </CardBody>
      )}
    </Card>
  )
}

function CourseCard({ course }: { course: Course }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 transition-colors hover:border-primary-300">
      {/* Image placeholder until the media library is wired up. */}
      <div className="h-24 border-b border-slate-100 bg-slate-50">
        {course.thumbnail?.url ? (
          <img src={assetUrl(course.thumbnail.url)} alt="" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-slate-300" aria-hidden="true">
            <ImageIcon size={20} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-sm font-semibold text-slate-900" title={course.title}>
          {course.title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">{course.duration}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Users size={14} className="text-slate-400" aria-hidden="true" />
            {course.mode}
          </span>
          <ContentStatusBadge status={course.status} />
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            fullWidth
            aria-label={`View course ${course.title}`}
          >
            View
          </Button>
        </div>
      </div>
    </article>
  )
}
