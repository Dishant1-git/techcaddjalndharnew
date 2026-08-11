import { randomUUID } from 'node:crypto'
import { mkdir, unlink } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

import { config } from '../../config.js'

/** Where uploaded files live on disk. */
export const uploadRoot = resolve(config.UPLOAD_DIR)

/** The path prefix they are served from. */
export const UPLOAD_URL_PREFIX = '/uploads'

export const MAX_UPLOAD_BYTES = config.MAX_UPLOAD_MB * 1024 * 1024

/**
 * What the library will take.
 *
 * SVG is included because logos need it, but it is markup, not pixels — see
 * the response headers in app.ts, which stop a browser executing one that is
 * opened directly.
 */
export const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
])

const EXTENSIONS: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
}

export async function ensureUploadRoot(): Promise<void> {
  await mkdir(uploadRoot, { recursive: true })
}

/**
 * A safe name to store the file under.
 *
 * The original name is never used on disk. It is attacker-controlled and can
 * carry `../`, a null byte, or a name that collides with an existing file; the
 * extension comes from the mime type we already validated, not from the name.
 */
export function storedName(mimeType: string, originalName: string): string {
  const fallback = extname(originalName).toLowerCase()
  const extension = EXTENSIONS[mimeType] ?? (/^\.[a-z0-9]{1,5}$/.test(fallback) ? fallback : '')
  return `${randomUUID()}${extension}`
}

export function publicUrl(name: string): string {
  return `${UPLOAD_URL_PREFIX}/${name}`
}

/**
 * Removes a stored file.
 *
 * Resolves the path and checks it is still inside the upload root, so a
 * tampered database row cannot make this delete something else. A missing file
 * is not an error: the row going away is what matters.
 */
export async function removeStoredFile(url: string): Promise<void> {
  if (!url.startsWith(`${UPLOAD_URL_PREFIX}/`)) return

  const name = url.slice(UPLOAD_URL_PREFIX.length + 1)
  const target = resolve(join(uploadRoot, name))
  if (!target.startsWith(uploadRoot)) return

  try {
    await unlink(target)
  } catch {
    // Already gone, or never written. Nothing to do.
  }
}
