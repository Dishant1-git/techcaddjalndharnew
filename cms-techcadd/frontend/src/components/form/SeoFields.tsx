import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, Search } from 'lucide-react'

import type { SeoFields as SeoValues } from '../../types'
import { FormField } from './FormField'
import { Input } from './Input'
import { TagInput } from './TagInput'
import { Textarea } from './Textarea'

/** Google truncates around these lengths — warn, never block. */
const TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 160

interface SeoFieldsProps {
  value: SeoValues
  onChange: (value: SeoValues) => void
  /** Used in the search preview, e.g. "techcadd.com/courses/mern-stack". */
  previewUrl: string
  /** Falls back into the preview when no meta title is set. */
  fallbackTitle?: string
  fallbackDescription?: string
  errors?: Partial<Record<'metaTitle' | 'metaDescription', string>>
}

export function SeoFields({
  value,
  onChange,
  previewUrl,
  fallbackTitle,
  fallbackDescription,
  errors,
}: SeoFieldsProps) {
  const patch = (next: Partial<SeoValues>) => onChange({ ...value, ...next })

  const title = value.metaTitle || fallbackTitle || 'Page title'
  const description =
    value.metaDescription || fallbackDescription || 'A short summary shown under the title.'

  return (
    <Accordion.Root type="single" collapsible className="rounded-lg border border-slate-200">
      <Accordion.Item value="seo">
        <Accordion.Header>
          <Accordion.Trigger className="group flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Search size={15} className="text-slate-400" aria-hidden="true" />
              Search engine listing
            </span>
            <ChevronDown
              size={16}
              className="text-slate-400 transition-transform group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content className="space-y-4 border-t border-slate-100 p-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="truncate text-xs text-emerald-700">{previewUrl}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-sky-800">{title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{description}</p>
          </div>

          <FormField
            label="Meta title"
            error={errors?.metaTitle}
            description={`${(value.metaTitle ?? '').length} / ${TITLE_LIMIT} characters`}
          >
            <Input
              value={value.metaTitle ?? ''}
              onChange={(event) => patch({ metaTitle: event.target.value })}
              placeholder={fallbackTitle}
            />
          </FormField>

          <FormField
            label="Meta description"
            error={errors?.metaDescription}
            description={`${(value.metaDescription ?? '').length} / ${DESCRIPTION_LIMIT} characters`}
          >
            <Textarea
              rows={3}
              value={value.metaDescription ?? ''}
              onChange={(event) => patch({ metaDescription: event.target.value })}
              placeholder={fallbackDescription}
            />
          </FormField>

          <FormField label="Keywords">
            <TagInput
              value={value.keywords ?? []}
              onChange={(keywords) => patch({ keywords })}
              placeholder="Add a keyword…"
              maxTags={10}
            />
          </FormField>

          <FormField label="Canonical URL" description="Leave blank unless this duplicates another page.">
            <Input
              value={value.canonicalUrl ?? ''}
              onChange={(event) => patch({ canonicalUrl: event.target.value })}
              placeholder="https://techcadd.com/…"
            />
          </FormField>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}
