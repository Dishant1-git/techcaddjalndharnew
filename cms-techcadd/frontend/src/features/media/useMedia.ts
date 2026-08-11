import { useMutation, useQueryClient } from '@tanstack/react-query'

import { mediaApi } from '../../api'
import { uploadMedia } from '../../api/resources/media'
import { createResourceHooks } from '../shared/createResourceHooks'

export const mediaHooks = createResourceHooks('media', mediaApi)

/**
 * Largest file the API will accept.
 *
 * Checked here only so the user gets an immediate, per-file message instead of
 * one rejected request for the whole batch. The server enforces the real limit
 * — keep this in step with `MAX_UPLOAD_MB` in the backend config.
 */
export const UPLOAD_LIMIT = 10 * 1024 * 1024

export function useUploadMedia() {
  const client = useQueryClient()

  return useMutation({
    // One request for the whole batch: the endpoint takes many files, and the
    // browser can then show a single progress state.
    mutationFn: (files: File[]) => uploadMedia(files),
    onSuccess: () => client.invalidateQueries({ queryKey: ['media'] }),
  })
}
