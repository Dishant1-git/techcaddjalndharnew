import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { ApiError } from '../../api'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { NumberInput } from '../../components/form/NumberInput'
import { Select } from '../../components/form/Select'
import { StarRating } from '../../components/form/StarRating'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { emptyReview, reviewSchema, SOURCE_OPTIONS, type ReviewFormValues } from './reviewSchema'
import { reviewHooks } from './useReviews'

export default function ReviewFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = reviewHooks.useOne(id)
  const create = reviewHooks.useCreate()
  const update = reviewHooks.useUpdate()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: emptyReview(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) reset(existing.data as ReviewFormValues)
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting)
  const saving = create.isPending || update.isPending

  async function onSubmit(values: ReviewFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: values })
        toast.success('Review updated.')
      } else {
        await create.mutateAsync(values)
        toast.success('Review added.')
      }
      navigate('/reviews')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof ReviewFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this review', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading review…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this review">
        <p>{(existing.error as Error).message}</p>
        <Link to="/reviews" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to reviews
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Review' : 'Add Review'}
        breadcrumb={[{ label: 'Reviews', to: '/reviews' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This review could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="The review" />
            <CardBody className="space-y-5">
              <FormField label="Name" required error={errors.authorName?.message}>
                <Input {...register('authorName')} placeholder="e.g. Simranjeet Kaur" />
              </FormField>

              <FormField label="Rating" required error={errors.rating?.message}>
                <Controller
                  control={control}
                  name="rating"
                  render={({ field }) => (
                    <StarRating value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>

              <FormField label="Review" required error={errors.quote?.message}>
                <Textarea {...register('quote')} rows={5} />
              </FormField>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card flush>
            <CardHeader title="Details" />
            <CardBody className="space-y-5">
              <FormField label="Status">
                <Select {...register('status')} options={STATUS_OPTIONS} />
              </FormField>

              <FormField
                label="Source"
                description="Only mark it Google if it was genuinely left there — the card shows the Google mark."
              >
                <Select {...register('source')} options={SOURCE_OPTIONS} />
              </FormField>

              <FormField
                label="Reviewed on"
                description="As displayed, e.g. “March 2026”."
                error={errors.reviewedOn?.message}
              >
                <Input {...register('reviewedOn')} placeholder="March 2026" />
              </FormField>

              <FormField label="Course" error={errors.courseName?.message}>
                <Input {...register('courseName')} placeholder="e.g. MERN Stack Development" />
              </FormField>

              <FormField
                label="Order"
                description="Lower numbers come first."
                error={errors.order?.message}
              >
                <Controller
                  control={control}
                  name="order"
                  render={({ field }) => (
                    <NumberInput
                      value={field.value ?? 0}
                      onChange={(value) => field.onChange(value === '' ? 0 : value)}
                      min={0}
                    />
                  )}
                />
              </FormField>
            </CardBody>
          </Card>
        </div>
      </div>

      <FormFooter
        cancelTo="/reviews"
        submitLabel={isEdit ? 'Save changes' : 'Add review'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="review"
      />
    </form>
  )
}
