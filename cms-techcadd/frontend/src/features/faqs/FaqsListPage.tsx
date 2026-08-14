import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleHelp, MoreHorizontal, Pencil, Plus, Star, Trash2 } from 'lucide-react'

import { ApiError, type ListParams } from '../../api'
import { Badge, ContentStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { DataTable, type Column } from '../../components/data/DataTable'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import type { Faq } from '../../types'
import { faqHooks } from './useFaqs'

/**
 * Every question at once.
 *
 * Questions are hand-ordered within a category and there are rarely more than
 * a few dozen, so paginating would only make reordering harder.
 */
const ALL: ListParams = { page: 1, pageSize: 500, sort: { field: 'order', dir: 'asc' } }

export default function FaqsListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const query = faqHooks.useList(ALL)
  const update = faqHooks.useUpdate()
  const remove = faqHooks.useRemove()

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const faqs = useMemo(() => query.data?.items ?? [], [query.data])

  async function deleteFaq(faq: Faq) {
    const confirmed = await confirm({
      title: 'Delete this question?',
      description: faq.question,
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync([faq.id])
      toast.success('Question deleted.')
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  async function toggleFeatured(faq: Faq) {
    try {
      await update.mutateAsync({ id: faq.id, input: { featured: !faq.featured } })
      toast.success(faq.featured ? 'Removed from the homepage.' : 'Added to the homepage.')
    } catch {
      toast.error('Could not update this question')
    }
  }

  const columns: Column<Faq>[] = [
    {
      id: 'question',
      header: 'Question',
      cell: (faq) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{faq.question}</p>
          <p className="truncate text-xs text-slate-500">{faq.answer}</p>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: (faq) => <Badge tone="neutral">{faq.category}</Badge>,
    },
    {
      id: 'featured',
      header: 'Homepage',
      cell: (faq) =>
        faq.featured ? <Badge tone="primary">Featured</Badge> : <span className="text-slate-400">—</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (faq) => <ContentStatusBadge status={faq.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ"
        description="Questions the centre answers on the phone, grouped by section"
        actions={
          <Link to="/faqs/new">
            <Button icon={Plus}>Add question</Button>
          </Link>
        }
      />

      <Card flush>
        <DataTable
          rows={faqs}
          columns={columns}
          getRowId={(faq) => faq.id}
          caption="Frequently asked questions with their category and status"
          loading={query.isLoading}
          error={query.error as Error | null}
          onRetry={() => query.refetch()}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(faq) => navigate(`/faqs/${faq.id}/edit`)}
          emptyIcon={CircleHelp}
          emptyTitle="No questions yet"
          emptyDescription="Add the questions people ask most and they will appear on the site."
          rowActions={(faq) => (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Actions for this question`}>
                  <MoreHorizontal size={16} />
                </Button>
              }
            >
              <DropdownItem icon={Pencil} onSelect={() => navigate(`/faqs/${faq.id}/edit`)}>
                Edit
              </DropdownItem>
              <DropdownItem icon={Star} onSelect={() => toggleFeatured(faq)}>
                {faq.featured ? 'Remove from homepage' : 'Show on homepage'}
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={Trash2} tone="danger" onSelect={() => deleteFaq(faq)}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          )}
        />
      </Card>
    </div>
  )
}
