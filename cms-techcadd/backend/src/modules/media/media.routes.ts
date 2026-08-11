import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { Router, type ErrorRequestHandler } from 'express'
import multer, { MulterError } from 'multer'
import { z } from 'zod'

import { asyncHandler, badRequest } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import { readDimensions } from './dimensions.js'
import * as repo from './media.repo.js'
import { mediaPatchSchema, uploadFieldsSchema } from './media.schema.js'
import {
  ALLOWED_MIME_TYPES,
  ensureUploadRoot,
  MAX_UPLOAD_BYTES,
  publicUrl,
  storedName,
  uploadRoot,
} from './storage.js'

export const mediaRouter = Router()

mediaRouter.use(requireAuth)

/**
 * Files are buffered in memory, not streamed to disk by multer.
 *
 * Dimensions have to be read from the bytes anyway, and holding one bounded
 * upload in memory is simpler than writing a temp file and cleaning it up when
 * validation fails. The size limit is what keeps that safe.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 20 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(badRequest(`${file.mimetype} files are not accepted.`))
      return
    }
    callback(null, true)
  },
})

mediaRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

mediaRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id')))
  }),
)

/**
 * Accepts one or more files under the `files` field.
 *
 * Returns an array even for a single file, so the client has one shape to
 * handle whether the user dropped one image or twenty.
 */
mediaRouter.post(
  '/',
  requireRole('admin'),
  upload.array('files', 20),
  asyncHandler(async (req, res) => {
    const files = Array.isArray(req.files) ? req.files : []
    if (files.length === 0) throw badRequest('Choose at least one file to upload.')

    const { folder } = uploadFieldsSchema.parse(req.body ?? {})
    await ensureUploadRoot()

    const created: unknown[] = []
    for (const file of files) {
      const name = storedName(file.mimetype, file.originalname)
      await writeFile(join(uploadRoot, name), file.buffer)

      const { width, height } = readDimensions(file.buffer)
      created.push(
        await repo.recordUpload({
          // The original name is kept for display only; the file on disk is
          // named by us.
          filename: file.originalname || `${randomUUID()}`,
          url: publicUrl(name),
          mimeType: file.mimetype,
          size: file.size,
          width,
          height,
          folder,
        }),
      )
    }

    res.status(201).json(created)
  }),
)

mediaRouter.patch(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.json(await repo.update(requireParam(req, 'id'), mediaPatchSchema.parse(req.body)))
  }),
)

const deleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

mediaRouter.delete(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')

    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)

/**
 * Multer reports its own limits by throwing, and its messages ("File too
 * large") are not what the CMS should show. Translate them before they reach
 * the generic handler, which would call them 500s.
 */
const multerErrors: ErrorRequestHandler = (error, _req, _res, next) => {
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      next(badRequest(`Files must be under ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`))
      return
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      next(badRequest('Too many files at once — upload up to 20.'))
      return
    }
    next(badRequest(error.message))
    return
  }
  next(error)
}

mediaRouter.use(multerErrors)
