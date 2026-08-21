import { request } from '../client'
import type { Course, EnquiryRecord } from '../../types'

export interface DashboardTotals {
  courses: number
  enquiries: number
  blogs: number
  publishedPages: number
}

export interface DashboardTrendPoint {
  /** ISO date, oldest first. */
  date: string
  value: number
}

export interface DashboardActivity {
  id: string
  title: string
  kind: 'course' | 'blog' | 'page'
  updatedAt: string
}

export interface DashboardSummary {
  totals: DashboardTotals
  today: { newEnquiries: number; pendingReview: number; liveCourses: number }
  enquiryTrend: DashboardTrendPoint[]
  contentOverview: { published: number; draft: number; review: number; total: number }
  recentActivity: DashboardActivity[]
  /** The same shape /api/enquiries returns. */
  recentEnquiries: EnquiryRecord[]
  recentCourses: Course[]
}

/** Everything the dashboard renders, in one request. */
export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>('/dashboard/summary')
}

export interface SearchHit {
  id: string
  label: string
  detail?: string
}

export interface SearchGroup {
  key: 'courses' | 'blogs' | 'pages' | 'enquiries'
  hits: SearchHit[]
}

/** Global search. Terms shorter than two characters come back empty. */
export function fetchSearch(term: string): Promise<{ groups: SearchGroup[] }> {
  return request<{ groups: SearchGroup[] }>('/search', { query: { q: term } })
}
