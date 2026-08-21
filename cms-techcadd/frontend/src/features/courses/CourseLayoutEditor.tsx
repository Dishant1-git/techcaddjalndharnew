import {
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  MousePointerClick,
  Type,
} from 'lucide-react'

import { SortableList } from '../../components/data/SortableList'
import { cn } from '../../lib/cn'
import { createId } from '../../lib/id'
import { BlockEditor, type BlockFieldErrors } from '../shared/BlockEditor'
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
  /** Field errors from the resolver, keyed by the block's index in `sections`. */
  errors?: Record<number, BlockFieldErrors | undefined>
}) {
  function addBlock(
    anchor: string,
    placement: 'before' | 'after',
    type: CourseSectionValues['type'],
  ) {
    onSectionsChange([
      ...sections,
      {
        id: createId('block'),
        type,
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
      types={SECTION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
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
            <Gap
              where={`Above ${section.label}`}
              onAdd={(type) => addBlock(section.id, 'before', type)}
            />

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

            <Gap
              where={`Below ${section.label}`}
              onAdd={(type) => addBlock(section.id, 'after', type)}
            />
          </div>
        )
      })}
    </div>
  )
}

/** The thin insert affordance between two sections. */
/**
 * The insert point between two sections.
 *
 * One button per kind rather than a single "Add block" that always made a text
 * block and left you to change its type afterwards — which is how adding an
 * image ended up being a two-step guess.
 *
 * The row is dimmed rather than hidden until the gap is hovered. Hiding it
 * entirely made the whole feature invisible: there was nothing on screen to
 * suggest a block could be added at all.
 */
function Gap({
  where,
  onAdd,
}: {
  where: string
  onAdd: (type: CourseSectionValues['type']) => void
}) {
  return (
    <div className="group flex items-center gap-2 py-1.5">
      <span className="h-px flex-1 bg-slate-200 transition-colors group-hover:bg-primary-200" />

      <span className="flex items-center gap-1 opacity-45 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <span className="mr-0.5 text-[11px] text-slate-400">{where}</span>
        {BLOCK_BUTTONS.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            title={`${where}: add ${label.toLowerCase()}`}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:border-primary-300 hover:text-primary-700"
          >
            <Icon size={11} aria-hidden="true" />
            {label}
          </button>
        ))}
      </span>

      <span className="h-px flex-1 bg-slate-200 transition-colors group-hover:bg-primary-200" />
    </div>
  )
}

/** The kinds a course page offers, with the mark each one gets in the gap. */
const BLOCK_BUTTONS = [
  { type: 'rich-text' as const, label: 'Text', icon: Type },
  { type: 'image' as const, label: 'Image', icon: ImageIcon },
  { type: 'video' as const, label: 'Video', icon: Film },
  { type: 'cta' as const, label: 'Button', icon: MousePointerClick },
]
