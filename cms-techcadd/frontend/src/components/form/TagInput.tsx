import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

import { cn } from '../../lib/cn'
import { controlBorder, useFieldContext } from './field'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxTags?: number
  invalid?: boolean
  className?: string
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Type and press Enter…',
  maxTags,
  invalid,
  className,
}: TagInputProps) {
  const field = useFieldContext()
  const [draft, setDraft] = useState('')
  const isInvalid = invalid ?? field?.invalid ?? false
  const atLimit = maxTags !== undefined && value.length >= maxTags

  function commit() {
    const tag = draft.trim()
    // Silently ignoring duplicates beats an error for a low-stakes field.
    if (!tag || atLimit || value.includes(tag)) {
      setDraft('')
      return
    }
    onChange([...value, tag])
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit()
      return
    }
    // Backspace on an empty field removes the last tag, as in most tag UIs.
    if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 rounded-lg border bg-white p-1.5',
        controlBorder(isInvalid),
        className,
      )}
    >
      <ul className="contents">
        {value.map((tag) => (
          <li
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-slate-100 py-1 pr-1 pl-2 text-xs font-medium text-slate-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((entry) => entry !== tag))}
              aria-label={`Remove ${tag}`}
              className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <input
        id={field?.id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        disabled={atLimit}
        placeholder={atLimit ? `Limit of ${maxTags} reached` : placeholder}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className="h-7 min-w-32 flex-1 bg-transparent px-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
  )
}
