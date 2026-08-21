import { Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react'

import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { RichTextEditor } from '../../components/form/RichTextEditor'
import { Select } from '../../components/form/Select'
import { Switch } from '../../components/form/Switch'
import { Textarea } from '../../components/form/Textarea'
import { isExternalLink } from '../../lib/links'
import { CONTENT_BLOCK_TYPES } from './contentBlockSchema'

/**
 * The editor for one block of content.
 *
 * Shared by the course layout editor and the page editor. A paragraph added to
 * a course and a paragraph added to a page are the same record rendered by the
 * same component on the site, so they are edited by the same controls here —
 * anything else would teach an editor two ways to do one thing.
 *
 * Deliberately generic over the block shape: courses add an anchor and a
 * placement, pages do not, and neither is this component's business.
 */

/**
 * Field errors for one block, as react-hook-form actually reports them.
 *
 * Each entry is a FieldError — `{ message, type, ref }` — not a string. This
 * was typed as `Record<string, string>` and cast into place, so the object was
 * handed straight to FormField, which renders its `error` prop as a child:
 * "Objects are not valid as a React child (found: object with keys {message,
 * type, ref})". The cast is why the compiler said nothing.
 */
export type BlockFieldErrors = Record<string, unknown>

/**
 * The message out of one react-hook-form field error.
 *
 * `unknown` rather than a hand-written shape: RHF's error objects carry a
 * `ref` to the DOM node alongside the message, and every attempt to describe
 * them narrowly here ended in a cast — which is exactly how the whole object
 * reached JSX and produced "Objects are not valid as a React child".
 *
 * Reading the one field that is wanted, defensively, is both honest about the
 * shape and impossible to get wrong the same way again.
 */
export function fieldMessage(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const message = (error as { message?: unknown }).message
  return typeof message === 'string' && message ? message : undefined
}

export interface EditableBlock {
  id?: string
  type: string
  title?: string
  body?: string
  media?: { id: string; url: string; alt: string; width?: number; height?: number } | null
  linkUrl?: string
  linkLabel?: string
  linkTarget: 'same' | 'new'
  visible: boolean
}

export function BlockEditor<T extends EditableBlock>({
  block,
  onChange,
  onRemove,
  error,
  /** Types this surface offers. Courses omit 'blogs'; pages include it. */
  types = CONTENT_BLOCK_TYPES.map((t) => ({ value: t.value, label: t.label })),
}: {
  block: T
  onChange: (patch: Partial<T>) => void
  onRemove: () => void
  error?: BlockFieldErrors
  types?: { value: string; label: string }[]
}) {
  return (
    <div className="my-1 rounded-lg border border-primary-200 bg-primary-50/40 p-3">
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="shrink-0 text-slate-300" aria-hidden="true" />

        <Select
          value={block.type}
          onChange={(event) => onChange({ type: event.target.value } as Partial<T>)}
          options={types}
          className="w-44"
        />

        <Input
          value={block.title ?? ''}
          onChange={(event) => onChange({ title: event.target.value } as Partial<T>)}
          placeholder="Heading (optional)"
          className="flex-1"
        />

        <button
          type="button"
          title={block.visible ? 'Hide this block' : 'Show this block'}
          onClick={() => onChange({ visible: !block.visible } as Partial<T>)}
          className="grid size-8 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
        >
          {block.visible ? <Eye size={15} /> : <EyeOff size={15} />}
          <span className="sr-only">{block.visible ? 'Hide' : 'Show'} this block</span>
        </button>

        <button
          type="button"
          title="Delete this block"
          onClick={onRemove}
          className="grid size-8 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={15} />
          <span className="sr-only">Delete this block</span>
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {block.type === 'rich-text' && (
          <FormField label="Text" error={fieldMessage(error?.body)}>
            <RichTextEditor
              value={block.body ?? ''}
              onChange={(value) => onChange({ body: value } as Partial<T>)}
            />
          </FormField>
        )}

        {block.type === 'image' && (
          <>
            <FormField label="Image" error={fieldMessage(error?.media)}>
              <ImageField
                value={block.media ?? undefined}
                onChange={(value) => onChange({ media: value } as Partial<T>)}
              />
            </FormField>
            <FormField label="Caption">
              <Input
                value={block.body ?? ''}
                onChange={(event) => onChange({ body: event.target.value } as Partial<T>)}
                placeholder="Optional caption"
              />
            </FormField>
          </>
        )}

        {block.type === 'video' && (
          <FormField
            label="Video URL"
            description="A YouTube or Vimeo address — the one from the browser bar is fine."
            error={fieldMessage(error?.linkUrl)}
          >
            <Input
              value={block.linkUrl ?? ''}
              onChange={(event) => onChange({ linkUrl: event.target.value } as Partial<T>)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </FormField>
        )}

        {block.type === 'cta' && (
          <FormField label="Lead line">
            <Textarea
              value={block.body ?? ''}
              onChange={(event) => onChange({ body: event.target.value } as Partial<T>)}
              rows={2}
            />
          </FormField>
        )}

        {block.type === 'blogs' && (
          <p className="rounded-md bg-white/70 px-3 py-2 text-xs leading-relaxed text-slate-500">
            Shows the six most recent published blog posts. Nothing to fill in —
            the list follows whatever is published under Blogs.
          </p>
        )}

        {/* A video is its own link, and a blog list links each card. */}
        {block.type !== 'video' && block.type !== 'blogs' && (
          <LinkFields block={block} onChange={onChange} error={error} />
        )}
      </div>
    </div>
  )
}

/**
 * A link, and where it opens.
 *
 * Internal and external share one text box rather than a radio pair: an editor
 * knows whether they are pasting a path or a full address, and asking them to
 * classify it as well is a second chance to get it wrong. What they cannot
 * infer is the tab behaviour, so that is the control.
 */
function LinkFields<T extends EditableBlock>({
  block,
  onChange,
  error,
}: {
  block: T
  onChange: (patch: Partial<T>) => void
  error?: BlockFieldErrors
}) {
  const external = isExternalLink(block.linkUrl)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField
        label={block.type === 'cta' ? 'Button link' : 'Link (optional)'}
        description={
          external ? 'Goes to another site.' : 'A path like /contact stays on this site.'
        }
        error={fieldMessage(error?.linkUrl)}
      >
        <Input
          value={block.linkUrl ?? ''}
          onChange={(event) => onChange({ linkUrl: event.target.value } as Partial<T>)}
          placeholder="/contact or https://..."
        />
      </FormField>

      <FormField label="Button text" error={fieldMessage(error?.linkLabel)}>
        <Input
          value={block.linkLabel ?? ''}
          onChange={(event) => onChange({ linkLabel: event.target.value } as Partial<T>)}
          placeholder="e.g. Book a seat"
        />
      </FormField>

      <div className="sm:col-span-2">
        <Switch
          checked={block.linkTarget === 'new'}
          onCheckedChange={(checked) =>
            onChange({ linkTarget: checked ? 'new' : 'same' } as Partial<T>)
          }
          label="Open in a new tab"
          description={
            external
              ? 'Recommended for links that leave the site.'
              : 'Usually off for pages on this site.'
          }
        />
      </div>
    </div>
  )
}
