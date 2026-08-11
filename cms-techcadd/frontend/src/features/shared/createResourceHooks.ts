import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ListParams, Resource } from '../../api'

/**
 * Builds the five query hooks every module needs. Extracted after Courses
 * proved the shape, so the remaining modules share one cache policy rather
 * than twelve slightly different ones.
 */
export function createResourceHooks<T extends { id: string }, TCreate, TUpdate>(
  key: string,
  api: Resource<T, TCreate, TUpdate>,
) {
  function useList(params: ListParams) {
    return useQuery({ queryKey: [key, 'list', params], queryFn: () => api.list(params) })
  }

  function useOne(id?: string) {
    return useQuery({
      queryKey: [key, 'detail', id],
      queryFn: () => api.get(id as string),
      enabled: Boolean(id),
    })
  }

  function useCreate() {
    const client = useQueryClient()
    return useMutation({
      mutationFn: (input: TCreate) => api.create(input),
      onSuccess: () => client.invalidateQueries({ queryKey: [key] }),
    })
  }

  function useUpdate() {
    const client = useQueryClient()
    return useMutation({
      mutationFn: ({ id, input }: { id: string; input: TUpdate }) => api.update(id, input),
      onSuccess: (record) => {
        // Write through so an open form does not flash stale values.
        client.setQueryData([key, 'detail', record.id], record)
        client.invalidateQueries({ queryKey: [key, 'list'] })
      },
    })
  }

  function useRemove() {
    const client = useQueryClient()
    return useMutation({
      mutationFn: (ids: string[]) => api.remove(ids),
      onSuccess: () => client.invalidateQueries({ queryKey: [key] }),
    })
  }

  return { useList, useOne, useCreate, useUpdate, useRemove }
}
