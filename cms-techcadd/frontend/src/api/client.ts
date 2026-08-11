import { ApiError } from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /** Appended as a query string; undefined and empty values are dropped. */
  query?: Record<string, string | number | boolean | string[] | undefined>
  signal?: AbortSignal
}

/**
 * FormData is sent as-is.
 *
 * The browser has to set `content-type` itself for multipart, because only it
 * knows the boundary string — setting it by hand produces a body the server
 * cannot parse.
 */
function bodyInit(body: unknown): { body?: BodyInit; headers?: HeadersInit } {
  if (body === undefined) return {}
  if (body instanceof FormData) return { body }
  return { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }
}

function buildQuery(query: RequestOptions['query']): string {
  if (!query) return ''

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue
    if (Array.isArray(value)) value.forEach((entry) => params.append(key, entry))
    else params.set(key, String(value))
  }

  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}

interface ErrorBody {
  message?: string
  fieldErrors?: Record<string, string>
}

/**
 * The single point where the app talks to the network.
 *
 * `credentials: 'include'` is essential — the session is an httpOnly cookie, so
 * without it every request would arrive unauthenticated.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(query)}`, {
      method,
      credentials: 'include',
      ...bodyInit(body),
      signal,
    })
  } catch (cause) {
    // fetch only rejects when the request never completed — the server is down,
    // DNS failed, or CORS blocked it. Say that, rather than "failed to fetch".
    if (signal?.aborted) throw cause
    throw new ApiError(0, 'Could not reach the server. Check that the API is running.')
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let payload: unknown
  try {
    payload = text ? JSON.parse(text) : undefined
  } catch {
    payload = undefined
  }

  if (!response.ok) {
    const { message, fieldErrors } = (payload ?? {}) as ErrorBody
    throw new ApiError(
      response.status,
      message ?? 'Something went wrong. Please try again.',
      fieldErrors,
    )
  }

  return payload as T
}
