import { request } from '../client'
import type { ListParams, ListResult, Resource } from '../types'

/**
 * Builds the five-method resource against the REST API.
 *
 * Deliberately mirrors `createMockResource`, so switching a module from the
 * mock to the API is a one-line change in its resource file — and both honour
 * the same `Resource<T>` contract the whole UI is written against.
 */
export function createHttpResource<T, TCreate, TUpdate = Partial<TCreate>>(
  basePath: string,
): Resource<T, TCreate, TUpdate> {
  return {
    list(params: ListParams) {
      return request<ListResult<T>>(basePath, {
        query: {
          page: params.page,
          pageSize: params.pageSize,
          q: params.search,
          sort: params.sort?.field,
          dir: params.sort?.dir,
          // Filters go through as plain query params; the server ignores any
          // key that is not on its whitelist.
          ...(params.filters as Record<string, string | string[] | undefined>),
        },
      })
    },

    get(id: string) {
      return request<T>(`${basePath}/${encodeURIComponent(id)}`)
    },

    create(input: TCreate) {
      return request<T>(basePath, { method: 'POST', body: input })
    },

    update(id: string, input: TUpdate) {
      return request<T>(`${basePath}/${encodeURIComponent(id)}`, { method: 'PATCH', body: input })
    },

    remove(ids: string[]) {
      // Bulk delete takes the ids in the body — a DELETE with a long query
      // string would hit URL length limits on a large selection.
      return request<void>(basePath, { method: 'DELETE', body: { ids } })
    },
  }
}
