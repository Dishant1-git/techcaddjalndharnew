import { useQuery } from '@tanstack/react-query'
import { BookOpen, Building2, FileText, Mail, Newspaper, Users } from 'lucide-react'

import { fetchDashboardSummary, type DashboardSummary } from '../../api/resources/dashboard'
import type { Stat, TrendPoint } from '../../types'

/**
 * One request behind every panel on the dashboard.
 *
 * Each hook below is a `select` over this same query, so React Query dedupes
 * them into a single fetch: the page costs one round trip instead of the
 * twenty count-only list calls it used to make, and every number on screen is
 * sampled at the same moment rather than at twenty different ones.
 */
function useSummary<T>(select: (summary: DashboardSummary) => T) {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
    select,
  })
}

const STAT_META = [
  { id: 'courses', label: 'Total Courses', icon: BookOpen, path: '/courses' },
  { id: 'enquiries', label: 'Total Enquiries', icon: Mail, path: '/enquiries' },
  { id: 'blogs', label: 'Total Blogs', icon: Newspaper, path: '/blogs' },
  { id: 'branches', label: 'Total Branches', icon: Building2, path: '/branches' },
  { id: 'faculty', label: 'Total Faculty', icon: Users, path: '/faculty' },
  { id: 'publishedPages', label: 'Published Pages', icon: FileText, path: '/pages' },
] as const

export function useDashboardStats() {
  // No trend fields — there is no history to compare against, and inventing a
  // percentage would be worse than showing nothing.
  return useSummary((summary): Stat[] =>
    STAT_META.map((meta) => ({
      id: meta.id,
      label: meta.label,
      value: summary.totals[meta.id],
      icon: meta.icon,
      path: meta.path,
    })),
  )
}

export function useTodaySnapshot() {
  return useSummary((summary) => summary.today)
}

/** Enquiry counts for the last seven days, oldest first. */
export function useEnquiryTrend() {
  return useSummary((summary): TrendPoint[] =>
    summary.enquiryTrend.map((point) => {
      // Parse as local midnight; `new Date('2026-08-11')` is UTC and can land
      // on the previous day west of Greenwich.
      const [year, month, day] = point.date.split('-').map(Number)
      const date = new Date(year, month - 1, day)

      return {
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        fullLabel: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long' }),
        value: point.value,
      }
    }),
  )
}

export function useContentOverview() {
  return useSummary((summary) => summary.contentOverview)
}

export function useRecentEnquiries() {
  // Kept as `{ items }` so the table components read the same shape they did
  // when this came from a list endpoint.
  return useSummary((summary) => ({ items: summary.recentEnquiries }))
}

export function useRecentCourses() {
  return useSummary((summary) => ({ items: summary.recentCourses }))
}

export interface ActivityEntry {
  id: string
  title: string
  kind: 'course' | 'blog' | 'page'
  updatedAt: string
}

/** Derived from recently-updated content — there is no audit log to read. */
export function useRecentActivity() {
  return useSummary((summary): ActivityEntry[] => summary.recentActivity)
}
