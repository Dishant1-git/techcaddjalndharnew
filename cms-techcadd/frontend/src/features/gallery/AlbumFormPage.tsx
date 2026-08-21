import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Image as ImageIcon, ImagePlus, Trash2 } from 'lucide-react'

import { ApiError } from '../../api'
import { AppearsOn } from '../../components/common/AppearsOn'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { EmptyState } from '../../components/common/EmptyState'
import { SortableList } from '../../components/data/SortableList'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { DatePicker } from '../../components/form/DatePicker'
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { MediaPicker } from '../../components/media/MediaPicker'
import { Input } from '../../components/form/Input'
import { Select } from '../../components/form/Select'
import { SlugInput } from '../../components/form/SlugInput'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { createId } from '../../lib/id'
import type { GalleryImage, MediaRef } from '../../types'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { albumSchema, emptyAlbum, type AlbumFormValues } from './gallerySchema'
import { galleryHooks } from './useGallery'
import { assetUrl } from '../../api/client'

export default function AlbumFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = galleryHooks.useOne(id)
  const create = galleryHooks.useCreate()
  const update = galleryHooks.useUpdate()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: emptyAlbum(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) reset(existing.data as AlbumFormValues)
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting)
  const title = useWatch({ control, name: 'title' })
  const saving = create.isPending || update.isPending

  // Feeds the "where this appears" note — it shows the live URL, which moves
  // with the slug as it is typed.
  const watched = useWatch({ control }) as Record<string, unknown>

  /**
   * Publishes and saves in one action.
   *
   * Setting the status select and then pressing Save is two steps that read as
   * one, and the step people miss is the first.
   */
  const publish =
    watched.status === 'published'
      ? undefined
      : () => {
          setValue('status', 'published', { shouldDirty: true })
          void handleSubmit(onSubmit)()
        }

  async function onSubmit(values: AlbumFormValues) {
    // Positions are derived from list order on save, so they cannot drift.
    const normalised = {
      ...values,
      images: values.images.map((image, index) => ({ ...image, order: index })),
    }

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: normalised })
        toast.success('Album updated.')
      } else {
        await create.mutateAsync(normalised)
        toast.success('Album created.')
      }
      navigate('/gallery')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof AlbumFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this album', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading album…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this album">
        <p>{(existing.error as Error).message}</p>
        <Link to="/gallery" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to gallery
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Album' : 'Add Album'}
        breadcrumb={[{ label: 'Gallery', to: '/gallery' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <AppearsOn module="gallery" record={watched} saved={isEdit} />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This album could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Album details" />
            <CardBody className="space-y-5">
              <FormField label="Title" required error={errors.title?.message}>
                <Input {...register('title')} placeholder="e.g. Annual Day 2026" />
              </FormField>

              <FormField label="URL slug" required error={errors.slug?.message}>
                <Controller
                  control={control}
                  name="slug"
                  render={({ field }) => (
                    <SlugInput
                      value={field.value}
                      onChange={field.onChange}
                      source={title}
                      baseUrl="techcadd.com/gallery/"
                    />
                  )}
                />
              </FormField>

              <FormField label="Description">
                <Textarea {...register('description')} rows={3} maxLength={300} showCount />
              </FormField>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader
              title="Images"
              subtitle="Drag to reorder — this is the order shown on the website"
            />
            <CardBody>
              <Controller
                control={control}
                name="images"
                render={({ field }) => (
                  <AlbumImages value={field.value} onChange={field.onChange} />
                )}
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card flush>
            <CardHeader title="Cover image" />
            <CardBody>
              <Controller
                control={control}
                name="cover"
                render={({ field }) => (
                  <ImageField value={field.value} onChange={field.onChange} aspect="video" />
                )}
              />
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Publishing" />
            <CardBody className="space-y-5">
              <FormField label="Status">
                <Select {...register('status')} options={STATUS_OPTIONS} />
              </FormField>

              <FormField label="Event date">
                <Controller
                  control={control}
                  name="eventDate"
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </CardBody>
          </Card>
        </div>
      </div>

      <FormFooter
        onPublish={publish}
        cancelTo="/gallery"
        submitLabel={isEdit ? 'Save changes' : 'Create album'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="album"
      />
    </form>
  )
}

function AlbumImages({
  value,
  onChange,
}: {
  value: GalleryImage[]
  onChange: (value: GalleryImage[]) => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  /** Row whose image is being swapped, if any. */
  const [replacing, setReplacing] = useState<string | undefined>()

  function patch(imageId: string, next: Partial<GalleryImage>) {
    onChange(value.map((image) => (image.id === imageId ? { ...image, ...next } : image)))
  }

  /**
   * Adds whatever was chosen in the media library.
   *
   * Replaces an "add row, then type the image URL by hand" flow, which asked
   * an editor to know the address of a file they had just uploaded — and
   * accepted any string, so a typo produced a broken tile with nothing to say
   * so. Multiple selection, because an album is a batch of photographs.
   */
  function addFromLibrary(items: MediaRef[]) {
    onChange([
      ...value,
      ...items.map((media, offset) => ({
        id: createId('img'),
        media,
        caption: '',
        linkUrl: '',
        order: value.length + offset,
      })),
    ])
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200">
          <EmptyState
            icon={ImageIcon}
            title="No images yet"
            description="Add the photos that make up this album."
          />
        </div>
      ) : (
        <SortableList
          items={value}
          getId={(image) => image.id}
          onReorder={onChange}
          renderItem={(image, index) => (
            <div className="flex items-start gap-3">
              <span className="mt-2 w-6 shrink-0 text-xs font-semibold text-slate-400">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* The thumbnail is the swap control: clicking it reopens the
                  library for this row, which is where an editor looks when
                  they want to change one photograph. */}
              <button
                type="button"
                onClick={() => setReplacing(image.id)}
                title="Choose a different image"
                className="h-16 w-24 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-50 transition-colors hover:border-primary-300"
              >
                {image.media.url ? (
                  <img
                    src={assetUrl(image.media.url)}
                    alt={image.media.alt}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-slate-300" aria-hidden="true">
                    <ImageIcon size={16} />
                  </span>
                )}
                <span className="sr-only">Replace image {index + 1}</span>
              </button>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={image.media.alt}
                    onChange={(event) =>
                      patch(image.id, { media: { ...image.media, alt: event.target.value } })
                    }
                    placeholder="Alt text"
                    aria-label={`Image ${index + 1} alt text`}
                  />
                  <Input
                    value={image.caption ?? ''}
                    onChange={(event) => patch(image.id, { caption: event.target.value })}
                    placeholder="Caption (optional)"
                    aria-label={`Image ${index + 1} caption`}
                  />
                </div>

                {/* Optional. A tile is only clickable on the website when this
                    is filled in, so leaving it empty is a real choice rather
                    than an unfinished one. */}
                <Input
                  value={image.linkUrl ?? ''}
                  onChange={(event) => patch(image.id, { linkUrl: event.target.value })}
                  placeholder="Links to (optional) — /courses/python or https://…"
                  aria-label={`Image ${index + 1} link`}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                aria-label={`Remove image ${index + 1}`}
                className="mt-0.5 shrink-0 text-rose-600 hover:bg-rose-50"
                onClick={() => onChange(value.filter((entry) => entry.id !== image.id))}
              />
            </div>
          )}
        />
      )}

      <Button variant="secondary" size="sm" icon={ImagePlus} onClick={() => setPickerOpen(true)}>
        Add from media library
      </Button>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multiple
        onSelect={(items) => {
          addFromLibrary(items)
          setPickerOpen(false)
        }}
      />

      <MediaPicker
        open={Boolean(replacing)}
        onOpenChange={(open) => !open && setReplacing(undefined)}
        onSelect={(items) => {
          const media = items[0]
          if (media && replacing) patch(replacing, { media })
          setReplacing(undefined)
        }}
      />
    </div>
  )
}
