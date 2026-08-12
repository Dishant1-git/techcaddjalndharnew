import { ApiError } from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

/** The API host without the `/api` prefix — uploads are served from its root. */
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '')

/**
 * Resolves an uploaded file's path against the API.
 *
 * Media is stored as a site-relative path (`/uploads/<name>`) so the database
 * survives a change of domain. But the CMS is served from a different origin
 * than the API, so `<img src="/uploads/…">` would resolve against the CMS —
 * and a dev server answers every unknown path with the app shell, so the tag
 * receives HTML and renders as a broken image rather than failing loudly.
 *
 * Absolute, data: and blob: URLs are returned untouched, as are assets served
 * by the CMS itself.
 */
export function assetUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  if (/^(https?:|data:|blob:)/i.test(url)) return url
  if (!url.startsWith('/uploads/')) return url

  return `${API_ORIGIN}${url}`
}

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
