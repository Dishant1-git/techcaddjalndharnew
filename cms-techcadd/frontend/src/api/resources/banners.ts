import type { BaseEntity, Banner } from '../../types'
import { createHttpResource } from '../http/resource'

export type BannerCreate = Omit<Banner, keyof BaseEntity>
export type BannerUpdate = Partial<BannerCreate>

/** Live against the Express API. */
export const bannersApi = createHttpResource<Banner, BannerCreate, BannerUpdate>('/banners')
