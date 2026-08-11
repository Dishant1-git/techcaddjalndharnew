import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import { isProduction } from '../config.js'

/**
 * Mirrors the frontend's `ApiError`. The response body is
 * `{ message, fieldErrors? }` — the CMS forms map `fieldErrors` keys straight
 * back onto inputs, so the keys must match the form field names.
 */
export class HttpError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export const badRequest = (message: string, fieldErrors?: Record<string, string>) =>
  new HttpError(400, message, fieldErrors)

export const unauthorised = (message = 'You are not signed in.') => new HttpError(401, message)

export const forbidden = (message = 'You do not have access to this.') => new HttpError(403, message)

export const notFound = (what = 'Record') => new HttpError(404, `${what} not found.`)

export const unprocessable = (fieldErrors: Record<string, string>) =>
  new HttpError(422, 'Please fix the highlighted fields.', fieldErrors)

/** Wraps an async handler so a rejected promise reaches the error middleware. */
export function asyncHandler<T extends Request>(
  handler: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: T, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next)
  }
}

/** Turns a zod failure into the field-error map the frontend forms expect. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    // Keep the first message per field — forms show one error per input.
    if (path && !fieldErrors[path]) fieldErrors[path] = issue.message
  }
  return fieldErrors
}

interface MysqlError extends Error {
  code?: string
  sqlMessage?: string
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
    })
    return
  }

  if (error instanceof ZodError) {
    res.status(422).json({
      message: 'Please fix the highlighted fields.',
      fieldErrors: zodFieldErrors(error),
    })
    return
  }

  const mysqlError = error as MysqlError

  // Translate the constraint violations the UI can act on, rather than
  // leaking a raw driver message.
  if (mysqlError.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ message: 'That value is already in use.' })
    return
  }
  if (mysqlError.code === 'ER_ROW_IS_REFERENCED_2') {
    res.status(409).json({
      message: 'This record is still referenced by other content and cannot be deleted.',
    })
    return
  }
  // Pointing at a record that does not exist is the caller's mistake, not a
  // server fault. The driver names the column, so the form can highlight the
  // field that caused it instead of showing a bare 500.
  if (
    mysqlError.code === 'ER_NO_REFERENCED_ROW_2' ||
    mysqlError.code === 'ER_NO_REFERENCED_ROW'
  ) {
    const column = /FOREIGN KEY \(`([^`]+)`\)/.exec(mysqlError.sqlMessage ?? '')?.[1]
    const field = column?.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
    res.status(422).json({
      message: 'Please fix the highlighted fields.',
      fieldErrors: { [field ?? 'form']: 'The selected record no longer exists.' },
    })
    return
  }

  console.error('Unhandled error:', error)
  res.status(500).json({
    message: isProduction
      ? 'Something went wrong. Please try again.'
      : mysqlError.message || 'Internal server error.',
  })
}
