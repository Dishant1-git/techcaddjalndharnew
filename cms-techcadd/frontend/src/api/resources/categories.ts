import type { BaseEntity, Category } from '../../types'
import { createHttpResource } from '../http/resource'

export type CategoryCreate = Omit<Category, keyof BaseEntity>
export type CategoryUpdate = Partial<CategoryCreate>

/** Live against the Express API. */
export const categoriesApi = createHttpResource<Category, CategoryCreate, CategoryUpdate>(
  '/categories',
)
