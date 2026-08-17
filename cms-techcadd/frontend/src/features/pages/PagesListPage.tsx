import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, FileText, Lock, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'

import { ApiError } from '../../api'
import { SITE_URL } from '../../config/siteMap'
import { ContentStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { DataTable, type Column } from '../../components/data/DataTable'
import { FilterBar } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { Select } from '../../components/form/Select'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import { formatShortDate } from '../../lib/format'
import type { Page } from '../../types'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { TEMPLATE_OPTIONS } from './pageSchema'
import { pageHooks } from './usePages'

const FILTER_KEYS = ['status', 'template'] as const

export default function PagesListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const list = useListParams({
    filterKeys: FILTER_KEYS,
    defaultSort: { field: 'updatedAt', dir: 'desc' },
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const query = pageHooks.useList(list.params)
  const remove = pageHooks.useRemove()

  const columns = useMemo<Column<Page>[]>(
    () => [
      {
        id: 'title',
        header: 'Page',
        primary: true,
        sortable: true,
        cell: (page) => (
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium text-slate-900">
              {page.title}
              {page.system && (
                <Lock size={12} className="shrink-0 text-slate-400" aria-label="System page" />
              )}
            </p>
            <p className="truncate text-xs text-slate-400">/{page.slug}</p>
          </div>
        ),
      },
      {
        id: 'template',
        header: 'Template',
        hideBelow: 'lg',
        cell: (page) =>
          TEMPLATE_OPTIONS.find((option) => option.value === page.template)?.label ?? page.template,
      },
      { id: 'status', header: 'Status', sortable: true, cell: (page) => <ContentStatusBadge status={page.status} /> },
      {
        id: 'updatedAt',
        header: 'Updated',
        sortable: true,
        hideBelow: 'xl',
        cell: (page) => (
          <span className="whitespace-nowrap text-slate-500">{formatShortDate(page.updatedAt)}</span>
        ),
      },
    ],
    [],
  )

  async function deletePages(pages: Page[]) {
    // System pages are structural — the public site breaks without them.
    const locked = pages.filter((page) => page.system)
    const deletable = pages.filter((page) => !page.system)

    if (locked.length > 0 && deletable.length === 0) {
      toast.error('System pages cannot be deleted', {
        description: `${locked.map((page) => page.title).join(', ')} ${locked.length === 1 ? 'is' : 'are'} required by the website.`,
      })
      return
    }

    const label = `${deletable.length} ${deletable.length === 1 ? 'page' : 'pages'}`
    const confirmed = await confirm({
      title: `Delete ${deletable.length === 1 ? `“${deletable[0].title}”` : label}?`,
      description:
        locked.length > 0
          ? `${locked.length} system ${locked.length === 1 ? 'page' : 'pages'} will be skipped.`
          : 'The page will be removed from the website immediately.',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync(deletable.map((page) => page.id))
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
        title="Pages"
        description={query.isLoading ? 'Loading…' : `${total} ${total === 1 ? 'page' : 'pages'} in total`}
        actions={
          <Link to="/pages/new">
            <Button icon={Plus}>Add Page</Button>
          </Link>
        }
      />

      <Card flush>
        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search pages by title or slug"
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
                className="h-9 w-auto min-w-32"
                aria-label="Filter by template"
                options={TEMPLATE_OPTIONS}
                placeholder="All templates"
                value={list.filters.template ?? ''}
                onChange={(event) => list.setFilter('template', event.target.value || undefined)}
              />
            </>
          }
        />

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-primary-50/60 px-5 py-2.5">
            <p className="text-sm font-medium text-primary-900">{selectedIds.length} selected</p>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() => deletePages(rows.filter((page) => selectedIds.includes(page.id)))}
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
          getRowId={(page) => page.id}
          caption="All website pages with their template and status"
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          sort={list.sort}
          onSortChange={list.setSort}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(page) => navigate(`/pages/${page.id}/edit`)}
          emptyIcon={FileText}
          emptyTitle={list.search || list.activeFilterCount > 0 ? 'No matching pages' : 'No pages yet'}
          emptyDescription={
            list.search || list.activeFilterCount > 0
              ? 'Try a different search term or clear the filters.'
              : 'Create your first page to start building the website.'
          }
          rowActions={(page) => (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Actions for ${page.title}`}>
                  <MoreHorizontal size={16} aria-hidden="true" />
                </Button>
              }
            >
              <DropdownItem icon={Pencil} onSelect={() => navigate(`/pages/${page.id}/edit`)}>
                Edit
              </DropdownItem>
              <DropdownItem
                icon={ExternalLink}
                onSelect={() => window.open(`${SITE_URL}/${page.slug}`, '_blank', 'noopener')}
              >
                Preview
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                icon={Trash2}
                tone="danger"
                disabled={page.system}
                onSelect={() => deletePages([page])}
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
