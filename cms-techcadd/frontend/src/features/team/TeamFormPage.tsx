import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Copy } from 'lucide-react'

import { ApiError } from '../../api'
import { type UserWithTemporaryPassword } from '../../api/resources/users'
import { AppearsOn } from '../../components/common/AppearsOn'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { Select } from '../../components/form/Select'
import { Switch } from '../../components/form/Switch'
import { FormFooter } from '../../components/layout/FormFooter'
import { PageHeader } from '../../components/layout/PageHeader'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'
import {
  emptyTeamMember,
  ROLE_DESCRIPTIONS,
  ROLE_OPTIONS,
  teamSchema,
  type TeamFormValues,
} from './teamSchema'
import { teamHooks } from './useTeam'

export default function TeamFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()
  const { session } = useAuth()

  const existing = teamHooks.useOne(id)
  const create = teamHooks.useCreate()
  const update = teamHooks.useUpdate()

  /**
   * The generated password, shown once after creating.
   *
   * The server returns it in the create response and never again — it is
   * stored hashed. So it is held here until the admin has copied it, rather
   * than navigating away and losing the only copy.
   */
  const [temporaryPassword, setTemporaryPassword] = useState<string | undefined>()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: emptyTeamMember(),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (existing.data) {
      // Layered over the defaults so a record missing a field still opens, and
      // password stays blank — the API never sends one back.
      reset({ ...emptyTeamMember(), ...(existing.data as Partial<TeamFormValues>), password: '' })
    }
  }, [existing.data, reset])

  const blocker = useUnsavedChanges(isDirty && !isSubmitting && !temporaryPassword)
  const role = useWatch({ control, name: 'role' })
  const saving = create.isPending || update.isPending

  const isSelf = isEdit && id === session?.userId

  async function onSubmit(values: TeamFormValues) {
    // '' means "no change" on edit and "generate one" on create; either way the
    // key should not be in the payload.
    const payload = { ...values, password: values.password || undefined }

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, input: payload })
        toast.success('Changes saved.')
        navigate('/team')
        return
      }

      const created = (await create.mutateAsync(payload)) as UserWithTemporaryPassword
      if (created.temporaryPassword) {
        setTemporaryPassword(created.temporaryPassword)
      } else {
        toast.success(`${values.name} can now sign in.`)
        navigate('/team')
      }
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof TeamFormValues, { message })
        }
        return
      }
      toast.error('Could not save', {
        description: error instanceof ApiError ? error.message : undefined,
      })
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Spinner />
        Loading account…
      </div>
    )
  }

  if (isEdit && existing.error) {
    return (
      <Alert tone="error" title="Could not load this account">
        <p>{(existing.error as Error).message}</p>
        <Link to="/team" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">
            Back to team
          </Button>
        </Link>
      </Alert>
    )
  }

  /*
    The one-time password.

    Shown instead of the form once the account exists, because the value cannot
    be recovered: navigating away without copying it means resetting the
    password to get another.
  */
  if (temporaryPassword) {
    return (
      <div className="space-y-6">
        <PageHeader title="Account created" breadcrumb={[{ label: 'Team', to: '/team' }]} />

        <Alert tone="success" title="Hand this password over now">
          <p className="text-sm">
            It is not stored anywhere in readable form and cannot be shown again. If it is
            lost, set a new one from this account&apos;s edit page.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <code className="rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900">
              {temporaryPassword}
            </code>
            <Button
              variant="secondary"
              size="sm"
              icon={Copy}
              onClick={() => {
                void navigator.clipboard.writeText(temporaryPassword)
                toast.success('Copied.')
              }}
            >
              Copy
            </Button>
          </div>

          <Link to="/team" className="mt-4 inline-block">
            <Button size="sm">Done</Button>
          </Link>
        </Alert>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? 'Edit Member' : 'Add Member'}
        breadcrumb={[{ label: 'Team', to: '/team' }, { label: isEdit ? 'Edit' : 'New' }]}
      />

      <AppearsOn module="team" saved={isEdit} />

      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="This account could not be saved">
          Check the highlighted fields below and try again.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card flush>
            <CardHeader title="Account" />
            <CardBody className="space-y-5">
              <FormField label="Name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="e.g. Simranjeet Kaur" />
              </FormField>

              <FormField
                label="Email"
                required
                description="They sign in with this."
                error={errors.email?.message}
              >
                <Input {...register('email')} type="email" placeholder="name@techcadd.com" />
              </FormField>

              <FormField
                label={isEdit ? 'Set a new password' : 'Password'}
                description={
                  isEdit
                    ? 'Leave blank to keep the current one.'
                    : 'Leave blank and one will be generated for you to hand over.'
                }
                error={errors.password?.message}
              >
                <Input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 10 characters"
                />
              </FormField>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card flush>
            <CardHeader title="Access" />
            <CardBody className="space-y-5">
              <FormField label="Role" error={errors.role?.message}>
                <Select {...register('role')} options={ROLE_OPTIONS} disabled={isSelf} />
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {ROLE_DESCRIPTIONS[role] ?? ''}
                </p>
                {/* Losing your own admin rights would need someone else to
                    restore them, and there may not be anyone else. */}
                {isSelf && (
                  <p className="mt-2 text-xs leading-relaxed text-amber-700">
                    You cannot change your own role. Ask another admin to do it.
                  </p>
                )}
              </FormField>

              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSelf}
                    label="Can sign in"
                    description={
                      isSelf
                        ? 'You cannot suspend your own account.'
                        : 'Turn off to suspend access without deleting the account.'
                    }
                  />
                )}
              />
            </CardBody>
          </Card>
        </div>
      </div>

      <FormFooter
        cancelTo="/team"
        submitLabel={isEdit ? 'Save changes' : 'Create account'}
        saving={saving}
        dirty={isDirty}
        blocker={blocker}
        entityLabel="account"
      />
    </form>
  )
}
