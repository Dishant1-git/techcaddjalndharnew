import { cn } from '../../lib/cn'
import { MIN_PASSWORD_LENGTH, passwordScore } from './passwordRules'

const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
const COLOURS = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500']

export function PasswordStrength({ password }: { password: string }) {
  const value = passwordScore(password)

  return (
    <div>
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              'h-1 flex-1 rounded-full',
              step <= value ? COLOURS[value] : 'bg-slate-200',
            )}
          />
        ))}
      </div>

      <p className="mt-1.5 text-xs text-slate-500" aria-live="polite">
        {password
          ? `Password strength: ${LABELS[value]}`
          : `At least ${MIN_PASSWORD_LENGTH} characters, with upper and lowercase letters and a number.`}
      </p>
    </div>
  )
}
