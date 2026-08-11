import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { ApiError } from '../../api'
import type { CourseCreate } from '../../api/resources/courses'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { Checkbox } from '../../components/form/Checkbox'
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { MultiSelect } from '../../components/form/MultiSelect'
import { NumberInput } from '../../components/form/NumberInput'
import { RichTextEditor } from '../../components/form/RichTextEditor'
import { Select } from '../../components/form/Select'
import { SeoFields } from '../../components/form/SeoFields'
import { SlugInput } from '../../components/form/SlugInput'
import { TagInput } from '../../components/form/TagInput'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { SyllabusEditor } from './SyllabusEditor'
import {
  courseSchema,
  emptyCourse,
  LEVEL_OPTIONS,
  MODE_OPTIONS,
  STATUS_OPTIONS,
  type CourseFormValues,
} from './courseSchema'
import { useCourse, useCourseReferenceData, useCreateCourse, useUpdateCourse } from './useCourses'

export default function CourseFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = useCourse(id)
  const create = useCreateCourse()
  const update = useUpdateCourse()
  const { categoryOptions, branchOptions } = useCourseReferenceData()

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: emptyCourse(),
    mode: 'onBlur',
  })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = form

  // Populate once the record arrives; `reset` also clears the dirty flag so the
  // guard does not fire on an untouched form.
  useEffect(() => {
    if (existing.data) reset(existing.data as CourseFormValues)
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting)

  // `useWatch` rather than `watch()` — the latter subscribes outside React's
  // knowledge and the hook rules reject it.
  const title = useWatch({ control, name: 'title' })
  const slug = useWatch({ control, name: 'slug' })
  const shortDescription = useWatch({ control, name: 'shortDescription' })

  const saving = create.isPending || update.isPending

  async function onSubmit(values: CourseFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: values })
        toast.success('Course updated.')
      } else {
        await create.mutateAsync(values as CourseCreate)
        toast.success('Course created.')
      }
      navigate('/courses')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        // Map server-side validation back onto the offending inputs.
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof CourseFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this course', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading course…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this course">
        <p>{(existing.error as Error).message}</p>
        <Link to="/courses" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to courses
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Course' : 'Add Course'}
        breadcrumb={[{ label: 'Courses', to: '/courses' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This course could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Basics" />
            <CardBody className="space-y-5">
              <FormField label="Course title" required error={errors.title?.message}>
                <Input {...register('title')} placeholder="e.g. MERN Stack Development" />
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
                      baseUrl="techcadd.com/courses/"
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Short description"
                required
                description="Shown on course cards and search listings."
                error={errors.shortDescription?.message}
              >
                <Textarea {...register('shortDescription')} rows={3} maxLength={200} showCount />
              </FormField>

              <FormField label="Full description" error={errors.description?.message}>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Syllabus" subtitle="Drag to reorder; each module can list its topics" />
            <CardBody>
              <Controller
                control={control}
                name="syllabus"
                render={({ field }) => (
                  <SyllabusEditor value={field.value} onChange={field.onChange} />
                )}
              />
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Details" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <FormField label="Duration" required error={errors.duration?.message}>
                <Input {...register('duration')} placeholder="e.g. 6 months" />
              </FormField>

              <FormField label="Level">
                <Select {...register('level')} options={LEVEL_OPTIONS} />
              </FormField>

              <FormField label="Full fee" required error={errors.fee?.message}>
                <Controller
                  control={control}
                  name="fee"
                  render={({ field }) => (
                    <NumberInput
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(value === '' ? undefined : value)}
                      min={0}
                      prefix="₹"
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Discounted fee"
                description="Leave blank if there is no offer."
                error={errors.discountedFee?.message}
              >
                <Controller
                  control={control}
                  name="discountedFee"
                  render={({ field }) => (
                    <NumberInput
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(value === '' ? undefined : value)}
                      min={0}
                      prefix="₹"
                    />
                  )}
                />
              </FormField>

              <FormField label="Highlights" className="sm:col-span-2">
                <Controller
                  control={control}
                  name="highlights"
                  render={({ field }) => (
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="e.g. Placement assistance"
                    />
                  )}
                />
              </FormField>

              <FormField label="Eligibility">
                <Input {...register('eligibility')} placeholder="e.g. 12th pass" />
              </FormField>

              <FormField label="Certification">
                <Input {...register('certification')} placeholder="e.g. TechCadd certificate" />
              </FormField>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card flush>
            <CardHeader
              title="Thumbnail"
              subtitle="Shown on the course list and on cards across the site"
            />
            <CardBody>
              <Controller
                control={control}
                name="thumbnail"
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

              <FormField label="Delivery mode">
                <Select {...register('mode')} options={MODE_OPTIONS} />
              </FormField>

              <FormField
                label="Category"
                description={
                  categoryOptions.length === 0 ? 'No categories exist yet.' : undefined
                }
              >
                {/* Controlled — see the note on FacultyFormPage's branch select. */}
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      options={categoryOptions}
                      placeholder="Uncategorised"
                      disabled={categoryOptions.length === 0}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Branches offered at"
                description={branchOptions.length === 0 ? 'No branches exist yet.' : undefined}
              >
                <Controller
                  control={control}
                  name="branchIds"
                  render={({ field }) => (
                    <MultiSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={branchOptions}
                      placeholder="All branches"
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
                    label="Featured course"
                    description="Pinned to the homepage."
                  />
                )}
              />
            </CardBody>
          </Card>

          <Controller
            control={control}
            name="seo"
            render={({ field }) => (
              <SeoFields
                value={field.value}
                onChange={field.onChange}
                previewUrl={`techcadd.com/courses/${slug || 'your-slug'}`}
                fallbackTitle={title}
                fallbackDescription={shortDescription}
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
        cancelTo="/courses"
        submitLabel={isEdit ? 'Save changes' : 'Create course'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="course"
      />
    </form>
  )
}
