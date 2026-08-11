export type SortDirection = 'asc' | 'desc'

export interface ListParams {
  page: number
  pageSize: number
  search?: string
  sort?: { field: string; dir: SortDirection }
  filters?: Record<string, string | string[] | undefined>
}

export interface ListResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * Every failure — mock or real — normalises to this, so forms can map
 * server-side validation back onto individual fields.
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/** The five operations every resource exposes. */
export interface Resource<T, TCreate, TUpdate = Partial<TCreate>> {
  list(params: ListParams): Promise<ListResult<T>>
  get(id: string): Promise<T>
  create(input: TCreate): Promise<T>
  update(id: string, input: TUpdate): Promise<T>
  remove(ids: string[]): Promise<void>
}

export const DEFAULT_PAGE_SIZE = 25
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const
