import { Link } from 'react-router-dom'
import type { Blocker } from 'react-router-dom'

import { cn } from '../../lib/cn'
import { useSidebar } from '../../providers/sidebarContext'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { Spinner } from '../feedback/Spinner'

interface FormFooterProps {
  /** Where Cancel returns to. */
  cancelTo: string
  submitLabel: string
  saving: boolean
  dirty: boolean
  blocker: Blocker
  /** Noun used in the discard dialog, e.g. "course". */
  entityLabel: string
  /**
   * Publishes as well as saving.
   *
   * Given only when the record is not published yet. Setting a select to
   * "Published" and then pressing Save is two steps that look like one, and the
   * step people miss is the first — so the action that puts something live is
   * its own button rather than a state to remember to change.
   */
  onPublish?: () => void
}

/**
 * Sticky save bar plus the discard-changes dialog. Shared by every form so the
 * guard cannot be forgotten on a module.
 */
export function FormFooter({
  cancelTo,
  submitLabel,
  saving,
  dirty,
  blocker,
  entityLabel,
  onPublish,
}: FormFooterProps) {
  const { collapsed } = useSidebar()

  return (
    <>
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur transition-[padding] duration-200 ease-out sm:px-6',
          // Track the rail rather than assuming it — a hardcoded padding here
          // misaligned the bar whenever the sidebar was collapsed.
          collapsed ? 'lg:pl-24' : 'lg:pl-68',
        )}
      >
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-end gap-2">
          {saving ? (
            <p className="mr-auto text-xs text-slate-500">
              Saving — the website updates a few seconds later.
            </p>
          ) : (
            dirty && <p className="mr-auto text-xs text-slate-500">Unsaved changes</p>
          )}

          <Link to={cancelTo}>
            <Button variant="secondary" type="button" disabled={saving}>
              Cancel
            </Button>
          </Link>

          {/* Always the submit button — Publish sits beside it as an extra,
              so pressing Enter in a field still does the ordinary thing. */}
          <Button type="submit" variant={onPublish ? 'secondary' : undefined} disabled={saving}>
            {saving && !onPublish && <Spinner />}
            {submitLabel}
          </Button>

          {onPublish && (
            <Button type="button" disabled={saving} onClick={onPublish}>
              {saving && <Spinner />}
              Publish
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.()
        }}
        title="Discard unsaved changes?"
        description={`This ${entityLabel} has edits that have not been saved.`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => blocker.reset?.()}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={() => blocker.proceed?.()}>
              Discard changes
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Leaving now loses everything entered since the last save.
        </p>
      </Modal>
    </>
  )
}
