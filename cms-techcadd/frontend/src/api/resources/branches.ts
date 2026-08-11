import type { BaseEntity, Branch } from '../../types'
import { createHttpResource } from '../http/resource'

export type BranchCreate = Omit<Branch, keyof BaseEntity>
export type BranchUpdate = Partial<BranchCreate>

/** Live against the Express API. */
export const branchesApi = createHttpResource<Branch, BranchCreate, BranchUpdate>('/branches')
