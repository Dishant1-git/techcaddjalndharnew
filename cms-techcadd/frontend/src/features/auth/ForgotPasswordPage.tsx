import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'

import { authApi } from '../../api/resources/auth'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { AuthLayout } from './AuthLayout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      await authApi.requestPasswordReset(email)
      setSent(true)
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        description="If that address has an account, a reset link is on its way."
        footer={
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Back to sign in
          </Link>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
          <MailCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-slate-600">
            We sent instructions to <strong className="text-slate-900">{email}</strong>. The link
            expires in one hour.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="We'll email you a link to choose a new one."
      footer={
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <FormField label="Email">
          <Input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@techcadd.com"
          />
        </FormField>

        <Button type="submit" fullWidth disabled={pending}>
          {pending && <Spinner />}
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  )
}
