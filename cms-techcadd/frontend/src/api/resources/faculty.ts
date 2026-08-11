import type { BaseEntity, Faculty } from '../../types'
import { createHttpResource } from '../http/resource'

export type FacultyCreate = Omit<Faculty, keyof BaseEntity>
export type FacultyUpdate = Partial<FacultyCreate>

/** Live against the Express API. */
export const facultyApi = createHttpResource<Faculty, FacultyCreate, FacultyUpdate>('/faculty')
