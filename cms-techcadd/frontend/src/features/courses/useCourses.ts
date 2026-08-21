import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { categoriesApi, coursesApi, type ListParams } from '../../api'
import type { CourseCreate, CourseUpdate } from '../../api/resources/courses'

const COURSES_KEY = 'courses'

export function useCoursesList(params: ListParams) {
  return useQuery({
    queryKey: [COURSES_KEY, 'list', params],
    queryFn: () => coursesApi.list(params),
  })
}

export function useCourse(id?: string) {
  return useQuery({
    queryKey: [COURSES_KEY, 'detail', id],
    queryFn: () => coursesApi.get(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateCourse() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (input: CourseCreate) => coursesApi.create(input),
    onSuccess: () => client.invalidateQueries({ queryKey: [COURSES_KEY] }),
  })
}

export function useUpdateCourse() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CourseUpdate }) =>
      coursesApi.update(id, input),
    onSuccess: (course) => {
      // Write the fresh record through so the edit form does not flash stale
      // values while the list refetches.
      client.setQueryData([COURSES_KEY, 'detail', course.id], course)
      client.invalidateQueries({ queryKey: [COURSES_KEY, 'list'] })
    },
  })
}

export function useDeleteCourses() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => coursesApi.remove(ids),
    onSuccess: () => client.invalidateQueries({ queryKey: [COURSES_KEY] }),
  })
}

/** The category picker on the course form. */
export function useCourseReferenceData() {
  const categories = useQuery({
    queryKey: ['categories', 'options'],
    queryFn: () => categoriesApi.list({ page: 1, pageSize: 200 }),
  })

  return {
    categoryOptions: (categories.data?.items ?? []).map((item) => ({
      value: item.id,
      label: item.name,
    })),
    loading: categories.isLoading,
  }
}
