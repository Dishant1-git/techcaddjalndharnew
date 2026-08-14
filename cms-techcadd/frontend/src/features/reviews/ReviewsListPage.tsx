import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Pencil, Plus, Star, Trash2 } from 'lucide-react'

import { ApiError, type ListParams } from '../../api'
import { Badge, ContentStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { DataTable, type Column } from '../../components/data/DataTable'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import type { Review } from '../../types'
import { SOURCE_OPTIONS } from './reviewSchema'
import { reviewHooks } from './useReviews'

/** Hand-ordered and few, so the whole set loads at once. */
const ALL: ListParams = { page: 1, pageSize: 500, sort: { field: 'order', dir: 'asc' } }

export default function ReviewsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const query = reviewHooks.useList(ALL)
  const remove = reviewHooks.useRemove()

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const reviews = useMemo(() => query.data?.items ?? [], [query.data])

  async function deleteReview(review: Review) {
    const confirmed = await confirm({
      title: `Delete the review from ${review.authorName}?`,
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync([review.id])
      toast.success('Review deleted.')
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  const columns: Column<Review>[] = [
    {
      id: 'author',
      header: 'Review',
      cell: (review) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{review.authorName}</p>
          <p className="truncate text-xs text-slate-500">{review.quote}</p>
        </div>
      ),
    },
    {
      id: 'rating',
      header: 'Rating',
      cell: (review) => (
        <span className="whitespace-nowrap text-amber-500" aria-label={`${review.rating} out of 5`}>
          {'★'.repeat(review.rating)}
          <span className="text-slate-300">{'★'.repeat(5 - review.rating)}</span>
        </span>
      ),
    },
    {
      id: 'source',
      header: 'Source',
      cell: (review) => (
        <Badge tone={review.source === 'google' ? 'primary' : 'neutral'}>
          {SOURCE_OPTIONS.find((option) => option.value === review.source)?.label ?? review.source}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (review) => <ContentStatusBadge status={review.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="What students said, and where they said it"
        actions={
          <Link to="/reviews/new">
            <Button icon={Plus}>Add review</Button>
          </Link>
        }
      />

      <Card flush>
        <DataTable
          rows={reviews}
          columns={columns}
          getRowId={(review) => review.id}
          caption="Student reviews with their rating, source and status"
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(review) => navigate(`/reviews/${review.id}/edit`)}
          emptyIcon={Star}
          emptyTitle="No reviews yet"
          emptyDescription="Add the reviews students have left and they will appear on the site."
          rowActions={(review) => (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Actions for ${review.authorName}`}>
                  <MoreHorizontal size={16} />
                </Button>
              }
            >
              <DropdownItem icon={Pencil} onSelect={() => navigate(`/reviews/${review.id}/edit`)}>
                Edit
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={Trash2} tone="danger" onSelect={() => deleteReview(review)}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          )}
        />
      </Card>
    </div>
  )
}
