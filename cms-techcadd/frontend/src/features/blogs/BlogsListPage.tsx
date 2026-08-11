import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Image as ImageIcon, MoreHorizontal, Newspaper, Pencil, Plus, Trash2 } from 'lucide-react'

import { ApiError } from '../../api'
import { Badge, ContentStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { DataTable, type Column } from '../../components/data/DataTable'
import { FilterBar } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { Tabs } from '../../components/data/Tabs'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import { formatShortDate } from '../../lib/format'
import type { Blog } from '../../types'
import { readingTimeMinutes } from './blogSchema'
import { blogHooks } from './useBlogs'
import { assetUrl } from '../../api/client'

const TABS = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
]

export default function BlogsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const list = useListParams({
    filterKeys: ['status'],
    defaultSort: { field: 'updatedAt', dir: 'desc' },
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const query = blogHooks.useList(list.params)
  const remove = blogHooks.useRemove()

  const columns = useMemo<Column<Blog>[]>(
    () => [
      {
        id: 'title',
        header: 'Article',
        primary: true,
        sortable: true,
        cell: (blog) => (
          <div className="flex items-center gap-3">
            {blog.coverImage ? (
              <img
                src={assetUrl(blog.coverImage.url)}
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
              <p className="truncate font-medium text-slate-900">{blog.title}</p>
              <p className="truncate text-xs text-slate-400">/{blog.slug}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'tags',
        header: 'Tags',
        hideBelow: 'xl',
        cell: (blog) =>
          blog.tags.length === 0 ? (
            <span className="text-slate-400">—</span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {blog.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} tone="neutral">
                  {tag}
                </Badge>
              ))}
              {blog.tags.length > 2 && (
                <span className="text-xs text-slate-400">+{blog.tags.length - 2}</span>
              )}
            </span>
          ),
      },
      {
        id: 'readingTime',
        header: 'Read',
        hideBelow: 'lg',
        cell: (blog) => (
          <span className="whitespace-nowrap text-slate-500">
            {readingTimeMinutes(blog.body)} min
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        cell: (blog) => <ContentStatusBadge status={blog.status} />,
      },
      {
        id: 'publishDate',
        header: 'Published',
        sortable: true,
        hideBelow: 'lg',
        cell: (blog) =>
          blog.publishDate ? (
            <span className="whitespace-nowrap text-slate-500">
              {formatShortDate(blog.publishDate)}
            </span>
          ) : (
            <span className="text-slate-400">Not scheduled</span>
          ),
      },
    ],
    [],
  )

  async function deleteBlogs(ids: string[], label: string) {
    const confirmed = await confirm({ title: `Delete ${label}?`, confirmLabel: 'Delete' })
    if (!confirmed) return

    try {
      await remove.mutateAsync(ids)
      setSelectedIds([])
      toast.success(`Deleted ${label}.`)
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  const rows = query.data?.items ?? []
  const total = query.data?.total ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blogs"
        description={
          query.isLoading ? 'Loading…' : `${total} ${total === 1 ? 'article' : 'articles'} in total`
        }
        actions={
          <Link to="/blogs/new">
            <Button icon={Plus}>Add Blog</Button>
          </Link>
        }
      />

      <Card flush>
        <Tabs
          value={list.filters.status ?? ''}
          onValueChange={(value) => list.setFilter('status', value || undefined)}
          items={TABS}
        />

        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search articles by title, excerpt or tag"
        />

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-primary-50/60 px-5 py-2.5">
            <p className="text-sm font-medium text-primary-900">{selectedIds.length} selected</p>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() =>
                deleteBlogs(
                  selectedIds,
                  `${selectedIds.length} ${selectedIds.length === 1 ? 'article' : 'articles'}`,
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
          rows={rows}
          columns={columns}
          getRowId={(blog) => blog.id}
          caption="All blog articles with their tags, status and publish date"
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          sort={list.sort}
          onSortChange={list.setSort}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(blog) => navigate(`/blogs/${blog.id}/edit`)}
          emptyIcon={Newspaper}
          emptyTitle={list.search ? 'No matching articles' : 'No articles yet'}
          emptyDescription={
            list.search
              ? 'Try a different search term.'
              : 'Write your first article to start the blog.'
          }
          rowActions={(blog) => (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Actions for ${blog.title}`}>
                  <MoreHorizontal size={16} aria-hidden="true" />
                </Button>
              }
            >
              <DropdownItem icon={Pencil} onSelect={() => navigate(`/blogs/${blog.id}/edit`)}>
                Edit
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                icon={Trash2}
                tone="danger"
                onSelect={() => deleteBlogs([blog.id], blog.title)}
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
