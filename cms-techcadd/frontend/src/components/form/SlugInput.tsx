import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { cn } from '../../lib/cn'
import { slugify } from '../../lib/slugify'
import { controlBorder, controlClasses, useFieldContext } from './field'

interface SlugInputProps {
  value: string
  onChange: (value: string) => void
  /** The title this slug tracks until the user takes manual control. */
  source: string
  /** Prefix shown before the slug, e.g. "techcadd.com/courses/". */
  baseUrl?: string
  invalid?: boolean
  className?: string
}

export function SlugInput({
  value,
  onChange,
  source,
  baseUrl,
  invalid,
  className,
}: SlugInputProps) {
  const field = useFieldContext()
  const isInvalid = invalid ?? field?.invalid ?? false

  // Once edited by hand, the slug stops following the title — silently
  // rewriting a published URL because someone fixed a typo is worse.
  const [detached, setDetached] = useState(false)
  const derived = slugify(source)
  const effective = detached || value ? value : derived

  // Report the derived slug upward, not just render it.
  //
  // Without this the field *looked* filled while the form value stayed empty,
  // so a course with an auto-generated slug failed validation with the slug
  // visibly present — the one place where showing and storing must not diverge.
  useEffect(() => {
    if (detached) return
    if (derived && derived !== value) onChange(derived)
  }, [derived, detached, value, onChange])

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id={field?.id}
            value={effective}
            onChange={(event) => {
              setDetached(true)
              onChange(slugify(event.target.value))
            }}
            aria-invalid={isInvalid || undefined}
            aria-describedby={field?.describedBy}
            className={cn(controlClasses, controlBorder(isInvalid), 'h-10 px-3 font-mono text-xs')}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setDetached(false)
            onChange(derived)
          }}
          disabled={!source || effective === derived}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Regenerate
        </button>
      </div>

      {baseUrl && (
        <p className="mt-1.5 truncate text-xs text-slate-400">
          {baseUrl}
          <span className="text-slate-600">{effective || 'your-slug'}</span>
        </p>
      )}
    </div>
  )
}
