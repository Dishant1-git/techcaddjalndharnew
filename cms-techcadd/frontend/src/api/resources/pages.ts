import type { BaseEntity, Page } from '../../types'
import { createHttpResource } from '../http/resource'

export type PageCreate = Omit<Page, keyof BaseEntity>
export type PageUpdate = Partial<PageCreate>

/** Live against the Express API. */
export const pagesApi = createHttpResource<Page, PageCreate, PageUpdate>('/pages')
