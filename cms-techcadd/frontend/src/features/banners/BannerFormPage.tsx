import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { ApiError } from '../../api'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { DatePicker } from '../../components/form/DatePicker'
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { Select } from '../../components/form/Select'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { bannerSchema, emptyBanner, PLACEMENT_OPTIONS, type BannerFormValues } from './bannerSchema'
import { bannerHooks } from './useBanners'

export default function BannerFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = bannerHooks.useOne(id)
  const create = bannerHooks.useCreate()
  const update = bannerHooks.useUpdate()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: emptyBanner(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) reset(existing.data as BannerFormValues)
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting)
  const saving = create.isPending || update.isPending

  async function onSubmit(values: BannerFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: values })
        toast.success('Banner updated.')
      } else {
        await create.mutateAsync(values)
        toast.success('Banner created.')
      }
      navigate('/banners')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof BannerFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this banner', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading banner…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this banner">
        <p>{(existing.error as Error).message}</p>
        <Link to="/banners" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to banners
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Banner' : 'Add Banner'}
        breadcrumb={[{ label: 'Banners', to: '/banners' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This banner could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Images" subtitle="A separate mobile crop keeps text readable on phones" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <FormField label="Desktop image">
                <Controller
                  control={control}
                  name="desktopImage"
                  render={({ field }) => (
                    <ImageField value={field.value} onChange={field.onChange} aspect="wide" />
                  )}
                />
              </FormField>

              <FormField label="Mobile image">
                <Controller
                  control={control}
                  name="mobileImage"
                  render={({ field }) => (
                    <ImageField value={field.value} onChange={field.onChange} aspect="square" />
                  )}
                />
              </FormField>

              <FormField
                label="Alt text"
                required
                description="Describes the banner for screen readers and when images fail to load."
                error={errors.altText?.message}
                className="sm:col-span-2"
              >
                <Input {...register('altText')} placeholder="e.g. Admissions open for 2026 batch" />
              </FormField>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Content and link" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <FormField label="Title" required error={errors.title?.message} className="sm:col-span-2">
                <Input {...register('title')} placeholder="Internal name for this banner" />
              </FormField>

              <FormField label="CTA text" description="Leave blank for a non-clickable banner.">
                <Input {...register('ctaText')} placeholder="e.g. Enrol now" />
              </FormField>

              <FormField label="Link URL" error={errors.linkUrl?.message}>
                <Input {...register('linkUrl')} placeholder="https://techcadd.com/courses" />
              </FormField>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card flush>
            <CardHeader title="Placement and schedule" />
            <CardBody className="space-y-5">
              <FormField label="Status">
                <Select {...register('status')} options={STATUS_OPTIONS} />
              </FormField>

              <FormField label="Placement">
                <Select {...register('placement')} options={PLACEMENT_OPTIONS} />
              </FormField>

              <FormField label="Starts on" description="Leave blank to start immediately.">
                <Controller
                  control={control}
                  name="startsAt"
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>

              <FormField
                label="Ends on"
                description="Leave blank to run indefinitely."
                error={errors.endsAt?.message}
              >
                <Controller
                  control={control}
                  name="endsAt"
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
        cancelTo="/banners"
        submitLabel={isEdit ? 'Save changes' : 'Create banner'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="banner"
      />
    </form>
  )
}
