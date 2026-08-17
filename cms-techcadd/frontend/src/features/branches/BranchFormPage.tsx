import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'

import { ApiError } from '../../api'
import { AppearsOn } from '../../components/common/AppearsOn'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { Checkbox } from '../../components/form/Checkbox'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { Select } from '../../components/form/Select'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import type { OpeningHours } from '../../types'
import { STATUS_OPTIONS } from '../courses/courseSchema'
import { branchSchema, DAYS, emptyBranch, type BranchFormValues } from './branchSchema'
import { branchModuleHooks, facultyRefHooks } from './useBranchesModule'

export default function BranchFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const existing = branchModuleHooks.useOne(id)
  const create = branchModuleHooks.useCreate()
  const update = branchModuleHooks.useUpdate()
  const faculty = facultyRefHooks.useList({ page: 1, pageSize: 200 })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: emptyBranch(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) reset(existing.data as BranchFormValues)
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

  const managerOptions = (faculty.data?.items ?? []).map((member) => ({
    value: member.id,
    label: member.name,
  }))

  async function onSubmit(values: BranchFormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: values })
        toast.success('Branch updated.')
      } else {
        await create.mutateAsync(values)
        toast.success('Branch added.')
      }
      navigate('/branches')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof BranchFormValues, { message })
        }
        toast.error('Please fix the highlighted fields.')
        return
      }
      toast.error('Could not save this branch', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading branch…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this branch">
        <p>{(existing.error as Error).message}</p>
        <Link to="/branches" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to branches
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Branch' : 'Add Branch'}
        breadcrumb={[{ label: 'Branches', to: '/branches' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <AppearsOn module="branches" record={watched} saved={isEdit} />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This branch could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Location" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <FormField label="Branch name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="e.g. Jalandhar" />
              </FormField>

              <FormField
                label="Short code"
                required
                description="Used internally, e.g. on enquiry records."
                error={errors.code?.message}
              >
                <Input {...register('code')} placeholder="e.g. JLD" className="uppercase" />
              </FormField>

              <FormField
                label="Address line 1"
                required
                error={errors.addressLine1?.message}
                className="sm:col-span-2"
              >
                <Input {...register('addressLine1')} placeholder="Building, street" />
              </FormField>

              <FormField label="Address line 2" className="sm:col-span-2">
                <Input {...register('addressLine2')} placeholder="Area, landmark" />
              </FormField>

              <FormField label="City" required error={errors.city?.message}>
                <Input {...register('city')} placeholder="e.g. Jalandhar" />
              </FormField>

              <FormField label="State" required error={errors.state?.message}>
                <Input {...register('state')} placeholder="e.g. Punjab" />
              </FormField>

              <FormField label="PIN code" required error={errors.pincode?.message}>
                <Input {...register('pincode')} inputMode="numeric" placeholder="e.g. 144001" />
              </FormField>

              <FormField label="Map embed URL" description="Paste a Google Maps embed link.">
                <Input {...register('mapEmbedUrl')} placeholder="https://maps.google.com/…" />
              </FormField>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Contact" />
            <CardBody className="space-y-5">
              <FormField
                label="Phone numbers"
                required
                error={
                  errors.phones?.message ??
                  (Array.isArray(errors.phones)
                    ? errors.phones.find(Boolean)?.message
                    : undefined)
                }
              >
                <Controller
                  control={control}
                  name="phones"
                  render={({ field }) => (
                    <div className="space-y-2">
                      {field.value.map((phone, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={phone}
                            onChange={(event) => {
                              const next = [...field.value]
                              next[index] = event.target.value
                              field.onChange(next)
                            }}
                            placeholder="+91 98765 43210"
                            aria-label={`Phone number ${index + 1}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            aria-label={`Remove phone number ${index + 1}`}
                            // Never let the last one go — at least one is required.
                            disabled={field.value.length === 1}
                            className="shrink-0 text-rose-600 hover:bg-rose-50"
                            onClick={() =>
                              field.onChange(field.value.filter((_, i) => i !== index))
                            }
                          />
                        </div>
                      ))}

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Plus}
                        onClick={() => field.onChange([...field.value, ''])}
                      >
                        Add number
                      </Button>
                    </div>
                  )}
                />
              </FormField>

              <FormField label="Email" error={errors.email?.message}>
                <Input {...register('email')} type="email" placeholder="jalandhar@techcadd.com" />
              </FormField>
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Opening hours" />
            <CardBody>
              <Controller
                control={control}
                name="hours"
                render={({ field }) => (
                  <ul className="space-y-2">
                    {DAYS.map(({ value, label }) => {
                      const entry: OpeningHours =
                        field.value.find((h) => h.day === value) ??
                        { day: value, closed: true }

                      const patch = (next: Partial<OpeningHours>) =>
                        field.onChange(
                          DAYS.map(({ value: day }) => {
                            const current =
                              field.value.find((h) => h.day === day) ?? { day, closed: true }
                            return day === value ? { ...current, ...next } : current
                          }),
                        )

                      return (
                        <li key={value} className="flex flex-wrap items-center gap-3">
                          <span className="w-24 shrink-0 text-sm text-slate-700">{label}</span>

                          <Checkbox
                            checked={!entry.closed}
                            onCheckedChange={(open) => patch({ closed: !open })}
                            aria-label={`${label} open`}
                          />

                          <input
                            type="time"
                            value={entry.open ?? '09:00'}
                            disabled={entry.closed}
                            aria-label={`${label} opening time`}
                            onChange={(event) => patch({ open: event.target.value })}
                            className="h-9 rounded-lg border border-slate-200 px-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                          />
                          <span className="text-xs text-slate-400">to</span>
                          <input
                            type="time"
                            value={entry.close ?? '18:00'}
                            disabled={entry.closed}
                            aria-label={`${label} closing time`}
                            onChange={(event) => patch({ close: event.target.value })}
                            className="h-9 rounded-lg border border-slate-200 px-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                          />

                          {entry.closed && (
                            <span className="text-xs font-medium text-slate-400">Closed</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              />
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

              <FormField
                label="Branch manager"
                description={managerOptions.length === 0 ? 'No faculty exist yet.' : undefined}
              >
                {/* Controlled — see the note on FacultyFormPage's branch select. */}
                <Controller
                  control={control}
                  name="managerId"
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      options={managerOptions}
                      placeholder="Not assigned"
                      disabled={managerOptions.length === 0}
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
        cancelTo="/branches"
        submitLabel={isEdit ? 'Save changes' : 'Add branch'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="branch"
      />
    </form>
  )
}
