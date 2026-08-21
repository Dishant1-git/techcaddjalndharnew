import { LayoutTemplate, Plus } from 'lucide-react'

import { SortableList } from '../../components/data/SortableList'
import { EmptyState } from '../../components/common/EmptyState'
import { Button } from '../../components/common/Button'
import { createId } from '../../lib/id'
import { BlockEditor, type BlockFieldErrors } from '../shared/BlockEditor'
import { CONTENT_BLOCK_TYPES, type PageSectionValues } from '../shared/contentBlockSchema'

/**
 * A page as an ordered list of blocks.
 *
 * The page body used to be one field of rich text, which is fine for a policy
 * and useless for anything else — an editor could not put an image between two
 * paragraphs, drop in a video, or finish with a call to action, because the
 * page had exactly one shape.
 *
 * A page with no blocks keeps rendering its old single field, so nothing that
 * was written before this existed has to be rebuilt to keep working.
 */
export function PageBlocksEditor({
  blocks,
  onChange,
  errors,
}: {
  blocks: PageSectionValues[]
  onChange: (next: PageSectionValues[]) => void
  /** Field errors from the resolver, keyed by the block's index. */
  errors?: Record<number, BlockFieldErrors | undefined>
}) {
  function add(type: PageSectionValues['type']) {
    onChange([
      ...blocks,
      {
        id: createId('block'),
        type,
        title: '',
        body: '',
        media: undefined,
        linkUrl: '',
        linkLabel: '',
        linkTarget: 'same',
        visible: true,
      },
    ])
  }

  function update(id: string, patch: Partial<PageSectionValues>) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  return (
    <div className="space-y-3">
      {blocks.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No blocks yet"
          description="This page is still using its single text field. Add a block to build it up in pieces instead — text, an image, a video, a call to action."
        />
      ) : (
        <SortableList
          items={blocks}
          getId={(b) => b.id!}
          onReorder={onChange}
          renderItem={(block) => (
            <BlockEditor
              block={block}
              error={errors?.[blocks.indexOf(block)]}
              onChange={(patch) => update(block.id!, patch)}
              onRemove={() => onChange(blocks.filter((b) => b.id !== block.id))}
            />
          )}
        />
      )}

      {/* One button per kind rather than "Add block" then a type dropdown: the
          editor already knows what they want to add, and the two-step version
          makes them say it twice. */}
      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        {CONTENT_BLOCK_TYPES.map((type) => (
          <Button
            key={type.value}
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => add(type.value)}
          >
            {type.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
