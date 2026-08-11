import type { BaseEntity, MediaItem } from '../../types'
import { request } from '../client'
import { createHttpResource } from '../http/resource'

export type MediaCreate = Omit<MediaItem, keyof BaseEntity>
export type MediaUpdate = Partial<Pick<MediaItem, 'alt' | 'folder' | 'filename'>>

/**
 * Live against the Express API.
 *
 * `create` is not part of this resource: media is created by uploading bytes,
 * not by posting JSON. Use `uploadMedia` below.
 */
export const mediaApi = createHttpResource<MediaItem, MediaCreate, MediaUpdate>('/media')

/**
 * Sends the files as multipart and returns the created records.
 *
 * Always an array, even for one file, matching what the endpoint returns.
 */
export function uploadMedia(files: File[], folder?: string): Promise<MediaItem[]> {
  const form = new FormData()
  for (const file of files) form.append('files', file)
  if (folder) form.append('folder', folder)

  return request<MediaItem[]>('/media', { method: 'POST', body: form })
}
