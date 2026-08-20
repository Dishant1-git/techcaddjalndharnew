import { useState } from 'react'
import { Check, Mail, MessageCircle, Phone, Send } from 'lucide-react'

import { ApiError } from '../../api'
import { Badge, EnquiryStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Drawer } from '../../components/common/Drawer'
import { DatePicker } from '../../components/form/DatePicker'
import { FormField } from '../../components/form/FormField'
import { Select } from '../../components/form/Select'
import { Textarea } from '../../components/form/Textarea'
import { Spinner } from '../../components/feedback/Spinner'
import { useToast } from '../../hooks/useToast'
import { createId } from '../../lib/id'
import { cn } from '../../lib/cn'
import { formatShortDate } from '../../lib/format'
import type { EnquiryNote, EnquiryRecord, EnquiryStatus } from '../../types'
import { OUTCOMES, PIPELINE, sourceLabel, statusLabel, whatsAppLink } from './enquiryMeta'
import { enquiryHooks } from './useEnquiries'

interface EnquiryDrawerProps {
  enquiry: EnquiryRecord | null
  onOpenChange: (open: boolean) => void
  assigneeOptions: { value: string; label: string }[]
  /** Attributed as the note author until real auth lands. */
  currentUserName: string
}

export function EnquiryDrawer({
  enquiry,
  onOpenChange,
  assigneeOptions,
  currentUserName,
}: EnquiryDrawerProps) {
  const toast = useToast()
  const update = enquiryHooks.useUpdate()
  const [noteDraft, setNoteDraft] = useState('')

  if (!enquiry) return null

  async function patch(input: Parameters<typeof update.mutateAsync>[0]['input'], message: string) {
    if (!enquiry) return
    try {
      await update.mutateAsync({ id: enquiry.id, input })
      toast.success(message)
    } catch (error) {
      toast.error('Could not update this enquiry', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  async function addNote() {
    const body = noteDraft.trim()
    if (!body || !enquiry) return

    const note: EnquiryNote = {
      id: createId('note'),
      author: currentUserName,
      body,
      createdAt: new Date().toISOString(),
    }

    // Notes are append-only — the timeline is a record of what was said and when.
    await patch({ notes: [...enquiry.notes, note] }, 'Note added.')
    setNoteDraft('')
  }

  const contactMessage = `Hello ${enquiry.studentName}, thanks for your enquiry about ${enquiry.courseName} at techcadd.`

  return (
    <Drawer
      open
      onOpenChange={onOpenChange}
      title={enquiry.studentName}
      description={`${sourceLabel(enquiry.source)} enquiry · ${formatShortDate(enquiry.createdAt)}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${enquiry.phone.replace(/\s/g, '')}`}>
            <Button variant="secondary" size="sm" icon={Phone}>
              Call
            </Button>
          </a>
          <a
            href={whatsAppLink(enquiry.phone, contactMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm" icon={MessageCircle}>
              WhatsApp
            </Button>
          </a>
          {enquiry.email && (
            <a href={`mailto:${enquiry.email}?subject=${encodeURIComponent('Your techcadd enquiry')}`}>
              <Button variant="secondary" size="sm" icon={Mail}>
                Email
              </Button>
            </a>
          )}
        </div>

        <section aria-label="Enquiry details">
          <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            <Row label="Phone">
              <a href={`tel:${enquiry.phone.replace(/\s/g, '')}`} className="hover:text-primary-600">
                {enquiry.phone}
              </a>
            </Row>
            {enquiry.email && (
              <Row label="Email">
                <a href={`mailto:${enquiry.email}`} className="break-all hover:text-primary-600">
                  {enquiry.email}
                </a>
              </Row>
            )}
            <Row label="Course">{enquiry.courseName}</Row>
            <Row label="Branch">
              <Badge tone="neutral">{enquiry.branchName}</Badge>
            </Row>
            <Row label="Source">{sourceLabel(enquiry.source)}</Row>
            <Row label="Received">{formatShortDate(enquiry.createdAt)}</Row>
          </dl>

          {enquiry.message && (
            <blockquote className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
              {enquiry.message}
            </blockquote>
          )}
        </section>

        <section aria-label="Status">
          <h3 className="text-sm font-semibold text-slate-900">Status</h3>

          <div className="mt-2 flex items-center gap-1">
            {PIPELINE.map((step, index) => {
              const currentIndex = PIPELINE.indexOf(enquiry.status)
              const reached = currentIndex >= index && currentIndex !== -1
              const isCurrent = enquiry.status === step

              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => patch({ status: step }, `Marked as ${statusLabel(step)}.`)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                    isCurrent
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : reached
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50',
                  )}
                >
                  {reached && !isCurrent && (
                    <Check size={12} className="mr-1 inline" aria-hidden="true" />
                  )}
                  {statusLabel(step)}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex gap-2">
            {OUTCOMES.map((outcome) => (
              <Button
                key={outcome}
                variant={enquiry.status === outcome ? 'primary' : 'secondary'}
                size="sm"
                fullWidth
                onClick={() => patch({ status: outcome }, `Marked as ${statusLabel(outcome)}.`)}
              >
                {statusLabel(outcome)}
              </Button>
            ))}
          </div>
        </section>

        <section aria-label="Assignment" className="space-y-4">
          <FormField
            label="Assigned to"
            description={
              assigneeOptions.length === 0 ? 'No CMS users exist yet — add them in Settings.' : undefined
            }
          >
            <Select
              options={assigneeOptions}
              placeholder="Unassigned"
              value={enquiry.assigneeId ?? ''}
              disabled={assigneeOptions.length === 0}
              onChange={(event) =>
                patch({ assigneeId: event.target.value || undefined }, 'Assignment updated.')
              }
            />
          </FormField>

          <FormField label="Follow-up date">
            <DatePicker
              value={enquiry.followUpDate}
              onChange={(value) => patch({ followUpDate: value }, 'Follow-up date updated.')}
            />
          </FormField>
        </section>

        <section aria-label="Notes">
          <h3 className="text-sm font-semibold text-slate-900">
            Notes
            {enquiry.notes.length > 0 && (
              <span className="ml-1.5 font-normal text-slate-400">({enquiry.notes.length})</span>
            )}
          </h3>

          {enquiry.notes.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">
              No notes yet. Record what was discussed so the next person has context.
            </p>
          ) : (
            <ol className="mt-3 space-y-3">
              {enquiry.notes.map((note) => (
                <li key={note.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm leading-relaxed text-slate-700">{note.body}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {note.author} · {formatShortDate(note.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-3">
            <FormField label="Add a note" hideLabel>
              <Textarea
                rows={3}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="What was discussed?"
              />
            </FormField>

            <Button
              size="sm"
              icon={Send}
              className="mt-2"
              disabled={!noteDraft.trim() || update.isPending}
              onClick={addNote}
            >
              {update.isPending && <Spinner />}
              Add note
            </Button>
          </div>
        </section>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
          Current status
          <EnquiryStatusBadge status={enquiry.status as EnquiryStatus} />
        </div>
      </div>
    </Drawer>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 px-3 py-2.5">
      <dt className="w-24 shrink-0 text-xs text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}
