import { useState } from 'react'
import { Image as ImageIcon, Replace, X } from 'lucide-react'

import { cn } from '../../lib/cn'
import type { MediaRef } from '../../types'
import { Button } from '../common/Button'
import { MediaPicker } from '../media/MediaPicker'
import { Input } from './Input'
import { assetUrl } from '../../api/client'

interface ImageFieldProps {
  value?: MediaRef | null
  /** null clears the slot. undefined would vanish from the JSON body. */
  onChange: (value: MediaRef | null) => void
  /** Aspect ratio of the preview box. */
  aspect?: 'square' | 'video' | 'wide'
  className?: string
}

const aspectClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[3/1]',
} as const

/**
 * Picks an image from the media library. Alt text stays editable here because
 * the right description depends on where the image is used, not on the file.
 */
export function ImageField({ value, onChange, aspect = 'video', className }: ImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50',
          aspectClasses[aspect],
        )}
      >
        {value?.url ? (
          <>
            <img
              src={assetUrl(value.url)}
              alt={value.alt}
              width={value.width}
              height={value.height}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove image"
              className="absolute top-2 right-2 rounded-lg bg-white/90 p-1.5 text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-rose-600"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="grid size-full place-items-center text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-400"
          >
            <span className="flex flex-col items-center gap-1.5">
              <ImageIcon size={26} aria-hidden="true" />
              <span className="text-xs font-medium">Choose an image</span>
            </span>
          </button>
        )}
      </div>

      {value?.url && (
        <>
          <Button
            variant="secondary"
            size="sm"
            icon={Replace}
            fullWidth
            onClick={() => setPickerOpen(true)}
          >
            Replace image
          </Button>

          <Input
            value={value.alt}
            onChange={(event) => onChange({ ...value, alt: event.target.value })}
            placeholder="Alt text — describe the image"
            aria-label="Image alt text"
          />
        </>
      )}

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(items) => {
          const [first] = items
          // Keep any alt text already written for this slot.
          if (first) onChange({ ...first, alt: value?.alt || first.alt })
        }}
      />
    </div>
  )
}
