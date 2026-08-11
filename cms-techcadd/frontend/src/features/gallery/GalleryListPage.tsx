import { Link, useNavigate } from 'react-router-dom'
import { Image as ImageIcon, Images, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'

import { ApiError } from '../../api'
import { ContentStatusBadge } from '../../components/common/Badge'
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
import { formatShortDate } from '../../lib/format'
import type { GalleryAlbum } from '../../types'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { galleryHooks } from './useGallery'
import { assetUrl } from '../../api/client'

export default function GalleryListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  const list = useListParams({
    filterKeys: ['status'],
    defaultSort: { field: 'eventDate', dir: 'desc' },
  })

  const query = galleryHooks.useList(list.params)
  const remove = galleryHooks.useRemove()

  const albums = query.data?.items ?? []
  const total = query.data?.total ?? 0

  async function deleteAlbum(album: GalleryAlbum) {
    const confirmed = await confirm({
      title: `Delete “${album.title}”?`,
      description:
        album.images.length > 0
          ? `${album.images.length} ${album.images.length === 1 ? 'image' : 'images'} in this album will be removed from the website.`
          : undefined,
      confirmLabel: 'Delete',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync([album.id])
      toast.success('Album deleted.')
    } catch (error) {
      toast.error('Could not delete', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description={
          query.isLoading ? 'Loading…' : `${total} ${total === 1 ? 'album' : 'albums'} in total`
        }
        actions={
          <Link to="/gallery/new">
            <Button icon={Plus}>Add Album</Button>
          </Link>
        }
      />

      <Card flush>
        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search albums by title"
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
          <SkeletonCards count={6} />
        ) : query.error ? (
          <div className="p-5">
            <Alert tone="error" title="Could not load albums">
              {(query.error as Error).message}
            </Alert>
          </div>
        ) : albums.length === 0 ? (
          <EmptyState
            icon={Images}
            title={list.search ? 'No matching albums' : 'No albums yet'}
            description={
              list.search
                ? 'Try a different search term.'
                : 'Group event photos into albums so they display neatly on the website.'
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {albums.map((album) => (
              <li key={album.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 transition-colors hover:border-primary-300">
                  <div className="aspect-video bg-slate-50">
                    {album.cover?.url ? (
                      <img
                        src={assetUrl(album.cover.url)}
                        alt={album.cover.alt}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span
                        className="grid size-full place-items-center text-slate-300"
                        aria-hidden="true"
                      >
                        <ImageIcon size={28} />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {album.title}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {album.images.length}{' '}
                          {album.images.length === 1 ? 'image' : 'images'}
                          {album.eventDate && ` · ${formatShortDate(album.eventDate)}`}
                        </p>
                      </div>

                      <DropdownMenu
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Actions for ${album.title}`}
                          >
                            <MoreHorizontal size={16} aria-hidden="true" />
                          </Button>
                        }
                      >
                        <DropdownItem
                          icon={Pencil}
                          onSelect={() => navigate(`/gallery/${album.id}/edit`)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem
                          icon={Trash2}
                          tone="danger"
                          onSelect={() => deleteAlbum(album)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <ContentStatusBadge status={album.status} />
                    </div>
                  </div>
                </article>
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
