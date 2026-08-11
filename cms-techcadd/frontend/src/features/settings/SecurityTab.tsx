import { useState, type FormEvent } from 'react'

import { ApiError } from '../../api'
import { authApi } from '../../api/resources/auth'
import { Button } from '../../components/common/Button'
import { CardBody } from '../../components/common/Card'
import { Alert } from '../../components/feedback/Alert'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { useToast } from '../../hooks/useToast'
import { PasswordStrength } from '../auth/PasswordStrength'
import { passwordProblem } from '../auth/passwordRules'

export function SecurityTab() {
  const toast = useToast()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ currentPassword?: string; form?: string }>({})
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()

    const problem = passwordProblem(next)
    if (problem) {
      setErrors({ form: problem })
      return
    }
    if (next !== confirm) {
      setErrors({ form: 'Both new password fields must match.' })
      return
    }
    if (next === current) {
      setErrors({ form: 'The new password must differ from the current one.' })
      return
    }

    setErrors({})
    setPending(true)
    try {
      await authApi.changePassword(current, next)
      toast.success('Password updated.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (caught) {
      if (caught instanceof ApiError && caught.fieldErrors?.currentPassword) {
        setErrors({ currentPassword: caught.fieldErrors.currentPassword })
        return
      }
      setErrors({ form: 'Could not change your password. Please try again.' })
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <CardBody className="max-w-md space-y-5">
        {errors.form && <Alert tone="error">{errors.form}</Alert>}

        <FormField label="Current password" required error={errors.currentPassword}>
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
        </FormField>

        <FormField label="New password" required>
          <Input
            type="password"
            autoComplete="new-password"
            required
            value={next}
            onChange={(event) => setNext(event.target.value)}
          />
        </FormField>

        <PasswordStrength password={next} />

        <FormField label="Confirm new password" required>
          <Input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </FormField>
      </CardBody>

      <div className="border-t border-slate-100 px-5 py-3">
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          Change password
        </Button>
      </div>
    </form>
  )
}
