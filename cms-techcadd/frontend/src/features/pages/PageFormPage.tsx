import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { ApiError } from '../../api'
import { AppearsOn } from '../../components/common/AppearsOn'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { DatePicker } from '../../components/form/DatePicker'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { RichTextEditor } from '../../components/form/RichTextEditor'
import { Select } from '../../components/form/Select'
import { SeoFields } from '../../components/form/SeoFields'
import { SlugInput } from '../../components/form/SlugInput'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { emptyPage, pageSchema, TEMPLATE_OPTIONS, type PageFormValues } from './pageSchema'
import { pageHooks } from './usePages'

export default function PageFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = pageHooks.useOne(id)
  const create = pageHooks.useCreate()
  const update = pageHooks.useUpdate()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: emptyPage(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) reset(existing.data as PageFormValues)
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting)
  const title = useWatch({ control, name: 'title' })
  const slug = useWatch({ control, name: 'slug' })
  const isSystem = useWatch({ control, name: 'system' })
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

  async function onSubmit(values: PageFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: values })
        toast.success('Page updated.')
      } else {
        await create.mutateAsync(values)
        toast.success('Page created.')
      }
      navigate('/pages')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof PageFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this page', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading page…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this page">
        <p>{(existing.error as Error).message}</p>
        <Link to="/pages" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to pages
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Page' : 'Add Page'}
        breadcrumb={[{ label: 'Pages', to: '/pages' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <AppearsOn module="pages" record={watched} saved={isEdit} />

      {isSystem && (
        <Alert tone="info" title="System page">
          This page is required by the website. Its content can be edited, but the slug is locked
          and it cannot be deleted.
        </Alert>
      )}

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This page could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Content" />
            <CardBody className="space-y-5">
              <FormField label="Title" required error={errors.title?.message}>
                <Input {...register('title')} placeholder="e.g. Placement Assistance" />
              </FormField>

              <FormField label="URL slug" required error={errors.slug?.message}>
                <Controller
                  control={control}
                  name="slug"
                  render={({ field }) => (
                    <SlugInput
                      value={field.value}
                      onChange={isSystem ? () => undefined : field.onChange}
                      source={title}
                      baseUrl="techcadd.com/"
                    />
                  )}
                />
              </FormField>

              <FormField label="Body" error={errors.content?.message}>
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card flush>
            <CardHeader title="Publishing" />
            <CardBody className="space-y-5">
              <FormField label="Status">
                <Select {...register('status')} options={STATUS_OPTIONS} />
              </FormField>

              <FormField label="Template" error={errors.template?.message}>
                <Select {...register('template')} options={TEMPLATE_OPTIONS} />
              </FormField>

              <FormField label="Publish date" description="Leave blank to publish immediately.">
                <Controller
                  control={control}
                  name="publishDate"
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </CardBody>
          </Card>

          <Controller
            control={control}
            name="seo"
            render={({ field }) => (
              <SeoFields
                value={field.value}
                onChange={field.onChange}
                previewUrl={`techcadd.com/${slug || 'your-slug'}`}
                fallbackTitle={title}
                errors={{
                  metaTitle: errors.seo?.metaTitle?.message,
                  metaDescription: errors.seo?.metaDescription?.message,
                }}
              />
            )}
          />
        </div>
      </div>

      <FormFooter
        onPublish={publish}
        cancelTo="/pages"
        submitLabel={isEdit ? 'Save changes' : 'Create page'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="page"
      />
    </form>
  )
}
