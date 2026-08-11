import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { blogsApi, coursesApi, pagesApi, redirectsApi } from '../../api'
import { settingsApi } from '../../api/resources/settings'
import type { SiteSettings } from '../../types'
import { createResourceHooks } from '../shared/createResourceHooks'

export const redirectHooks = createResourceHooks('redirects', redirectsApi)

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.get() })
}

export function useUpdateSettings() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (patch: Partial<SiteSettings>) => settingsApi.update(patch),
    onSuccess: (next) => client.setQueryData(['settings'], next),
  })
}

export interface SitemapEntry {
  path: string
  type: 'Page' | 'Course' | 'Blog'
  updatedAt: string
}

/**
 * The sitemap is derived from published content rather than stored, so it can
 * never drift out of step with what is actually live.
 */
export function useSitemap() {
  return useQuery({
    queryKey: ['seo', 'sitemap'],
    queryFn: async (): Promise<SitemapEntry[]> => {
      const params = { page: 1, pageSize: 500, filters: { status: 'published' } }

      const [pages, courses, blogs] = await Promise.all([
        pagesApi.list(params),
        coursesApi.list(params),
        blogsApi.list(params),
      ])

      return [
        ...pages.items.map((p) => ({
          path: `/${p.slug}`,
          type: 'Page' as const,
          updatedAt: p.updatedAt,
        })),
        ...courses.items.map((c) => ({
          path: `/courses/${c.slug}`,
          type: 'Course' as const,
          updatedAt: c.updatedAt,
        })),
        ...blogs.items.map((b) => ({
          path: `/blog/${b.slug}`,
          type: 'Blog' as const,
          updatedAt: b.updatedAt,
        })),
      ].sort((a, b) => a.path.localeCompare(b.path))
    },
  })
}
