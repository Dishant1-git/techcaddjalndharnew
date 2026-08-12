import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquareQuote, MoreHorizontal, Pencil, Play, Plus, Star, Trash2 } from 'lucide-react'

import { ApiError } from '../../api'
import { Avatar } from '../../components/common/Avatar'
import { Badge, ContentStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { EmptyState } from '../../components/common/EmptyState'
import { FilterBar } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonCards } from '../../components/feedback/Skeleton'
import { Select } from '../../components/form/Select'
import { StarRating } from '../../components/form/StarRating'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import type { Testimonial } from '../../types'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { RATING_OPTIONS } from './testimonialSchema'
import { courseRefHooks, testimonialHooks } from './useTestimonials'
import { assetUrl } from '../../api/client'

const FILTER_KEYS = ['status', 'rating', 'courseId', 'featured'] as const

export default function TestimonialsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const list = useListParams({
    filterKeys: FILTER_KEYS,
    defaultSort: { field: 'updatedAt', dir: 'desc' },
  })

  const query = testimonialHooks.useList(list.params)
  const remove = testimonialHooks.useRemove()
  const update = testimonialHooks.useUpdate()
  const courses = courseRefHooks.useList({ page: 1, pageSize: 200 })

  const courseNameById = useMemo(
    () => new Map((courses.data?.items ?? []).map((course) => [course.id, course.title])),
    [courses.data],
  )

  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0

  async function deleteTestimonial(testimonial: Testimonial) {
    const confirmed = await confirm({
      title: `Delete the testimonial from ${testimonial.studentName}?`,
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync([testimonial.id])
      toast.success('Testimonial deleted.')
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  async function toggleFeatured(testimonial: Testimonial) {
    try {
      await update.mutateAsync({
        id: testimonial.id,
        input: { featured: !testimonial.featured },
      })
      toast.success(testimonial.featured ? 'Removed from featured.' : 'Marked as featured.')
    } catch {
      toast.error('Could not update this testimonial')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description={
          query.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'testimonial' : 'testimonials'} in total`
        }
        actions={
          <Link to="/testimonials/new">
            <Button icon={Plus}>Add Testimonial</Button>
          </Link>
        }
      />

      <Card flush>
        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search by student name or quote"
          onClearAll={list.activeFilterCount > 0 ? list.clearFilters : undefined}
          filters={
            <>
              <Select
                className="h-9 w-auto min-w-32"
                aria-label="Filter by status"
                options={STATUS_OPTIONS}
                placeholder="All statuses"
                value={list.filters.status ?? ''}
                onChange={(event) => list.setFilter('status', event.target.value || undefined)}
              />
              <Select
                className="h-9 w-auto min-w-28"
                aria-label="Filter by rating"
                options={RATING_OPTIONS}
                placeholder="Any rating"
                value={list.filters.rating ?? ''}
                onChange={(event) => list.setFilter('rating', event.target.value || undefined)}
              />
              <Select
                className="h-9 w-auto min-w-32"
                aria-label="Filter by featured"
                options={[
                  { value: 'true', label: 'Featured only' },
                  { value: 'false', label: 'Not featured' },
                ]}
                placeholder="All"
                value={list.filters.featured ?? ''}
                onChange={(event) => list.setFilter('featured', event.target.value || undefined)}
              />
            </>
          }
        />

        {query.isLoading ? (
          <SkeletonCards count={6} />
        ) : query.error ? (
          <div className="p-5">
            <Alert tone="error" title="Could not load testimonials">
              {(query.error as Error).message}
            </Alert>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title={
              list.search || list.activeFilterCount > 0
                ? 'No matching testimonials'
                : 'No testimonials yet'
            }
            description={
              list.search || list.activeFilterCount > 0
                ? 'Try a different search term or clear the filters.'
                : 'Student testimonials build trust on the website. Add your first one.'
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((testimonial) => (
              <li key={testimonial.id}>
                <TestimonialCard
                  testimonial={testimonial}
                  courseName={
                    testimonial.courseId ? courseNameById.get(testimonial.courseId) : undefined
                  }
                  onEdit={() => navigate(`/testimonials/${testimonial.id}/edit`)}
                  onDelete={() => deleteTestimonial(testimonial)}
                  onToggleFeatured={() => toggleFeatured(testimonial)}
                />
              </li>
            ))}
          </ul>
        )}

        {total > 0 && (
          <Pagination
            page={list.page}
            pageSize={list.pageSize}
            total={total}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        )}
      </Card>
    </div>
  )
}

interface TestimonialCardProps {
  testimonial: Testimonial
  courseName?: string
  onEdit: () => void
  onDelete: () => void
  onToggleFeatured: () => void
}

function TestimonialCard({
  testimonial,
  courseName,
  onEdit,
  onDelete,
  onToggleFeatured,
}: TestimonialCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <Avatar name={testimonial.studentName} src={assetUrl(testimonial.photo?.url)} size="sm" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{testimonial.studentName}</p>
          <p className="truncate text-xs text-slate-500">
            {courseName ?? 'No course linked'}
            {testimonial.batch && ` · ${testimonial.batch}`}
          </p>
        </div>

        <DropdownMenu
          trigger={
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Actions for the testimonial from ${testimonial.studentName}`}
            >
              <MoreHorizontal size={16} aria-hidden="true" />
            </Button>
          }
        >
          <DropdownItem icon={Pencil} onSelect={onEdit}>
            Edit
          </DropdownItem>
          <DropdownItem icon={Star} onSelect={onToggleFeatured}>
            {testimonial.featured ? 'Unfeature' : 'Mark as featured'}
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={Trash2} tone="danger" onSelect={onDelete}>
            Delete
          </DropdownItem>
        </DropdownMenu>
      </div>

      <StarRating value={testimonial.rating} readOnly size={14} className="mt-3" />

      <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
        <p className="line-clamp-4">“{testimonial.quote}”</p>
      </blockquote>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <ContentStatusBadge status={testimonial.status} />
        {testimonial.featured && <Badge tone="primary">Featured</Badge>}
        {testimonial.videoUrl && (
          <a
            href={testimonial.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600"
          >
            <Play size={12} aria-hidden="true" />
            Video
          </a>
        )}
      </div>
    </article>
  )
}
