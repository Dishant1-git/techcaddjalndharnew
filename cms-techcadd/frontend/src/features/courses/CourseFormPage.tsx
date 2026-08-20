import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { ApiError } from '../../api'
import type { CourseCreate } from '../../api/resources/courses'
import { AppearsOn } from '../../components/common/AppearsOn'
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
import { PreviewPane } from '../../components/preview/PreviewPane'
import { SITE_ORIGIN } from '../../components/preview/previewProtocol'
import { CourseLayoutEditor } from './CourseLayoutEditor'
import { SyllabusEditor } from './SyllabusEditor'
import {
  COURSE_SECTIONS,
  toPreviewDraft,
  type CourseSectionId,
} from './coursePreview'
import {
  courseSchema,
  emptyCourse,
  LEVEL_OPTIONS,
  MODE_OPTIONS,
  STATUS_OPTIONS,
  type CourseFormValues,
} from './courseSchema'
import { useCourse, useCourseReferenceData, useCreateCourse, useUpdateCourse } from './useCourses'

/** Schema keys as they are labelled on this page, for the error summary. */
const FIELD_LABELS: Record<string, string> = {
  overview: 'Overview',
  videoUrl: 'Video URL',
  videoTitle: 'Video title',
  hiddenSections: 'Hidden sections',
  sections: 'Page blocks',
  title: 'Course title',
  slug: 'URL slug',
  categoryId: 'Category',
  segment: 'Section',
  tagline: 'Tagline',
  demand: 'Who hires for it',
  careers: 'Careers',
  tools: 'Tools',
  salary: 'Salary',
  shortDescription: 'Short description',
  description: 'Full description',
  duration: 'Duration',
  fee: 'Fee',
  discountedFee: 'Discounted fee',
  level: 'Level',
  mode: 'Delivery mode',
  thumbnail: 'Thumbnail',
  gallery: 'Gallery',
  syllabus: 'Syllabus',
  highlights: 'Highlights',
  eligibility: 'Eligibility',
  certification: 'Certification',
  branchIds: 'Branches',
  featured: 'Featured course',
  seo: 'SEO',
  status: 'Status',
}

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
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = form

  /*
    Populate once the record arrives; `reset` also clears the dirty flag so the
    guard does not fire on an untouched form.

    Layered over `emptyCourse()` rather than used raw. A course saved before a
    field existed — or fetched from an API that does not send one — arrives
    without it, and `undefined` fails the schema for every required array on
    the record. That produced a save that refused with "check the highlighted
    fields" while highlighting nothing, because the field at fault has no
    input to highlight. Defaults fill those gaps; anything the record does
    carry still wins.
  */
  useEffect(() => {
    if (existing.data) {
      reset({ ...emptyCourse(), ...(existing.data as Partial<CourseFormValues>) })
    }
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting)

  // `useWatch` rather than `watch()` — the latter subscribes outside React's
  // knowledge and the hook rules reject it.
  const title = useWatch({ control, name: 'title' })
  const slug = useWatch({ control, name: 'slug' })
  const shortDescription = useWatch({ control, name: 'shortDescription' })

  const saving = create.isPending || update.isPending

  const [section, setSection] = useState<CourseSectionId>('basics')
  const sectionRefs = useRef(new Map<string, HTMLElement | null>())

  /** Scrolls the editor column; the preview follows via PreviewPane's focus. */
  function goToSection(id: CourseSectionId) {
    setSection(id)
    sectionRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }


  // Feeds the "where this appears" note — it shows the live URL, which moves

  // with the slug as it is typed.

  const watched = useWatch({ control }) as Record<string, unknown>

  /**
   * What the preview renders.
   *
   * Recomputed on every keystroke, which is the point — but memoised on the
   * watched values so an unrelated re-render does not post an identical draft
   * into the frame and restart its animations.
   */
  const previewDraft = useMemo(
    () => toPreviewDraft(watched as Parameters<typeof toPreviewDraft>[0], categoryOptions),
    [watched, categoryOptions],
  )

  const previewAnchor = COURSE_SECTIONS.find((s) => s.id === section)?.anchor


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

      <AppearsOn module="courses" record={watched} saved={isEdit} />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This course could not be saved">
          {/*
            Named, not just "check the highlighted fields".

            Not every field in the schema has an input on this page, so a
            failure on one of those left the editor reading an instruction they
            could not act on. Listing the labels means the message is always
            actionable, even when the offending value is one the form does not
            show.
          */}
          <p>Please fix:</p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <strong className="font-medium">{FIELD_LABELS[field] ?? field}</strong>
                {(error as { message?: string })?.message
                  ? ` — ${(error as { message?: string }).message}`
                  : ''}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/*
        Editor on the left, the live website on the right.

        The preview is the real site in a frame, not a rebuilt approximation,
        so the question "what will this look like" is answered here rather than
        by saving and going to look. Below xl the two stack: at that width a
        split pane leaves neither side usable.
      */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {/* Section switcher. Selecting one scrolls this column and tells the
              preview to scroll to the part of the page it controls. */}
          <nav
            aria-label="Course sections"
            className="sticky top-0 z-10 -mx-1 flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white/95 p-1 backdrop-blur"
          >
            {COURSE_SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSection(item.id)}
                aria-current={section === item.id ? 'true' : undefined}
                className={
                  'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ' +
                  (section === item.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700')
                }
              >
                {item.label}
              </button>
            ))}
          </nav>

          <section
            id="section-basics"
            ref={(node) => { sectionRefs.current.set('basics', node) }}
            aria-label="Basics"
            className="scroll-mt-4"
          >
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
          </section>

          <section
            id="section-page-copy"
            ref={(node) => { sectionRefs.current.set('page-copy', node) }}
            aria-label="Course page copy"
            className="scroll-mt-4"
          >
          <Card flush>
            <CardHeader
              title="Course page copy"
              subtitle="What the public course page is built from — the rest of the page is generated around these"
            />
            <CardBody className="space-y-5">
              <FormField
                label="Tagline"
                description="One line: what this course actually is."
                error={errors.tagline?.message}
              >
                <Input
                  {...register('tagline')}
                  placeholder="the language behind almost every AI and backend job advertised today"
                />
              </FormField>

              <FormField
                label="Who hires for it"
                description="One sentence on demand in the local market."
                error={errors.demand?.message}
              >
                <Textarea {...register('demand')} rows={3} />
              </FormField>

              <FormField
                label="Overview"
                description="Replaces the generated overview paragraphs. One paragraph per line. Leave empty to keep the generated copy."
                error={errors.overview?.message}
              >
                <Textarea {...register('overview')} rows={5} />
              </FormField>

              <FormField
                label="Walkthrough video"
                description="A YouTube or Vimeo address. Shown in the overview section."
                error={errors.videoUrl?.message}
              >
                <Input
                  {...register('videoUrl')}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </FormField>

              <FormField label="Video title" error={errors.videoTitle?.message}>
                <Input {...register('videoTitle')} placeholder="Course walkthrough" />
              </FormField>

              <FormField label="Careers" description="Job titles this course leads to.">
                <Controller
                  control={control}
                  name="careers"
                  render={({ field }) => (
                    <TagInput value={field.value} onChange={field.onChange} maxTags={12} />
                  )}
                />
              </FormField>

              <FormField label="Tools" description="Software and frameworks taught.">
                <Controller
                  control={control}
                  name="tools"
                  render={({ field }) => (
                    <TagInput value={field.value} onChange={field.onChange} maxTags={20} />
                  )}
                />
              </FormField>

              <FormField
                label="Salary band"
                description="A realistic fresher range for the region."
                error={errors.salary?.message}
              >
                <Input {...register('salary')} placeholder="₹2.4–4.2 LPA" />
              </FormField>
            </CardBody>
          </Card>
          </section>

          <section
            id="section-curriculum"
            ref={(node) => { sectionRefs.current.set('curriculum', node) }}
            aria-label="Curriculum"
            className="scroll-mt-4"
          >
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
          </section>

          <section
            id="section-layout"
            ref={(node) => { sectionRefs.current.set('layout', node) }}
            aria-label="Page layout"
            className="scroll-mt-4"
          >
          <Card flush>
            <CardHeader
              title="Page layout"
              subtitle="Every section of the course page, in order. Switch one off, or add your own between any two."
            />
            <CardBody>
              <Controller
                control={control}
                name="sections"
                render={({ field: sectionsField }) => (
                  <Controller
                    control={control}
                    name="hiddenSections"
                    render={({ field: hiddenField }) => (
                      <CourseLayoutEditor
                        sections={sectionsField.value ?? []}
                        hidden={hiddenField.value ?? []}
                        onSectionsChange={sectionsField.onChange}
                        onHiddenChange={hiddenField.onChange}
                        errors={
                          errors.sections as unknown as
                            | Record<number, Record<string, string | undefined>>
                            | undefined
                        }
                      />
                    )}
                  />
                )}
              />
            </CardBody>
          </Card>
          </section>

          <section
            id="section-details"
            ref={(node) => { sectionRefs.current.set('details', node) }}
            aria-label="Details"
            className="scroll-mt-4"
          >
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
                <Input {...register('certification')} placeholder="e.g. techcadd certificate" />
              </FormField>
            </CardBody>
          </Card>
          </section>

          <section
            id="section-media"
            ref={(node) => { sectionRefs.current.set('media', node) }}
            aria-label="Media"
            className="scroll-mt-4"
          >
          <Card flush>
            <CardHeader
              title="Thumbnail"
              subtitle="Shown on the course list and on cards across the site"
            />
            <CardBody>
              <FormField label="" error={errors.thumbnail?.message}>
                <Controller
                  control={control}
                  name="thumbnail"
                  render={({ field }) => (
                    <ImageField value={field.value} onChange={field.onChange} aspect="video" />
                  )}
                />
              </FormField>
            </CardBody>
          </Card>
          </section>

          <section
            id="section-publishing"
            ref={(node) => { sectionRefs.current.set('publishing', node) }}
            aria-label="Publishing"
            className="scroll-mt-4"
          >
          <Card flush>
            <CardHeader title="Publishing" />
            <CardBody className="space-y-5">
              <FormField label="Status">
                <Select {...register('status')} options={STATUS_OPTIONS} />
              </FormField>

              <FormField
                label="Section"
                description="Which part of the site this course appears under."
              >
                <Select
                  {...register('segment')}
                  options={[
                    { value: 'courses', label: 'Courses' },
                    { value: 'internship-training', label: 'Internship training' },
                    { value: 'after-12th-courses', label: 'After 12th' },
                  ]}
                />
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
          </section>

          <section
            id="section-seo"
            ref={(node) => { sectionRefs.current.set('seo', node) }}
            aria-label="SEO"
            className="scroll-mt-4"
          >
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
          </section>
        </div>

        {/*
          Sticky, and its own scroll container, so the page under review stays
          in view while the editor works down the form. `liveUrl` is only
          offered once the course exists and is published — a link to a page
          that would 404 is worse than no link.
        */}
        <PreviewPane
          kind="course"
          draft={previewDraft}
          focus={previewAnchor}
          liveUrl={
            isEdit && watched.status === 'published' && slug
              ? `${SITE_ORIGIN}/${watched.segment ?? 'courses'}/${slug}`
              : undefined
          }
          className="h-[70vh] xl:sticky xl:top-4 xl:h-[calc(100vh-7rem)]"
        />
      </div>

      <FormFooter
        onPublish={publish}
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
