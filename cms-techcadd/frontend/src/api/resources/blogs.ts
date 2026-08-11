import type { BaseEntity, Blog } from '../../types'
import { createHttpResource } from '../http/resource'

export type BlogCreate = Omit<Blog, keyof BaseEntity>
export type BlogUpdate = Partial<BlogCreate>

/** Live against the Express API. */
export const blogsApi = createHttpResource<Blog, BlogCreate, BlogUpdate>('/blogs')
