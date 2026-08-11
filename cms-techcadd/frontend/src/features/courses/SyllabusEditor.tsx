import { Plus, Trash2 } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { SortableList } from '../../components/data/SortableList'
import { EmptyState } from '../../components/common/EmptyState'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { NumberInput } from '../../components/form/NumberInput'
import { TagInput } from '../../components/form/TagInput'
import { createId } from '../../lib/id'
import type { SyllabusModule } from '../../types'

interface SyllabusEditorProps {
  value: SyllabusModule[]
  onChange: (value: SyllabusModule[]) => void
}

export function SyllabusEditor({ value, onChange }: SyllabusEditorProps) {
  function patch(id: string, next: Partial<SyllabusModule>) {
    onChange(value.map((module) => (module.id === id ? { ...module, ...next } : module)))
  }

  function add() {
    onChange([...value, { id: createId('mod'), title: '', topics: [] }])
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200">
          <EmptyState
            icon={Plus}
            title="No modules yet"
            description="Break the course into modules so the syllabus reads clearly on the website."
          />
        </div>
      ) : (
        <SortableList
          items={value}
          getId={(module) => module.id}
          onReorder={onChange}
          renderItem={(module, index) => (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="mt-2 text-xs font-semibold text-slate-400">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1">
                  <FormField label={`Module ${index + 1} title`} hideLabel>
                    <Input
                      value={module.title}
                      onChange={(event) => patch(module.id, { title: event.target.value })}
                      placeholder="Module title"
                      aria-label={`Module ${index + 1} title`}
                    />
                  </FormField>
                </div>

                <div className="w-28 shrink-0">
                  <NumberInput
                    value={module.hours ?? ''}
                    onChange={(hours) =>
                      patch(module.id, { hours: hours === '' ? undefined : hours })
                    }
                    min={0}
                    suffix="hrs"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  aria-label={`Remove module ${index + 1}`}
                  className="mt-0.5 text-rose-600 hover:bg-rose-50"
                  onClick={() => onChange(value.filter((entry) => entry.id !== module.id))}
                />
              </div>

              <div className="pl-6">
                <TagInput
                  value={module.topics}
                  onChange={(topics) => patch(module.id, { topics })}
                  placeholder="Add a topic and press Enter…"
                />
              </div>
            </div>
          )}
        />
      )}

      <Button variant="secondary" size="sm" icon={Plus} onClick={add}>
        Add module
      </Button>
    </div>
  )
}
