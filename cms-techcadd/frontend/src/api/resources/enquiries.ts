import type { BaseEntity, EnquiryRecord } from '../../types'
import { createHttpResource } from '../http/resource'

export type EnquiryCreate = Omit<EnquiryRecord, keyof BaseEntity>
export type EnquiryUpdate = Partial<EnquiryCreate>

/** Live against the Express API. */
export const enquiriesApi = createHttpResource<
  EnquiryRecord,
  EnquiryCreate,
  EnquiryUpdate
>('/enquiries')
