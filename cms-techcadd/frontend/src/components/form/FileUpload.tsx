import { useRef, useState, type DragEvent } from 'react'
import { FileWarning, Upload, X } from 'lucide-react'

import { cn } from '../../lib/cn'
import { formatFileSize } from '../../lib/format'
import { ProgressBar } from '../feedback/ProgressBar'
import { useFieldContext } from './field'

export interface PendingFile {
  id: string
  file: File
  previewUrl?: string
  /** 0–100 while uploading; undefined before it starts. */
  progress?: number
  error?: string
}

interface FileUploadProps {
  files: PendingFile[]
  onFilesAdded: (files: File[]) => void
  onRemove: (id: string) => void
  accept?: string
  multiple?: boolean
  /** Bytes. Files above this are rejected with an inline message. */
  maxSize?: number
  disabled?: boolean
  className?: string
}

export function FileUpload({
  files,
  onFilesAdded,
  onRemove,
  accept = 'image/*',
  multiple = true,
  maxSize = 5 * 1024 * 1024,
  disabled,
  className,
}: FileUploadProps) {
  const field = useFieldContext()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [rejected, setRejected] = useState<string[]>([])

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return

    const tooLarge: string[] = []
    const allowed: File[] = []

    for (const file of Array.from(incoming)) {
      if (file.size > maxSize) tooLarge.push(file.name)
      else allowed.push(file)
    }

    setRejected(tooLarge)
    if (allowed.length > 0) onFilesAdded(allowed)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (!disabled) handleFiles(event.dataTransfer.files)
  }

  return (
    <div className={className}>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          dragging ? 'border-primary-400 bg-primary-50/50' : 'border-slate-200 bg-slate-50/50',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <span className="mx-auto grid size-10 place-items-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200">
          <Upload size={18} aria-hidden="true" />
        </span>

        <p className="mt-3 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Choose {multiple ? 'files' : 'a file'}
          </button>{' '}
          or drag and drop
        </p>
        <p className="mt-1 text-xs text-slate-400">Up to {formatFileSize(maxSize)} each</p>

        <input
          ref={inputRef}
          id={field?.id}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files)
            // Reset so re-picking the same file still fires a change event.
            event.target.value = ''
          }}
          className="sr-only"
        />
      </div>

      {rejected.length > 0 && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-rose-600">
          <FileWarning size={14} className="mt-px shrink-0" aria-hidden="true" />
          <span>
            Too large to upload: {rejected.join(', ')}. The limit is {formatFileSize(maxSize)}.
          </span>
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-2"
            >
              {entry.previewUrl ? (
                <img
                  src={entry.previewUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded bg-slate-100 text-slate-400">
                  <Upload size={16} aria-hidden="true" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{entry.file.name}</p>
                {entry.error ? (
                  <p className="text-xs text-rose-600">{entry.error}</p>
                ) : entry.progress !== undefined && entry.progress < 100 ? (
                  <ProgressBar
                    className="mt-1"
                    value={entry.progress}
                    label={`Uploading ${entry.file.name}`}
                  />
                ) : (
                  <p className="text-xs text-slate-400">{formatFileSize(entry.file.size)}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                aria-label={`Remove ${entry.file.name}`}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
