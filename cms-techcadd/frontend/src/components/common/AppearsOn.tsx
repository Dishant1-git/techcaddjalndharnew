import { ExternalLink, Globe, Info } from 'lucide-react'

import { SITE_MAP } from '../../config/siteMap'

/**
 * Tells the editor where this content shows up and when it goes live.
 *
 * The two questions a CMS form otherwise leaves unanswered. Without them a
 * saved record is an act of faith: the editor cannot tell whether it reached
 * the site, whether it is on a page of its own, or whether it is waiting on
 * something. Every "I saved it and nothing happened" starts there.
 */
export function AppearsOn({
  module,
  record,
  /** False while creating: there is no URL to visit until the record exists. */
  saved = true,
}: {
  module: string
  record?: Record<string, unknown>
  saved?: boolean
}) {
  const placement = SITE_MAP[module]
  if (!placement) return null

  if (placement.notLive) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
          <Info size={15} aria-hidden="true" />
          Not shown on the website
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-amber-800">{placement.notLive}</p>
      </div>
    )
  }

  const url = saved && record ? placement.url?.(record) : undefined
  const status = record?.status

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
        <Globe size={15} aria-hidden="true" />
        Where this appears
      </p>

      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{placement.where}</p>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800"
        >
          {url.replace(/^https?:\/\//, '')}
          <ExternalLink size={12} aria-hidden="true" />
        </a>
      )}

      <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-500">
        {status === 'published' ? (
          <>Changes reach the website within a few seconds of saving.</>
        ) : (
          <>
            Only <strong className="font-medium text-slate-700">Published</strong> content appears
            on the website. Drafts stay here.
          </>
        )}
      </p>
    </div>
  )
}
