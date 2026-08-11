import { useQuery } from '@tanstack/react-query'

import { categoriesApi, coursesApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const categoryHooks = createResourceHooks('categories', categoriesApi)

/**
 * Course counts per category. Deleting a category that still has courses would
 * orphan them on the public site, so the list needs this to block the action.
 */
export function useCategoryCourseCounts() {
  return useQuery({
    queryKey: ['categories', 'course-counts'],
    queryFn: async () => {
      const { items } = await coursesApi.list({ page: 1, pageSize: 500 })
      const counts = new Map<string, number>()

      for (const course of items) {
        if (!course.categoryId) continue
        counts.set(course.categoryId, (counts.get(course.categoryId) ?? 0) + 1)
      }

      return counts
    },
  })
}
