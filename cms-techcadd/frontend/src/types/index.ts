import type { LucideIcon } from 'lucide-react'

export * from './entities'

/* ------------------------------------------------------------------ */
/* Shared primitives                                                    */
/* ------------------------------------------------------------------ */

export type BadgeTone = 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'neutral'

export type TrendDirection = 'up' | 'down' | 'flat'

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */

export interface NavItem {
  /** Stable key, also used as the module name on placeholder pages. */
  id: string
  label: string
  path: string
  icon: LucideIcon
  /** Optional count rendered as a pill on the right of the nav row. */
  badge?: number
}

export interface NavSection {
  id: string
  /** Section caption; hidden when the sidebar is collapsed. */
  title: string
  items: NavItem[]
}

/* ------------------------------------------------------------------ */
/* Dashboard statistics                                                 */
/* ------------------------------------------------------------------ */

export interface Stat {
  id: string
  label: string
  value: number
  icon: LucideIcon
  /** Percentage change vs. the comparison period — absent until history exists. */
  change?: number
  trend?: TrendDirection
  /** e.g. "vs. last month" — absent until history exists. */
  comparison?: string
  /** Route the card links to. */
  path: string
}

/* ------------------------------------------------------------------ */
/* Trend series                                                         */
/* ------------------------------------------------------------------ */

export interface TrendPoint {
  /** Short axis label, e.g. "Mon". */
  label: string
  /** Full label used in tooltips and the accessible data table. */
  fullLabel: string
  value: number
}

/* ------------------------------------------------------------------ */
/* Today's snapshot                                                     */
/* ------------------------------------------------------------------ */

export interface SnapshotItem {
  id: string
  label: string
  value: string
  icon: LucideIcon
}

/* ------------------------------------------------------------------ */
/* Quick actions                                                        */
/* ------------------------------------------------------------------ */

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: LucideIcon
  path: string
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                            */
/* ------------------------------------------------------------------ */

export type EnquiryStatus = 'new' | 'contacted' | 'follow-up' | 'converted' | 'closed'

export interface Enquiry {
  id: string
  studentName: string
  phone: string
  course: string
  branch: string
  status: EnquiryStatus
  /** ISO date string. */
  date: string
}

/* ------------------------------------------------------------------ */
/* Courses                                                              */
/* ------------------------------------------------------------------ */

export type ContentStatus = 'published' | 'draft' | 'review'

/**
 * The dashboard widget's shape — a course reduced to what the "Popular Courses"
 * card renders. The full record is `Course` in `./entities`.
 */
export interface PopularCourse {
  id: string
  name: string
  category: string
  enquiries: number
  status: ContentStatus
  /** Short label used inside the image placeholder. */
  initials: string
  /** Tailwind background + text classes tinting the image placeholder. */
  accent: string
}

/* ------------------------------------------------------------------ */
/* Website overview                                                     */
/* ------------------------------------------------------------------ */

export interface ContentOverviewItem {
  id: string
  label: string
  value: number
  total: number
  tone: BadgeTone
}

export interface WebsiteStatus {
  label: string
  state: 'online' | 'degraded' | 'offline'
  detail: string
  /** Only shown once uptime is actually being measured. */
  uptime?: string
}

/* ------------------------------------------------------------------ */
/* Activity feed                                                        */
/* ------------------------------------------------------------------ */

export type ActivityKind = 'course' | 'blog' | 'faculty' | 'banner' | 'enquiry' | 'page'

export interface Activity {
  id: string
  actor: string
  message: string
  kind: ActivityKind
  /** Human-friendly relative timestamp, e.g. "12 minutes ago". */
  timestamp: string
}

/* ------------------------------------------------------------------ */
/* Admin user                                                           */
/* ------------------------------------------------------------------ */

export interface AdminUser {
  name: string
  role: string
  email: string
  initials: string
}
