import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink, Info, Monitor, RefreshCw, Smartphone, Tablet } from 'lucide-react'

import { cn } from '../../lib/cn'
import {
  DEVICES,
  PREVIEW_DRAFT,
  PREVIEW_NOTICE,
  PREVIEW_READY,
  PREVIEW_SCROLL,
  SITE_ORIGIN,
  type DeviceId,
  type PreviewKind,
} from './previewProtocol'

const ICONS = { Monitor, Tablet, Smartphone }

/**
 * The live website, framed, fed by the form beside it.
 *
 * The frame is the real site rather than a rebuilt approximation: it loads
 * /preview from the public app, which mounts the same components the visitor
 * gets. Nothing about the page is described twice, so the preview cannot fall
 * out of step with the thing it is previewing.
 *
 * Draft state travels by postMessage rather than through the database. That
 * keeps unsaved work unsaved — an editor can try a headline, see it, and walk
 * away without ever having written it — and it means the preview updates as
 * fast as the keystroke rather than as fast as a round trip.
 */
export function PreviewPane<T>({
  kind,
  draft,
  /** Section of the rendered page to scroll to, if the editor is on one. */
  focus,
  /** The public URL of the saved page, for "open in new tab". */
  liveUrl,
  className,
}: {
  kind: PreviewKind
  draft: T
  focus?: string
  liveUrl?: string
  className?: string
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [device, setDevice] = useState<DeviceId>('desktop')
  const [ready, setReady] = useState(false)
  const [nonce, setNonce] = useState(0)
  const [uneditable, setUneditable] = useState<string[]>([])

  const src = `${SITE_ORIGIN}/preview/${kind}`

  /**
   * The frame tells us when its listener is attached.
   *
   * Posting on load instead would race: the iframe fires `load` before React
   * inside it has mounted and subscribed, so the first draft — the one the
   * editor is looking at — would be the one that goes missing.
   */
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== SITE_ORIGIN) return
      const data = event.data as
        | { type?: string; kind?: string; uneditable?: string[] }
        | undefined
      if (!data || data.kind !== kind) return

      if (data.type === PREVIEW_READY) setReady(true)
      if (data.type === PREVIEW_NOTICE) setUneditable(data.uneditable ?? [])
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [kind])

  // A reload drops the listener inside the frame, so wait to be greeted again.
  const reload = useCallback(() => {
    setReady(false)
    setNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!ready) return
    frame.current?.contentWindow?.postMessage(
      { type: PREVIEW_DRAFT, kind, payload: draft },
      SITE_ORIGIN,
    )
  }, [draft, kind, ready])

  useEffect(() => {
    if (!ready || !focus) return
    frame.current?.contentWindow?.postMessage(
      { type: PREVIEW_SCROLL, kind, section: focus },
      SITE_ORIGIN,
    )
  }, [focus, kind, ready])

  const width = DEVICES.find((d) => d.id === device)?.width ?? null

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs font-medium text-slate-500">Preview</span>
          {DEVICES.map((option) => {
            const Icon = ICONS[option.icon]
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setDevice(option.id)}
                aria-pressed={device === option.id}
                title={option.label}
                className={cn(
                  'grid size-7 place-items-center rounded-md transition-colors',
                  device === option.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
                )}
              >
                <Icon size={15} aria-hidden="true" />
                <span className="sr-only">{option.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={reload}
            title="Reload preview"
            className="grid size-7 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span className="sr-only">Reload preview</span>
          </button>

          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open the published page in a new tab"
              className="grid size-7 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span className="sr-only">Open the published page in a new tab</span>
            </a>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-200/60 p-3">
        <div
          className="mx-auto h-full bg-white shadow-sm transition-[width] duration-300"
          style={{ width: width ? `${width}px` : '100%', maxWidth: '100%' }}
        >
          <iframe
            key={nonce}
            ref={frame}
            src={src}
            title="Website preview"
            className="h-full w-full border-0"
            /*
              Deliberately not sandboxed.

              A `sandbox` attribute without allow-same-origin gives the frame an
              opaque origin, which would report itself as "null" to our
              postMessage origin check and would not match the targetOrigin we
              post to — so the preview would connect and then never update.
              Adding allow-same-origin back would defeat the point of the
              attribute anyway. The frame is already cross-origin, so it cannot
              reach this document, and the website's own CSP governs what runs
              inside it.
            */
          />
        </div>
      </div>

      {!ready && (
        <p className="border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          Connecting to {SITE_ORIGIN.replace(/^https?:\/\//, '')}… if this stays, check the
          website is running.
        </p>
      )}

      {/*
        Sections of the page that this form has no field for.

        Six course pages were written by hand before the CMS existed. What an
        editor types now wins over that copy wherever there is a box for it,
        but these sections have no box — so the preview keeps showing the
        original wording however much is changed here. Saying so is what stops
        it reading as the preview being broken.
      */}
      {uneditable.length > 0 && (
        <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2">
          <Info size={13} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-amber-900">
            <strong className="font-medium">Written by hand, not editable here:</strong>{' '}
            {uneditable.join(', ')}. Everything else on this page follows what you type.
          </p>
        </div>
      )}
    </div>
  )
}
