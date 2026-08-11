import type { BaseEntity, GalleryAlbum } from '../../types'
import { createHttpResource } from '../http/resource'

export type GalleryAlbumCreate = Omit<GalleryAlbum, keyof BaseEntity>
export type GalleryAlbumUpdate = Partial<GalleryAlbumCreate>

/** Live against the Express API. */
export const galleryApi = createHttpResource<
  GalleryAlbum,
  GalleryAlbumCreate,
  GalleryAlbumUpdate
>('/gallery')
