import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Copy, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'

import { ApiError } from '../../api'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { DataTable } from '../../components/data/DataTable'
import { FilterBar, type ActiveFilter } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { Select } from '../../components/form/Select'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import type { Course } from '../../types'
import { buildCourseColumns } from './courseColumns'
import { LEVEL_OPTIONS, MODE_OPTIONS, STATUS_OPTIONS } from './courseSchema'
import {
  useCourseReferenceData,
  useCoursesList,
  useCreateCourse,
  useDeleteCourses,
} from './useCourses'

const FILTER_KEYS = ['status', 'mode', 'level', 'categoryId'] as const

export default function CoursesListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const list = useListParams({
    filterKeys: FILTER_KEYS,
    defaultSort: { field: 'updatedAt', dir: 'desc' },
  })

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { categoryOptions } = useCourseReferenceData()
  const query = useCoursesList(list.params)
  const remove = useDeleteCourses()
  const create = useCreateCourse()

  const categoryNameById = useMemo(
    () => new Map(categoryOptions.map((option) => [option.value, option.label])),
    [categoryOptions],
  )

  const columns = useMemo(() => buildCourseColumns(categoryNameById), [categoryNameById])

  const activeFilters: ActiveFilter[] = FILTER_KEYS.flatMap((key) => {
    const value = list.filters[key]
    if (!value) return []

    const label = { status: 'Status', mode: 'Mode', level: 'Level', categoryId: 'Category' }[key]
    const options = {
      status: STATUS_OPTIONS,
      mode: MODE_OPTIONS,
      level: LEVEL_OPTIONS,
      categoryId: categoryOptions,
    }[key]

    return [
      {
        key,
        label,
        value: options.find((option) => option.value === value)?.label ?? value,
        onRemove: () => list.setFilter(key, undefined),
      },
    ]
  })

  async function deleteCourses(ids: string[], label: string) {
    const confirmed = await confirm({
      title: `Delete ${label}?`,
      description: 'Deleted courses are removed from the website immediately.',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync(ids)
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)))
      toast.success(`Deleted ${label}.`)
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  async function duplicate(course: Course) {
    const { id, createdAt, updatedAt, ...rest } = course
    void id
    void createdAt
    void updatedAt

    try {
      const copy = await create.mutateAsync({
        ...rest,
        title: `${course.title} (copy)`,
        slug: `${course.slug}-copy`,
        status: 'draft',
      })
      toast.success('Course duplicated.', {
        action: { label: 'Edit copy', onClick: () => navigate(`/courses/${copy.id}/edit`) },
      })
    } catch (error) {
      toast.error('Could not duplicate', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  const total = query.data?.total ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description={
          query.isLoading ? 'Loading…' : `${total} ${total === 1 ? 'course' : 'courses'} in total`
        }
        actions={
          <Link to="/courses/new">
            <Button icon={Plus}>Add Course</Button>
          </Link>
        }
      />

      <Card flush>
        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search courses by title, slug or highlight"
          activeFilters={activeFilters}
          onClearAll={activeFilters.length > 0 ? list.clearFilters : undefined}
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
                className="h-9 w-auto min-w-32"
                aria-label="Filter by mode"
                options={MODE_OPTIONS}
                placeholder="All modes"
                value={list.filters.mode ?? ''}
                onChange={(event) => list.setFilter('mode', event.target.value || undefined)}
              />
              <Select
                className="h-9 w-auto min-w-32"
                aria-label="Filter by level"
                options={LEVEL_OPTIONS}
                placeholder="All levels"
                value={list.filters.level ?? ''}
                onChange={(event) => list.setFilter('level', event.target.value || undefined)}
              />
              {categoryOptions.length > 0 && (
                <Select
                  className="h-9 w-auto min-w-36"
                  aria-label="Filter by category"
                  options={categoryOptions}
                  placeholder="All categories"
                  value={list.filters.categoryId ?? ''}
                  onChange={(event) => list.setFilter('categoryId', event.target.value || undefined)}
                />
              )}
            </>
          }
        />

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-primary-50/60 px-5 py-2.5">
            <p className="text-sm font-medium text-primary-900">
              {selectedIds.length} selected
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() =>
                deleteCourses(
                  selectedIds,
                  `${selectedIds.length} ${selectedIds.length === 1 ? 'course' : 'courses'}`,
                )
              }
            >
              Delete
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              Clear selection
            </button>
          </div>
        )}

        <DataTable
          rows={query.data?.items ?? []}
          columns={columns}
          getRowId={(course) => course.id}
          caption="All courses with their category, fee, mode and status"
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          sort={list.sort}
          onSortChange={list.setSort}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(course) => navigate(`/courses/${course.id}/edit`)}
          emptyIcon={BookOpen}
          emptyTitle={
            list.search || activeFilters.length > 0 ? 'No matching courses' : 'No courses yet'
          }
          emptyDescription={
            list.search || activeFilters.length > 0
              ? 'Try a different search term or clear the filters.'
              : 'Add your first course and it will appear here.'
          }
          rowActions={(course) => (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Actions for ${course.title}`}>
                  <MoreHorizontal size={16} aria-hidden="true" />
                </Button>
              }
            >
              <DropdownItem icon={Pencil} onSelect={() => navigate(`/courses/${course.id}/edit`)}>
                Edit
              </DropdownItem>
              <DropdownItem icon={Copy} onSelect={() => duplicate(course)}>
                Duplicate
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                icon={Trash2}
                tone="danger"
                onSelect={() => deleteCourses([course.id], course.title)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          )}
        />

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
