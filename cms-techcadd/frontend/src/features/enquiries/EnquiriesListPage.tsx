import { useMemo, useState } from 'react'
import { Download, Inbox, MoreHorizontal, Trash2, UserPlus } from 'lucide-react'

import { ApiError, enquiriesApi } from '../../api'
import { Badge, EnquiryStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownLabel } from '../../components/common/DropdownMenu'
import { DataTable, type Column } from '../../components/data/DataTable'
import { FilterBar, type ActiveFilter } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { DateRangePicker } from '../../components/form/DatePicker'
import { Select } from '../../components/form/Select'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import { downloadCsv, toCsv, type CsvColumn } from '../../lib/csv'
import { formatShortDate } from '../../lib/format'
import type { EnquiryRecord, EnquiryStatus } from '../../types'
import { EnquiryDrawer } from './EnquiryDrawer'
import { sourceLabel, SOURCE_OPTIONS, STATUS_OPTIONS, statusLabel } from './enquiryMeta'
import { branchRefHooks, courseRefHooks, enquiryHooks, userRefHooks } from './useEnquiries'

const FILTER_KEYS = [
  'status',
  'source',
  'branchId',
  'courseId',
  'assigneeId',
  'createdAtFrom',
  'createdAtTo',
] as const

const CSV_COLUMNS: CsvColumn<EnquiryRecord>[] = [
  { header: 'Reference', value: (row) => row.id },
  { header: 'Student', value: (row) => row.studentName },
  { header: 'Phone', value: (row) => row.phone },
  { header: 'Email', value: (row) => row.email ?? '' },
  { header: 'Course', value: (row) => row.courseName },
  { header: 'Branch', value: (row) => row.branchName },
  { header: 'Source', value: (row) => sourceLabel(row.source) },
  { header: 'Status', value: (row) => statusLabel(row.status) },
  { header: 'Follow-up', value: (row) => row.followUpDate ?? '' },
  { header: 'Received', value: (row) => row.createdAt.slice(0, 10) },
  { header: 'Message', value: (row) => row.message ?? '' },
]

