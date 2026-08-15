import type { BaseEntity, Faq } from '../../types'
import { createHttpResource } from '../http/resource'

export type FaqCreate = Omit<Faq, keyof BaseEntity>
export type FaqUpdate = Partial<FaqCreate>

/** Live against the Express API. */
export const faqsApi = createHttpResource<Faq, FaqCreate, FaqUpdate>('/faqs')
