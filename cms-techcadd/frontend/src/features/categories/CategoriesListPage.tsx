import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Folder, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'

import { ApiError, type ListParams } from '../../api'
import { ContentStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { SortableList } from '../../components/data/SortableList'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonTable } from '../../components/feedback/Skeleton'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import type { Category } from '../../types'
import { categoryHooks, useCategoryCourseCounts } from './useCategories'

// Categories are hand-ordered, so the whole tree loads at once rather than
// paginating — reordering across pages is meaningless.
const ALL: ListParams = { page: 1, pageSize: 500, sort: { field: 'order', dir: 'asc' } }

export default function CategoriesListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const query = categoryHooks.useList(ALL)
  const update = categoryHooks.useUpdate()
  const remove = categoryHooks.useRemove()
  const counts = useCategoryCourseCounts()

  const [reordering, setReordering] = useState(false)

  const categories = useMemo(() => query.data?.items ?? [], [query.data])
  const roots = categories.filter((category) => !category.parentId)
  const childrenOf = (id: string) => categories.filter((category) => category.parentId === id)

  async function persistOrder(ordered: Category[]) {
    setReordering(true)
    try {
      // The mock API has no bulk endpoint; a real one should take the whole set.
      await Promise.all(
        ordered.map((category, index) =>
          category.order === index
            ? Promise.resolve(category)
            : update.mutateAsync({ id: category.id, input: { order: index } }),
        ),
      )
    } catch {
      toast.error('Could not save the new order')
    } finally {
      setReordering(false)
    }
  }

  async function deleteCategory(category: Category) {
    const used = counts.data?.get(category.id) ?? 0
    const children = childrenOf(category.id).length

    if (used > 0 || children > 0) {
      const reasons = [
        used > 0 ? `${used} ${used === 1 ? 'course' : 'courses'}` : null,
        children > 0 ? `${children} sub${children === 1 ? '-category' : '-categories'}` : null,
      ].filter(Boolean)

      toast.error(`“${category.name}” is still in use`, {
        description: `Move or delete its ${reasons.join(' and ')} first.`,
      })
      return
    }

    const confirmed = await confirm({
      title: `Delete “${category.name}”?`,
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync([category.id])
      toast.success('Category deleted.')
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description={
          query.isLoading
            ? 'Loading…'
            : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'}, drag to reorder`
        }
        actions={
          <Link to="/categories/new">
            <Button icon={Plus}>Add Category</Button>
          </Link>
        }
      />

      <Card flush>
        <CardHeader
          title="Category tree"
          subtitle="Order here controls the order shown on the website"
        />

        {query.isLoading ? (
          <SkeletonTable rows={5} columns={3} />
        ) : query.error ? (
          <div className="p-5">
            <Alert tone="error" title="Could not load categories">
              {(query.error as Error).message}
            </Alert>
          </div>
        ) : roots.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No categories yet"
            description="Categories group courses on the website. Add your first one to get started."
          />
        ) : (
          <CardBody>
            <div aria-busy={reordering}>
              <SortableList
                items={roots}
                getId={(category) => category.id}
                onReorder={persistOrder}
                renderItem={(category) => (
                  <CategoryRow
                    category={category}
                    courseCount={counts.data?.get(category.id) ?? 0}
                    childCount={childrenOf(category.id).length}
                    onEdit={() => navigate(`/categories/${category.id}/edit`)}
                    onDelete={() => deleteCategory(category)}
                  />
                )}
              />
            </div>
          </CardBody>
        )}
      </Card>
    </div>
  )
}

interface CategoryRowProps {
  category: Category
  courseCount: number
  childCount: number
  onEdit: () => void
  onDelete: () => void
}

function CategoryRow({ category, courseCount, childCount, onEdit, onDelete }: CategoryRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="size-3 shrink-0 rounded-full ring-1 ring-slate-200"
        style={{ backgroundColor: category.accentColor ?? '#cbd5e1' }}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{category.name}</p>
        <p className="truncate text-xs text-slate-400">
          /{category.slug}
          {childCount > 0 && ` · ${childCount} sub`}
        </p>
      </div>

      <span className="shrink-0 text-xs text-slate-500">
        {courseCount} {courseCount === 1 ? 'course' : 'courses'}
      </span>

      <ContentStatusBadge status={category.status} />

      <DropdownMenu
        trigger={
          <Button variant="ghost" size="sm" aria-label={`Actions for ${category.name}`}>
            <MoreHorizontal size={16} aria-hidden="true" />
          </Button>
        }
      >
        <DropdownItem icon={Pencil} onSelect={onEdit}>
          Edit
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={Trash2} tone="danger" onSelect={onDelete}>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </div>
  )
}
