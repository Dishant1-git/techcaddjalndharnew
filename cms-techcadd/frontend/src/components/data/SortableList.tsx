import type { ReactNode } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

import { cn } from '../../lib/cn'

interface SortableListProps<T> {
  items: T[]
  getId: (item: T) => string
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => ReactNode
  className?: string
}

/**
 * Drag-to-reorder that also works from the keyboard — dnd-kit's keyboard sensor
 * is the reason this is a library rather than a few mouse handlers.
 */
export function SortableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  className,
}: SortableListProps<T>) {
  const sensors = useSensors(
    // A small activation distance keeps clicks on inner buttons working.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const from = items.findIndex((item) => getId(item) === active.id)
    const to = items.findIndex((item) => getId(item) === over.id)
    if (from === -1 || to === -1) return

    onReorder(arrayMove(items, from, to))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        <ul className={cn('space-y-2', className)}>
          {items.map((item, index) => (
            <SortableRow key={getId(item)} id={getId(item)}>
              {renderItem(item, index)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3',
        isDragging && 'z-10 shadow-lg',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Reorder item"
        className="mt-0.5 cursor-grab rounded p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">{children}</div>
    </li>
  )
}
