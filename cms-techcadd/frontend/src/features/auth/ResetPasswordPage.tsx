import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { ApiError } from '../../api'
import { authApi } from '../../api/resources/auth'
import { Button } from '../../components/common/Button'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { useToast } from '../../hooks/useToast'
import { AuthLayout } from './AuthLayout'
import { PasswordStrength } from './PasswordStrength'
import { passwordProblem } from './passwordRules'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    const problem = passwordProblem(password)
    if (problem) {
      setError(problem)
      return
    }
    if (password !== confirm) {
      setError('Both passwords must match.')
      return
    }

    setError(undefined)
    setPending(true)
    try {
      await authApi.resetPassword(token, password)
      toast.success('Password updated. Sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not reset your password.')
    } finally {
      setPending(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout
        title="Link not valid"
        description="This password reset link is missing or has expired."
        footer={
          <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-700">
            Request a new link
          </Link>
        }
      >
        <Alert tone="error">Request a fresh reset link and try again.</Alert>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" description="Make it something you don't use elsewhere.">
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}

        <FormField label="New password">
          <Input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>

        <PasswordStrength password={password} />

        <FormField label="Confirm password">
          <Input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </FormField>

        <Button type="submit" fullWidth disabled={pending}>
          {pending && <Spinner />}
          Update password
        </Button>
      </form>
    </AuthLayout>
  )
}
