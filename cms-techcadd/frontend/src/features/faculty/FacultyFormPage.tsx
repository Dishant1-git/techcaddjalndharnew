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
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { NumberInput } from '../../components/form/NumberInput'
import { Select } from '../../components/form/Select'
import { TagInput } from '../../components/form/TagInput'
import { Textarea } from '../../components/form/Textarea'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { emptyFaculty, facultySchema, type FacultyFormValues } from './facultySchema'
import { branchHooks, facultyHooks } from './useFaculty'

export default function FacultyFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = facultyHooks.useOne(id)
  const create = facultyHooks.useCreate()
  const update = facultyHooks.useUpdate()
  const branches = branchHooks.useList({ page: 1, pageSize: 200 })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    defaultValues: emptyFaculty(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) reset(existing.data as FacultyFormValues)
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

  const branchOptions = (branches.data?.items ?? []).map((branch) => ({
    value: branch.id,
    label: branch.name,
  }))

  async function onSubmit(values: FacultyFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: values })
        toast.success('Faculty member updated.')
      } else {
        await create.mutateAsync(values)
        toast.success('Faculty member added.')
      }
      navigate('/faculty')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof FacultyFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this profile', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading profile…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this profile">
        <p>{(existing.error as Error).message}</p>
        <Link to="/faculty" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to faculty
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Trainer' : 'Add Trainer'}
        breadcrumb={[{ label: 'Faculty', to: '/faculty' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <AppearsOn module="faculty" record={watched} saved={isEdit} />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This profile could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Profile" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <FormField label="Full name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="e.g. Rajesh Kumar" />
              </FormField>

              <FormField label="Designation" required error={errors.designation?.message}>
                <Input {...register('designation')} placeholder="e.g. Senior Trainer" />
              </FormField>

              <FormField label="Qualifications">
                <Input {...register('qualifications')} placeholder="e.g. M.Tech, B.Tech CSE" />
              </FormField>

              <FormField
                label="Years of experience"
                required
                error={errors.experienceYears?.message}
              >
                <Controller
                  control={control}
                  name="experienceYears"
                  render={({ field }) => (
                    <NumberInput
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(value === '' ? undefined : value)}
                      min={0}
                      max={60}
                      suffix="yrs"
                    />
                  )}
                />
              </FormField>

              <FormField label="Areas of expertise" className="sm:col-span-2">
                <Controller
                  control={control}
                  name="expertise"
                  render={({ field }) => (
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="e.g. React, Node.js"
                      maxTags={10}
                    />
                  )}
                />
              </FormField>

              <FormField label="Bio" className="sm:col-span-2">
                <Textarea {...register('bio')} rows={4} maxLength={600} showCount />
              </FormField>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Contact and links" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <FormField label="Email" error={errors.email?.message}>
                <Input {...register('email')} type="email" placeholder="name@techcadd.com" />
              </FormField>

              <FormField label="LinkedIn">
                <Input {...register('social.linkedin')} placeholder="https://linkedin.com/in/…" />
              </FormField>

              <FormField label="X">
                <Input {...register('social.x')} placeholder="https://x.com/…" />
              </FormField>

              <FormField label="GitHub">
                <Input {...register('social.github')} placeholder="https://github.com/…" />
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
            <CardHeader title="Placement" />
            <CardBody className="space-y-5">
              <FormField label="Status">
                <Select {...register('status')} options={STATUS_OPTIONS} />
              </FormField>

              <FormField
                label="Branch"
                description={branchOptions.length === 0 ? 'No branches exist yet.' : undefined}
              >
                {/*
                  Controlled, not registered: the branch list arrives after the
                  record does, so an uncontrolled <select> is reset to the
                  placeholder while its option is still missing and never
                  recovers — the form would show "All branches" for a trainer
                  who has one. React re-applies a controlled value once the
                  options render.
                */}
                <Controller
                  control={control}
                  name="branchId"
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      options={branchOptions}
                      placeholder="All branches"
                      disabled={branchOptions.length === 0}
                    />
                  )}
                />
              </FormField>
            </CardBody>
          </Card>
        </div>
      </div>

      <FormFooter
        onPublish={publish}
        cancelTo="/faculty"
        submitLabel={isEdit ? 'Save changes' : 'Add trainer'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="profile"
      />
    </form>
  )
}
