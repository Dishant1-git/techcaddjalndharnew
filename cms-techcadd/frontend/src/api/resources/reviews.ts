import type { BaseEntity, Review } from '../../types'
import { createHttpResource } from '../http/resource'

export type ReviewCreate = Omit<Review, keyof BaseEntity>
export type ReviewUpdate = Partial<ReviewCreate>

/** Live against the Express API. */
export const reviewsApi = createHttpResource<Review, ReviewCreate, ReviewUpdate>('/reviews')
