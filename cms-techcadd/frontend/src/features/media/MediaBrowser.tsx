import { useState } from 'react'
import { Check, Copy, FileWarning, Images, Trash2, Upload } from 'lucide-react'

import { ApiError } from '../../api'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { FilterBar } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonCards } from '../../components/feedback/Skeleton'
import { Spinner } from '../../components/feedback/Spinner'
import { Input } from '../../components/form/Input'
import { Select } from '../../components/form/Select'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'
import { formatFileSize } from '../../lib/format'
import type { MediaItem, MediaRef } from '../../types'
import { mediaHooks, UPLOAD_LIMIT, useUploadMedia } from './useMedia'
import { assetUrl } from '../../api/client'

const TYPE_OPTIONS = [
  { value: 'image', label: 'Images' },
  { value: 'application', label: 'Documents' },
]

export interface MediaBrowserProps {
  /**
   * `library` manages files; `picker` selects them. Same component either way —
   * forking them would let the two drift apart.
   */
  mode: 'library' | 'picker'
  multiple?: boolean
  onConfirm?: (items: MediaRef[]) => void
}

export function MediaBrowser({ mode, multiple = false, onConfirm }: MediaBrowserProps) {
  const toast = useToast()
  const confirm = useConfirm()

  const list = useListParams({
    filterKeys: ['mimeType'],
    defaultSort: { field: 'createdAt', dir: 'desc' },
    defaultPageSize: 24,
  })

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [rejected, setRejected] = useState<string[]>([])

  const query = mediaHooks.useList(list.params)
  const upload = useUploadMedia()
  const update = mediaHooks.useUpdate()
  const remove = mediaHooks.useRemove()

  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const isPicker = mode === 'picker'

  function toggle(item: MediaItem) {
    setSelectedIds((current) => {
      if (current.includes(item.id)) return current.filter((id) => id !== item.id)
      return multiple || mode === 'library' ? [...current, item.id] : [item.id]
    })
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const tooLarge = [...files].filter((file) => file.size > UPLOAD_LIMIT)
    const allowed = [...files].filter((file) => file.size <= UPLOAD_LIMIT)
    setRejected(tooLarge.map((file) => file.name))

    if (allowed.length === 0) return

    try {
      await upload.mutateAsync(allowed)
      toast.success(`Uploaded ${allowed.length} ${allowed.length === 1 ? 'file' : 'files'}.`)
    } catch (error) {
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  async function deleteSelected() {
    const label = `${selectedIds.length} ${selectedIds.length === 1 ? 'file' : 'files'}`
    const confirmed = await confirm({
      title: `Delete ${label}?`,
      description: 'Anything still referencing these files will show a broken image.',
      confirmLabel: 'Delete',
    })
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

  const selectedItems = items.filter((item) => selectedIds.includes(item.id))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FilterBar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by filename or alt text"
        filters={
          <Select
            className="h-9 w-auto min-w-32"
            aria-label="Filter by type"
            options={TYPE_OPTIONS}
            placeholder="All types"
            value={list.filters.mimeType ?? ''}
            onChange={(event) => list.setFilter('mimeType', event.target.value || undefined)}
          />
        }
        actions={
          <label className="inline-flex">
            <input
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                handleFiles(event.target.files)
                event.target.value = ''
              }}
            />
            <span
              className={cn(
                'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary-500 px-3 text-xs font-medium text-white transition-colors hover:bg-primary-600',
                upload.isPending && 'pointer-events-none opacity-70',
              )}
            >
              {upload.isPending ? <Spinner size={14} /> : <Upload size={14} aria-hidden="true" />}
              Upload
            </span>
          </label>
        }
      />

      <div className="border-b border-slate-100 px-5 py-2">
        <p className="text-xs text-slate-400">
          PNG, JPEG, GIF, WebP, SVG and PDF, up to {formatFileSize(UPLOAD_LIMIT)} each.
        </p>
      </div>

      {rejected.length > 0 && (
        <div className="px-5 pt-3">
          <Alert tone="warning" title="Some files were too large" onDismiss={() => setRejected([])}>
            <p className="flex items-start gap-1.5">
              <FileWarning size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              {rejected.join(', ')}
            </p>
          </Alert>
        </div>
      )}

      {selectedIds.length > 0 && mode === 'library' && (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-primary-50/60 px-5 py-2.5">
          <p className="text-sm font-medium text-primary-900">{selectedIds.length} selected</p>
          <Button variant="secondary" size="sm" icon={Trash2} onClick={deleteSelected}>
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

      <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto">
        {query.isLoading ? (
          <SkeletonCards count={8} />
        ) : query.error ? (
          <div className="p-5">
            <Alert tone="error" title="Could not load the media library">
              {(query.error as Error).message}
            </Alert>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Images}
            title={list.search ? 'No matching files' : 'No files yet'}
            description={
              list.search
                ? 'Try a different search term.'
                : 'Upload images to reuse them across courses, blogs and banners.'
            }
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id)

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    aria-pressed={isSelected}
                    className={cn(
                      'group relative block w-full overflow-hidden rounded-lg border text-left transition-colors',
                      isSelected
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-slate-200 hover:border-primary-300',
                    )}
                  >
                    <span className="block aspect-square bg-slate-50">
                      {item.mimeType.startsWith('image/') ? (
                        <img
                          src={assetUrl(item.url)}
                          alt={item.alt || item.filename}
                          width={item.width}
                          height={item.height}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="grid size-full place-items-center text-slate-300">
                          <Images size={24} aria-hidden="true" />
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <span
                        className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-primary-500 text-white"
                        aria-hidden="true"
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}

                    <span className="block truncate px-2 py-1.5 text-xs text-slate-600">
                      {item.filename}
                    </span>
                  </button>

                  {mode === 'library' && isSelected && (
                    <div className="mt-1.5 space-y-1.5">
                      <Input
                        defaultValue={item.alt}
                        placeholder="Alt text"
                        aria-label={`Alt text for ${item.filename}`}
                        className="h-8 text-xs"
                        onBlur={(event) => {
                          if (event.target.value === item.alt) return
                          update
                            .mutateAsync({ id: item.id, input: { alt: event.target.value } })
                            .then(() => toast.success('Alt text saved.'))
                            .catch(() => toast.error('Could not save alt text'))
                        }}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Copy}
                        fullWidth
                        onClick={() => {
                          navigator.clipboard
                            ?.writeText(item.url)
                            .then(() => toast.success('URL copied.'))
                            .catch(() => toast.error('Could not copy the URL'))
                        }}
                      >
                        Copy URL
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {total > 0 && (
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={total}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
        />
      )}

      {isPicker && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">
            {selectedIds.length === 0
              ? 'Select a file to continue'
              : `${selectedIds.length} selected`}
          </p>
          <Button
            disabled={selectedIds.length === 0}
            onClick={() =>
              onConfirm?.(
                selectedItems.map((item) => ({
                  id: item.id,
                  url: item.url,
                  alt: item.alt,
                  width: item.width,
                  height: item.height,
                })),
              )
            }
          >
            Use {multiple && selectedIds.length > 1 ? `${selectedIds.length} files` : 'this file'}
          </Button>
        </div>
      )}
    </div>
  )
}
