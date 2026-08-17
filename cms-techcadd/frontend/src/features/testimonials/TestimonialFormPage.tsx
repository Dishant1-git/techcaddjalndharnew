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
import { Checkbox } from '../../components/form/Checkbox'
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { Select } from '../../components/form/Select'
import { StarRating } from '../../components/form/StarRating'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import {
  emptyTestimonial,
  testimonialSchema,
  type TestimonialFormValues,
} from './testimonialSchema'
import { courseRefHooks, testimonialHooks } from './useTestimonials'

export default function TestimonialFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = testimonialHooks.useOne(id)
  const create = testimonialHooks.useCreate()
  const update = testimonialHooks.useUpdate()
  const courses = courseRefHooks.useList({ page: 1, pageSize: 200 })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: emptyTestimonial(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) reset(existing.data as TestimonialFormValues)
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting)
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

  const courseOptions = (courses.data?.items ?? []).map((course) => ({
    value: course.id,
    label: course.title,
  }))

  async function onSubmit(values: TestimonialFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: values })
        toast.success('Testimonial updated.')
      } else {
        await create.mutateAsync(values)
        toast.success('Testimonial added.')
      }
      navigate('/testimonials')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof TestimonialFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this testimonial', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading testimonial…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this testimonial">
        <p>{(existing.error as Error).message}</p>
        <Link to="/testimonials" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to testimonials
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Testimonial' : 'Add Testimonial'}
        breadcrumb={[
          { label: 'Testimonials', to: '/testimonials' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <AppearsOn module="testimonials" record={watched} saved={isEdit} />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This testimonial could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Testimonial" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <FormField label="Student name" required error={errors.studentName?.message}>
                <Input {...register('studentName')} placeholder="e.g. Simranjeet Kaur" />
              </FormField>

              <FormField label="Batch" description="e.g. 2025 or Jan 2026.">
                <Input {...register('batch')} placeholder="e.g. 2025" />
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

              <FormField label="Video URL" description="Optional video testimonial.">
                <Input {...register('videoUrl')} placeholder="https://youtube.com/…" />
              </FormField>

              <FormField
                label="Quote"
                required
                error={errors.quote?.message}
                className="sm:col-span-2"
              >
                <Textarea {...register('quote')} rows={5} maxLength={500} showCount />
              </FormField>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card flush>
            <CardHeader title="Photo" />
            <CardBody>
              <Controller
                control={control}
                name="photo"
                render={({ field }) => (
                  <ImageField value={field.value} onChange={field.onChange} aspect="square" />
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

              <FormField
                label="Course"
                description={courseOptions.length === 0 ? 'No courses exist yet.' : undefined}
              >
                {/* Controlled — see the note on FacultyFormPage's branch select. */}
                <Controller
                  control={control}
                  name="courseId"
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      options={courseOptions}
                      placeholder="Not linked"
                      disabled={courseOptions.length === 0}
                    />
                  )}
                />
              </FormField>

              <Controller
                control={control}
                name="featured"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    label="Featured testimonial"
                    description="Shown on the homepage."
                  />
                )}
              />
            </CardBody>
          </Card>
        </div>
      </div>

      <FormFooter
        onPublish={publish}
        cancelTo="/testimonials"
        submitLabel={isEdit ? 'Save changes' : 'Add testimonial'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="testimonial"
      />
    </form>
  )
}
