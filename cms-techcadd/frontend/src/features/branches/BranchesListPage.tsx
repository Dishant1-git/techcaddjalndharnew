import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, MapPin, MoreHorizontal, Pencil, Phone, Plus, Trash2 } from 'lucide-react'

import { ApiError } from '../../api'
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
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import type { Branch } from '../../types'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { branchModuleHooks } from './useBranchesModule'

export default function BranchesListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const list = useListParams({
    filterKeys: ['status', 'city'],
    defaultSort: { field: 'name', dir: 'asc' },
  })

  const query = branchModuleHooks.useList(list.params)
  const remove = branchModuleHooks.useRemove()

  const branches = query.data?.items ?? []
  const total = query.data?.total ?? 0

  async function deleteBranch(branch: Branch) {
    const confirmed = await confirm({
      title: `Delete ${branch.name}?`,
      description: 'Courses and faculty linked to this branch will lose the association.',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync([branch.id])
      toast.success('Branch deleted.')
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description={
          query.isLoading ? 'Loading…' : `${total} ${total === 1 ? 'centre' : 'centres'} in total`
        }
        actions={
          <Link to="/branches/new">
            <Button icon={Plus}>Add Branch</Button>
          </Link>
        }
      />

      <Card flush>
        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search by name, code or city"
          onClearAll={list.activeFilterCount > 0 ? list.clearFilters : undefined}
          filters={
            <Select
              className="h-9 w-auto min-w-32"
              aria-label="Filter by status"
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              value={list.filters.status ?? ''}
              onChange={(event) => list.setFilter('status', event.target.value || undefined)}
            />
          }
        />

        {query.isLoading ? (
          <SkeletonCards count={4} />
        ) : query.error ? (
          <div className="p-5">
            <Alert tone="error" title="Could not load branches">
              {(query.error as Error).message}
            </Alert>
          </div>
        ) : branches.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={list.search ? 'No matching branches' : 'No branches yet'}
            description={
              list.search
                ? 'Try a different search term.'
                : 'Add each training centre so students can find their nearest one.'
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
            {branches.map((branch) => (
              <li key={branch.id}>
                <BranchCard
                  branch={branch}
                  onEdit={() => navigate(`/branches/${branch.id}/edit`)}
                  onDelete={() => deleteBranch(branch)}
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

function BranchCard({
  branch,
  onEdit,
  onDelete,
}: {
  branch: Branch
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="flex h-full gap-4 rounded-lg border border-slate-200 p-4">
      <span
        className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600"
        aria-hidden="true"
      >
        <Building2 size={20} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 truncate text-sm font-semibold text-slate-900">
              {branch.name}
              <Badge tone="neutral">{branch.code}</Badge>
            </h3>
            <p className="mt-0.5 flex items-start gap-1 text-xs text-slate-500">
              <MapPin size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span className="line-clamp-2">
                {[branch.addressLine1, branch.city, branch.state, branch.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </p>
          </div>

          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Actions for ${branch.name}`}>
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

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          {branch.phones[0] && (
            <a
              href={`tel:${branch.phones[0].replace(/\s/g, '')}`}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-primary-600"
            >
              <Phone size={12} aria-hidden="true" />
              {branch.phones[0]}
              {branch.phones.length > 1 && (
                <span className="text-slate-400">+{branch.phones.length - 1}</span>
              )}
            </a>
          )}

          {branch.email && (
            <a
              href={`mailto:${branch.email}`}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-primary-600"
            >
              <Mail size={12} aria-hidden="true" />
              {branch.email}
            </a>
          )}

          <span className="ml-auto">
            <ContentStatusBadge status={branch.status} />
          </span>
        </div>
      </div>
    </article>
  )
}
