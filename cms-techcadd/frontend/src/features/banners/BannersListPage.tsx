import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ExternalLink,
  GalleryVerticalEnd,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import { ApiError, type ListParams } from '../../api'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { EmptyState } from '../../components/common/EmptyState'
import { SortableList } from '../../components/data/SortableList'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonCards } from '../../components/feedback/Skeleton'
import { Select } from '../../components/form/Select'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { formatShortDate } from '../../lib/format'
import type { Banner } from '../../types'
import { PLACEMENT_OPTIONS, SCHEDULE_META, scheduleStateOf } from './bannerSchema'
import { bannerHooks } from './useBanners'

// Banners are hand-ordered within a placement, so they all load at once.
const ALL: ListParams = { page: 1, pageSize: 200, sort: { field: 'order', dir: 'asc' } }

export default function BannersListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const [placement, setPlacement] = useState('')

  const query = bannerHooks.useList(ALL)
  const update = bannerHooks.useUpdate()
  const remove = bannerHooks.useRemove()

  const all = query.data?.items ?? []
  const banners = placement ? all.filter((banner) => banner.placement === placement) : all

  async function persistOrder(ordered: Banner[]) {
    try {
      await Promise.all(
        ordered.map((banner, index) =>
          banner.order === index
            ? Promise.resolve(banner)
            : update.mutateAsync({ id: banner.id, input: { order: index } }),
        ),
      )
    } catch {
      toast.error('Could not save the new order')
    }
  }

  async function deleteBanner(banner: Banner) {
    const confirmed = await confirm({
      title: `Delete “${banner.title}”?`,
      description: 'The banner is removed from the website immediately.',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync([banner.id])
      toast.success('Banner deleted.')
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description={
          query.isLoading
            ? 'Loading…'
            : `${all.length} ${all.length === 1 ? 'banner' : 'banners'}, drag to reorder`
        }
        actions={
          <Link to="/banners/new">
            <Button icon={Plus}>Add Banner</Button>
          </Link>
        }
      />

      <Card flush>
        <CardHeader
          title="Banner slots"
          subtitle="Order controls the rotation sequence on the website"
          action={
            <Select
              className="h-9 w-auto min-w-40"
              aria-label="Filter by placement"
              options={PLACEMENT_OPTIONS}
              placeholder="All placements"
              value={placement}
              onChange={(event) => setPlacement(event.target.value)}
            />
          }
        />

        {query.isLoading ? (
          <SkeletonCards count={3} />
        ) : query.error ? (
          <div className="p-5">
            <Alert tone="error" title="Could not load banners">
              {(query.error as Error).message}
            </Alert>
          </div>
        ) : banners.length === 0 ? (
          <EmptyState
            icon={GalleryVerticalEnd}
            title={placement ? 'No banners in this placement' : 'No banners yet'}
            description={
              placement
                ? 'Try a different placement, or add a banner to this slot.'
                : 'Banners are the rotating images at the top of the website.'
            }
          />
        ) : (
          <CardBody>
            <SortableList
              items={banners}
              getId={(banner) => banner.id}
              onReorder={persistOrder}
              renderItem={(banner) => (
                <BannerRow
                  banner={banner}
                  onEdit={() => navigate(`/banners/${banner.id}/edit`)}
                  onDelete={() => deleteBanner(banner)}
                />
              )}
            />
          </CardBody>
        )}
      </Card>
    </div>
  )
}

function BannerRow({
  banner,
  onEdit,
  onDelete,
}: {
  banner: Banner
  onEdit: () => void
  onDelete: () => void
}) {
  const state = scheduleStateOf(banner)
  const meta = SCHEDULE_META[state]

  return (
    <div className="flex items-center gap-4">
      <div className="h-14 w-24 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {banner.desktopImage?.url ? (
          <img
            src={banner.desktopImage.url}
            alt={banner.altText}
            className="size-full object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center text-slate-300" aria-hidden="true">
            <ImageIcon size={18} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{banner.title}</p>
        <p className="truncate text-xs text-slate-500">
          {PLACEMENT_OPTIONS.find((option) => option.value === banner.placement)?.label}
          {banner.startsAt && ` · from ${formatShortDate(banner.startsAt)}`}
          {banner.endsAt && ` to ${formatShortDate(banner.endsAt)}`}
        </p>
      </div>

      {banner.linkUrl && (
        <a
          href={banner.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 items-center gap-1 text-xs text-slate-500 hover:text-primary-600 sm:inline-flex"
        >
          <ExternalLink size={12} aria-hidden="true" />
          Link
        </a>
      )}

      <Badge tone={meta.tone} withDot>
        {meta.label}
      </Badge>

      <DropdownMenu
        trigger={
          <Button variant="ghost" size="sm" aria-label={`Actions for ${banner.title}`}>
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
