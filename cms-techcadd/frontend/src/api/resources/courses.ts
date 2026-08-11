import type { BaseEntity, Course } from '../../types'
import { createHttpResource } from '../http/resource'

export type CourseCreate = Omit<Course, keyof BaseEntity>
export type CourseUpdate = Partial<CourseCreate>

/**
 * Live against the Express API. The other resources still use the localStorage
 * mock — they move across as their endpoints are built.
 */
export const coursesApi = createHttpResource<Course, CourseCreate, CourseUpdate>('/courses')
