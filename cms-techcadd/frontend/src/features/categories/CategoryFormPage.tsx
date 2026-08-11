import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { ApiError } from '../../api'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { Select } from '../../components/form/Select'
import { SlugInput } from '../../components/form/SlugInput'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { categoryHooks } from './useCategories'
import { categorySchema, emptyCategory, ICON_OPTIONS, type CategoryFormValues } from './categorySchema'

export default function CategoryFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = categoryHooks.useOne(id)
  const create = categoryHooks.useCreate()
  const update = categoryHooks.useUpdate()
  const siblings = categoryHooks.useList({ page: 1, pageSize: 500 })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyCategory(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) reset(existing.data as CategoryFormValues)
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting)
  const name = useWatch({ control, name: 'name' })
  const saving = create.isPending || update.isPending

  // Nesting is capped at two levels, and a category can never parent itself.
  const parentOptions = (siblings.data?.items ?? [])
    .filter((category) => category.id !== id && !category.parentId)
    .map((category) => ({ value: category.id, label: category.name }))

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: values })
        toast.success('Category updated.')
      } else {
        await create.mutateAsync(values)
        toast.success('Category created.')
      }
      navigate('/categories')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof CategoryFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this category', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading category…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this category">
        <p>{(existing.error as Error).message}</p>
        <Link to="/categories" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to categories
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Category' : 'Add Category'}
        breadcrumb={[{ label: 'Categories', to: '/categories' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This category could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <Card flush className="max-w-3xl">
        <CardHeader title="Category details" />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <FormField label="Name" required error={errors.name?.message} className="sm:col-span-2">
            <Input {...register('name')} placeholder="e.g. Web Development" />
          </FormField>

          <FormField label="URL slug" required error={errors.slug?.message} className="sm:col-span-2">
            <Controller
              control={control}
              name="slug"
              render={({ field }) => (
                <SlugInput
                  value={field.value}
                  onChange={field.onChange}
                  source={name}
                  baseUrl="techcadd.com/courses/category/"
                />
              )}
            />
          </FormField>

          <FormField
            label="Parent category"
            description={parentOptions.length === 0 ? 'No top-level categories yet.' : 'Nesting is limited to two levels.'}
          >
            {/* Controlled — see the note on FacultyFormPage's branch select. */}
            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value ?? ''}
                  options={parentOptions}
                  placeholder="None — top level"
                  disabled={parentOptions.length === 0}
                />
              )}
            />
          </FormField>

          <FormField label="Status">
            <Select {...register('status')} options={STATUS_OPTIONS} />
          </FormField>

          <FormField label="Icon">
            <Select {...register('icon')} options={ICON_OPTIONS} />
          </FormField>

          <FormField label="Accent colour">
            <Controller
              control={control}
              name="accentColor"
              render={({ field }) => (
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={field.value ?? '#5f6fff'}
                    onChange={(event) => field.onChange(event.target.value)}
                    aria-label="Accent colour swatch"
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />
                  <Input
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder="#5f6fff"
                    aria-label="Accent colour hex value"
                    className="font-mono text-xs"
                  />
                </div>
              )}
            />
          </FormField>

          <FormField label="Description" className="sm:col-span-2">
            <Textarea {...register('description')} rows={3} maxLength={200} showCount />
          </FormField>
        </CardBody>
      </Card>

      <FormFooter
        cancelTo="/categories"
        submitLabel={isEdit ? 'Save changes' : 'Create category'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="category"
      />
    </form>
  )
}
