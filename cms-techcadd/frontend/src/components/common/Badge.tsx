import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import type { BadgeTone, ContentStatus, EnquiryStatus } from '../../types'

interface BadgeProps {
  tone?: BadgeTone
  /** Renders a small leading dot — useful for status pills. */
  withDot?: boolean
  className?: string
  children: ReactNode
}

const toneClasses: Record<BadgeTone, string> = {
  primary: 'bg-primary-50 text-primary-700 ring-primary-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const dotClasses: Record<BadgeTone, string> = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400',
}

export function Badge({ tone = 'neutral', withDot = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
    >
      {withDot && (
        <span className={cn('size-1.5 rounded-full', dotClasses[tone])} aria-hidden="true" />
      )}
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Status helpers — keep label + tone mapping in one place             */
/* ------------------------------------------------------------------ */

const enquiryStatusMeta: Record<EnquiryStatus, { label: string; tone: BadgeTone }> = {
  new: { label: 'New', tone: 'primary' },
  contacted: { label: 'Contacted', tone: 'info' },
  'follow-up': { label: 'Follow-up', tone: 'warning' },
  converted: { label: 'Converted', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
}

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  const { label, tone } = enquiryStatusMeta[status]
  return (
    <Badge tone={tone} withDot>
      {label}
    </Badge>
  )
}

const contentStatusMeta: Record<ContentStatus, { label: string; tone: BadgeTone }> = {
  published: { label: 'Published', tone: 'success' },
  draft: { label: 'Draft', tone: 'warning' },
  review: { label: 'In Review', tone: 'info' },
}

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  const { label, tone } = contentStatusMeta[status]
  return (
    <Badge tone={tone} withDot>
      {label}
    </Badge>
  )
}
