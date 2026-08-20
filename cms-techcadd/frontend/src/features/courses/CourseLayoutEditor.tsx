import { Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react'

import { SortableList } from '../../components/data/SortableList'
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { RichTextEditor } from '../../components/form/RichTextEditor'
import { Select } from '../../components/form/Select'
import { Switch } from '../../components/form/Switch'
import { Textarea } from '../../components/form/Textarea'
import { cn } from '../../lib/cn'
import { createId } from '../../lib/id'
import { PAGE_SECTIONS, SECTION_TYPES, type CourseSectionValues } from './courseSchema'

/**
 * The course page as a list of sections, in the order a visitor meets them.
 *
 * The template generates about fifteen sections from the fields above. This
 * shows all of them, lets the optional ones be switched off, and lets blocks of
 * your own be dropped into any gap — which is the answer to "put a video after
 * the syllabus" that a flat form cannot give.
 *
 * Generated sections and added blocks share one list on purpose. An editor
 * thinks about the page top to bottom; splitting it into "the built-in bits"
 * and "your bits" would make them hold the running order in their head.
 */
export function CourseLayoutEditor({
  sections,
  hidden,
  onSectionsChange,
  onHiddenChange,
  errors,
}: {
  sections: CourseSectionValues[]
  hidden: string[]
  onSectionsChange: (next: CourseSectionValues[]) => void
  onHiddenChange: (next: string[]) => void
  /** Messages from the resolver, keyed by the block's index in `sections`. */
  errors?: Record<number, Record<string, string | undefined>>
}) {
  function addBlock(anchor: string, placement: 'before' | 'after') {
    onSectionsChange([
      ...sections,
      {
        id: createId('block'),
        type: 'rich-text',
        title: '',
        body: '',
        media: undefined,
        linkUrl: '',
        linkLabel: '',
        linkTarget: 'same',
        anchor,
        placement,
        visible: true,
      },
    ])
  }

  function update(id: string, patch: Partial<CourseSectionValues>) {
    onSectionsChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function remove(id: string) {
    onSectionsChange(sections.filter((s) => s.id !== id))
  }

  /**
   * Reorders within one gap without disturbing the rest.
   *
   * The blocks for a gap are spliced back into the slots the old ones occupied,
   * so dragging two paragraphs around after the overview cannot renumber a
   * block anchored somewhere else entirely.
   */
  function reorder(group: CourseSectionValues[], next: CourseSectionValues[]) {
    const slots = sections.map((s, i) => (group.includes(s) ? i : -1)).filter((i) => i >= 0)
    const out = [...sections]
    slots.forEach((slot, i) => {
      out[slot] = next[i]!
    })
    onSectionsChange(out)
  }

  const indexOf = (block: CourseSectionValues) => sections.indexOf(block)

  const renderBlock = (block: CourseSectionValues) => (
    <BlockEditor
      block={block}
      error={errors?.[indexOf(block)]}
      onChange={(patch) => update(block.id!, patch)}
      onRemove={() => remove(block.id!)}
    />
  )

  return (
    <div className="space-y-1">
      {PAGE_SECTIONS.map((section) => {
        const isHidden = hidden.includes(section.id)
        const before = sections.filter((s) => s.anchor === section.id && s.placement === 'before')
        const after = sections.filter((s) => s.anchor === section.id && s.placement === 'after')

        return (
          <div key={section.id}>
            <Gap label={`Add above ${section.label}`} onAdd={() => addBlock(section.id, 'before')} />

            {before.length > 0 && (
              <SortableList
                items={before}
                getId={(s) => s.id!}
                onReorder={(next) => reorder(before, next)}
                renderItem={renderBlock}
              />
            )}

            {/* The generated section itself. */}
            <div
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
                isHidden
                  ? 'border-dashed border-slate-300 bg-slate-50'
                  : 'border-slate-200 bg-white',
              )}
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    'truncate text-sm font-medium',
                    isHidden ? 'text-slate-400 line-through' : 'text-slate-800',
                  )}
                >
                  {section.label}
                </p>
                <p className="text-xs text-slate-400">
                  {section.hideable
                    ? 'Generated from the fields above'
                    : 'Always shown — it carries the title, price or enquiry form'}
                </p>
              </div>

              {section.hideable ? (
                <button
                  type="button"
                  title={isHidden ? 'Show this section' : 'Hide this section'}
                  onClick={() =>
                    onHiddenChange(
                      isHidden
                        ? hidden.filter((id) => id !== section.id)
                        : [...hidden, section.id],
                    )
                  }
                  className="grid size-8 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span className="sr-only">
                    {isHidden ? 'Show' : 'Hide'} {section.label}
                  </span>
                </button>
              ) : (
                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                  Always on
                </span>
              )}
            </div>

            {after.length > 0 && (
              <SortableList
                items={after}
                getId={(s) => s.id!}
                onReorder={(next) => reorder(after, next)}
                renderItem={renderBlock}
              />
            )}

            <Gap label={`Add below ${section.label}`} onAdd={() => addBlock(section.id, 'after')} />
          </div>
        )
      })}
    </div>
  )
}

