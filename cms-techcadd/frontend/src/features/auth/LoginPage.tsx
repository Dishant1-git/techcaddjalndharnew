import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Lock, User } from 'lucide-react'

import { ApiError } from '../../api'
import { Button } from '../../components/common/Button'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { Checkbox } from '../../components/form/Checkbox'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { useAuth } from '../../hooks/useAuth'
import { AuthLayout } from './AuthLayout'

interface FieldErrors {
  identifier?: string
  password?: string
}

/** Shared control chrome, so both fields stay identical. */
const FIELD_CLASSES =
  'h-11 rounded-xl text-[13px] focus:border-primary-500 focus:ring-4 focus:ring-primary-500/12'

export default function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | undefined>()
  const [pending, setPending] = useState(false)

  // Already signed in — go where they were headed rather than showing this form.
  // 'loading' must fall through to the form rather than redirect, or a signed-out
  // visitor would see a flash of nothing while /auth/me is in flight.
  if (status === 'authenticated') return <Navigate to={params.get('next') ?? '/'} replace />

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!identifier.trim()) next.identifier = 'Enter your email or username.'
    if (!password) next.password = 'Enter your password.'

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(undefined)

    if (!validate()) return

    setPending(true)
    try {
      // All credential handling lives in the auth layer (`src/api/resources/auth.ts`),
      // so pointing this at a real backend does not touch this component.
      await login(identifier, password)
      navigate(params.get('next') ?? '/', { replace: true })
    } catch (caught) {
      setFormError(
        caught instanceof ApiError ? caught.message : 'Could not sign in. Please try again.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout description="Login to access your CMS dashboard" secure>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}

        {/* Visible labels rather than placeholder-only: a placeholder
            disappears once typing starts, taking the field's meaning with it. */}
        <FormField label="Email or username" error={fieldErrors.identifier}>
          <Input
            icon={User}
            type="text"
            autoComplete="username"
            autoFocus
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value)
              if (fieldErrors.identifier) {
                setFieldErrors((errors) => ({ ...errors, identifier: undefined }))
              }
            }}
            placeholder="Enter your email or username"
            className={FIELD_CLASSES}
          />
        </FormField>

        <FormField label="Password" error={fieldErrors.password}>
          <Input
            icon={Lock}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (fieldErrors.password) {
                setFieldErrors((errors) => ({ ...errors, password: undefined }))
              }
            }}
            placeholder="Enter your password"
            className={FIELD_CLASSES}
          />
        </FormField>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox checked={remember} onCheckedChange={setRemember} label="Remember me" />

          <Link
            to="/forgot-password"
            className="text-[13px] font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={pending}
          icon={pending ? undefined : ArrowRight}
          iconPosition="right"
          className="h-11 rounded-xl text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/30"
        >
          {pending && <Spinner />}
          {pending ? 'Signing in…' : 'Login'}
        </Button>
      </form>
    </AuthLayout>
  )
}