export default function EnquiriesListPage() {
  const toast = useToast()
  const confirm = useConfirm()

  const list = useListParams({
    filterKeys: FILTER_KEYS,
    defaultSort: { field: 'createdAt', dir: 'desc' },
  })

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const query = enquiryHooks.useList(list.params)
  const update = enquiryHooks.useUpdate()
  const remove = enquiryHooks.useRemove()

  const courses = courseRefHooks.useList({ page: 1, pageSize: 200 })
  const branches = branchRefHooks.useList({ page: 1, pageSize: 200 })
  const users = userRefHooks.useList({ page: 1, pageSize: 200 })

  const courseOptions = (courses.data?.items ?? []).map((c) => ({ value: c.id, label: c.title }))
  const branchOptions = (branches.data?.items ?? []).map((b) => ({ value: b.id, label: b.name }))
  const assigneeOptions = (users.data?.items ?? []).map((u) => ({ value: u.id, label: u.name }))

  const rows = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const openEnquiry = rows.find((row) => row.id === openId) ?? null

  const assigneeNameById = useMemo(
    () => new Map(assigneeOptions.map((option) => [option.value, option.label])),
    [assigneeOptions],
  )

  const columns = useMemo<Column<EnquiryRecord>[]>(
    () => [
      {
        id: 'studentName',
        header: 'Student',
        primary: true,
        sortable: true,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{row.studentName}</p>
            <p className="truncate text-xs text-slate-400">{row.phone}</p>
          </div>
        ),
      },
      { id: 'courseName', header: 'Course', hideBelow: 'lg', cell: (row) => row.courseName },
      {
        id: 'branchName',
        header: 'Branch',
        hideBelow: 'xl',
        cell: (row) => <Badge tone="neutral">{row.branchName}</Badge>,
      },
      {
        id: 'source',
        header: 'Source',
        hideBelow: 'xl',
        cell: (row) => sourceLabel(row.source),
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        cell: (row) => <EnquiryStatusBadge status={row.status as EnquiryStatus} />,
      },
      {
        id: 'assigneeId',
        header: 'Assigned',
        hideBelow: 'lg',
        cell: (row) =>
          row.assigneeId ? (
            (assigneeNameById.get(row.assigneeId) ?? '—')
          ) : (
            <span className="text-slate-400">Unassigned</span>
          ),
      },
      {
        id: 'createdAt',
        header: 'Received',
        sortable: true,
        hideBelow: 'lg',
        cell: (row) => (
          <span className="whitespace-nowrap text-slate-500">{formatShortDate(row.createdAt)}</span>
        ),
      },
    ],
    [assigneeNameById],
  )

  const activeFilters: ActiveFilter[] = FILTER_KEYS.flatMap((key) => {
    const value = list.filters[key]
    if (!value) return []

    const labels: Record<string, string> = {
      status: 'Status',
      source: 'Source',
      branchId: 'Branch',
      courseId: 'Course',
      assigneeId: 'Assigned',
      createdAtFrom: 'From',
      createdAtTo: 'To',
    }

    const lookups: Record<string, { value: string; label: string }[]> = {
      status: STATUS_OPTIONS,
      source: SOURCE_OPTIONS,
      branchId: branchOptions,
      courseId: courseOptions,
      assigneeId: assigneeOptions,
    }

    return [
      {
        key,
        label: labels[key],
        value: lookups[key]?.find((option) => option.value === value)?.label ?? value,
        onRemove: () => list.setFilter(key, undefined),
      },
    ]
  })

  async function bulkStatus(status: EnquiryStatus) {
    try {
      await Promise.all(selectedIds.map((id) => update.mutateAsync({ id, input: { status } })))
      toast.success(`${selectedIds.length} marked as ${statusLabel(status)}.`)
      setSelectedIds([])
    } catch {
      toast.error('Could not update every enquiry')
    }
  }

  async function bulkAssign(assigneeId: string) {
    try {
      await Promise.all(selectedIds.map((id) => update.mutateAsync({ id, input: { assigneeId } })))
      toast.success(`${selectedIds.length} assigned.`)
      setSelectedIds([])
    } catch {
      toast.error('Could not assign every enquiry')
    }
  }

  async function bulkDelete() {
    const label = `${selectedIds.length} ${selectedIds.length === 1 ? 'enquiry' : 'enquiries'}`
    const confirmed = await confirm({ title: `Delete ${label}?`, confirmLabel: 'Delete' })
    if (!confirmed) return

    try {
      await remove.mutateAsync(selectedIds)
      setSelectedIds([])
      toast.success(`Deleted ${label}.`)
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  async function exportCsv() {
    setExporting(true)
    try {
      // Export what the filters describe, not just the visible page.
      const all = await enquiriesApi.list({ ...list.params, page: 1, pageSize: 5000 })
      if (all.items.length === 0) {
        toast.info('Nothing to export', { description: 'No enquiries match the current filters.' })
        return
      }

      const stamp = new Date().toISOString().slice(0, 10)
      downloadCsv(`enquiries-${stamp}.csv`, toCsv(all.items, CSV_COLUMNS))
      toast.success(`Exported ${all.items.length} enquiries.`)
    } catch (error) {
      toast.error('Could not export', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description={
          query.isLoading
            ? 'Loading…'
            : `${total} ${total === 1 ? 'enquiry' : 'enquiries'} match the current filters`
        }
        actions={
          <Button variant="secondary" icon={Download} disabled={exporting} onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />

      <Card flush>
        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search by name, phone, email or course"
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
                aria-label="Filter by source"
                options={SOURCE_OPTIONS}
                placeholder="All sources"
                value={list.filters.source ?? ''}
                onChange={(event) => list.setFilter('source', event.target.value || undefined)}
              />
              {branchOptions.length > 0 && (
                <Select
                  className="h-9 w-auto min-w-32"
                  aria-label="Filter by branch"
                  options={branchOptions}
                  placeholder="All branches"
                  value={list.filters.branchId ?? ''}
                  onChange={(event) => list.setFilter('branchId', event.target.value || undefined)}
                />
              )}
              {courseOptions.length > 0 && (
                <Select
                  className="h-9 w-auto min-w-36"
                  aria-label="Filter by course"
                  options={courseOptions}
                  placeholder="All courses"
                  value={list.filters.courseId ?? ''}
                  onChange={(event) => list.setFilter('courseId', event.target.value || undefined)}
                />
              )}
              <div className="w-56">
                <DateRangePicker
                  value={{ from: list.filters.createdAtFrom, to: list.filters.createdAtTo }}
                  onChange={(range) => {
                    list.setFilter('createdAtFrom', range.from)
                    list.setFilter('createdAtTo', range.to)
                  }}
                  placeholder="Any date received"
                />
              </div>
            </>
          }
        />

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-primary-50/60 px-5 py-2.5">
            <p className="text-sm font-medium text-primary-900">{selectedIds.length} selected</p>

            <DropdownMenu
              align="start"
              trigger={
                <Button variant="secondary" size="sm">
                  Set status
                </Button>
              }
            >
              <DropdownLabel>Move to</DropdownLabel>
              {STATUS_OPTIONS.map((option) => (
                <DropdownItem key={option.value} onSelect={() => bulkStatus(option.value)}>
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>

            <DropdownMenu
              align="start"
              trigger={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserPlus}
                  disabled={assigneeOptions.length === 0}
                >
                  Assign
                </Button>
              }
            >
              <DropdownLabel>Assign to</DropdownLabel>
              {assigneeOptions.map((option) => (
                <DropdownItem key={option.value} onSelect={() => bulkAssign(option.value)}>
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>

            <Button variant="secondary" size="sm" icon={Trash2} onClick={bulkDelete}>
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
          getRowId={(row) => row.id}
          caption="Admission enquiries with their course, branch, status and assignment"
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          sort={list.sort}
          onSortChange={list.setSort}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(row) => setOpenId(row.id)}
          emptyIcon={Inbox}
          emptyTitle={
            list.search || activeFilters.length > 0 ? 'No matching enquiries' : 'No enquiries yet'
          }
          emptyDescription={
            list.search || activeFilters.length > 0
              ? 'Try a different search term or clear the filters.'
              : 'Enquiries submitted through the website will land here.'
          }
          rowActions={(row) => (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Actions for ${row.studentName}`}>
                  <MoreHorizontal size={16} aria-hidden="true" />
                </Button>
              }
            >
              <DropdownItem onSelect={() => setOpenId(row.id)}>Open details</DropdownItem>
              <DropdownLabel>Set status</DropdownLabel>
              {STATUS_OPTIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  disabled={row.status === option.value}
                  onSelect={() =>
                    update
                      .mutateAsync({ id: row.id, input: { status: option.value } })
                      .then(() => toast.success(`Marked as ${option.label}.`))
                      .catch(() => toast.error('Could not update this enquiry'))
                  }
                >
                  {option.label}
                </DropdownItem>
              ))}
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

      <EnquiryDrawer
        enquiry={openEnquiry}
        onOpenChange={(open) => !open && setOpenId(null)}
        assigneeOptions={assigneeOptions}
        currentUserName="techcadd-team"
      />
    </div>
  )
}