/** The thin insert affordance between two sections. */
function Gap({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="group flex items-center gap-2 py-1">
      <span className="h-px flex-1 bg-slate-200 transition-colors group-hover:bg-primary-200" />
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:border-primary-300 hover:text-primary-700 focus-visible:opacity-100"
      >
        <Plus size={11} aria-hidden="true" />
        {label}
      </button>
      <span className="h-px flex-1 bg-slate-200 transition-colors group-hover:bg-primary-200" />
    </div>
  )
}

function BlockEditor({
  block,
  onChange,
  onRemove,
  error,
}: {
  block: CourseSectionValues
  onChange: (patch: Partial<CourseSectionValues>) => void
  onRemove: () => void
  error?: Record<string, string | undefined>
}) {
  return (
    <div className="my-1 rounded-lg border border-primary-200 bg-primary-50/40 p-3">
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="shrink-0 text-slate-300" aria-hidden="true" />

        <Select
          value={block.type}
          onChange={(event) =>
            onChange({ type: event.target.value as CourseSectionValues['type'] })
          }
          options={SECTION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          className="w-40"
        />

        <Input
          value={block.title ?? ''}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Heading (optional)"
          className="flex-1"
        />

        <button
          type="button"
          title={block.visible ? 'Hide this block' : 'Show this block'}
          onClick={() => onChange({ visible: !block.visible })}
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
          <FormField label="Text" error={error?.body}>
            <RichTextEditor
              value={block.body ?? ''}
              onChange={(value) => onChange({ body: value })}
            />
          </FormField>
        )}

        {block.type === 'image' && (
          <>
            <FormField label="Image" error={error?.media}>
              <ImageField
                value={block.media ?? undefined}
                onChange={(value) => onChange({ media: value })}
              />
            </FormField>
            <FormField label="Caption">
              <Input
                value={block.body ?? ''}
                onChange={(event) => onChange({ body: event.target.value })}
                placeholder="Optional caption"
              />
            </FormField>
          </>
        )}

        {block.type === 'video' && (
          <FormField
            label="Video URL"
            description="A YouTube or Vimeo address — the one from the browser bar is fine."
            error={error?.linkUrl}
          >
            <Input
              value={block.linkUrl ?? ''}
              onChange={(event) => onChange({ linkUrl: event.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </FormField>
        )}

        {block.type === 'cta' && (
          <FormField label="Lead line">
            <Textarea
              value={block.body ?? ''}
              onChange={(event) => onChange({ body: event.target.value })}
              rows={2}
            />
          </FormField>
        )}

        {block.type !== 'video' && (
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
function LinkFields({
  block,
  onChange,
  error,
}: {
  block: CourseSectionValues
  onChange: (patch: Partial<CourseSectionValues>) => void
  error?: Record<string, string | undefined>
}) {
  const external = /^https?:\/\//i.test(block.linkUrl ?? '')

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField
        label={block.type === 'cta' ? 'Button link' : 'Link (optional)'}
        description={
          external ? 'Goes to another site.' : 'A path like /contact stays on this site.'
        }
        error={error?.linkUrl}
      >
        <Input
          value={block.linkUrl ?? ''}
          onChange={(event) => onChange({ linkUrl: event.target.value })}
          placeholder="/contact or https://..."
        />
      </FormField>

      <FormField label="Button text" error={error?.linkLabel}>
        <Input
          value={block.linkLabel ?? ''}
          onChange={(event) => onChange({ linkLabel: event.target.value })}
          placeholder="e.g. Book a seat"
        />
      </FormField>

      <div className="sm:col-span-2">
        <Switch
          checked={block.linkTarget === 'new'}
          onCheckedChange={(checked) => onChange({ linkTarget: checked ? 'new' : 'same' })}
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
