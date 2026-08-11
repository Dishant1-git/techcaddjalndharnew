import 'dotenv/config'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

import { createApp } from '../src/app.js'
import { pool } from '../src/db/pool.js'

/**
 * The tests drive a real server against the real database.
 *
 * Not mocks: every bug this suite was written from — an id too long for its
 * column, a relation that could not be cleared, a NOT NULL column handed an
 * empty string — was invisible to anything that stubbed MySQL out.
 */
let server: Server | undefined
let baseUrl = ''

export async function startServer(): Promise<string> {
  if (server) return baseUrl

  // Port 0 lets the OS pick a free one, so a running dev server on 4000 does
  // not collide with the suite.
  server = createApp().listen(0)
  await new Promise<void>((resolve) => server?.once('listening', resolve))

  const { port } = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${port}/api`
  return baseUrl
}

export async function stopServer(): Promise<void> {
  if (server) {
    await new Promise<void>((resolve) => server?.close(() => resolve()))
    server = undefined
  }
  await pool.end()
}

export interface ApiResponse<T = any> {
  status: number
  body: T
}

/** A client that carries its own cookies, so several users can act at once. */
export function client() {
  let cookie = ''

  async function call<T = any>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    const isForm = body instanceof FormData
    const res = await fetch(baseUrl + path, {
      method,
      headers: {
        ...(isForm || body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(cookie ? { cookie } : {}),
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })

    const set = res.headers.getSetCookie?.() ?? []
    if (set.length) cookie = set.map((c) => c.split(';')[0]).join('; ')

    const text = await res.text()
    return { status: res.status, body: text ? JSON.parse(text) : undefined }
  }

  return {
    call,
    get: <T = any>(path: string) => call<T>('GET', path),
    post: <T = any>(path: string, body?: unknown) => call<T>('POST', path, body),
    patch: <T = any>(path: string, body?: unknown) => call<T>('PATCH', path, body),
    delete: <T = any>(path: string, body?: unknown) => call<T>('DELETE', path, body),
    async signIn(identifier = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
      const res = await call('POST', '/auth/login', { identifier, password })
      if (res.status !== 200) {
        throw new Error(`sign-in failed (${res.status}): ${JSON.stringify(res.body)}`)
      }
      return res.body
    },
  }
}

export type Client = ReturnType<typeof client>

export const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'admin@techcadd.com'
export const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'ChangeMe123'

/**
 * Empties the tables a test touches, children first.
 *
 * The seeded admin is preserved and reset: the users tests deliberately demote
 * it, so an aborted run would otherwise leave the next one asserting against
 * the wrong starting state.
 */
export async function resetTables(...tables: string[]): Promise<void> {
  for (const table of tables) {
    await pool.query(`DELETE FROM \`${table}\``)
  }
}

export async function resetUsers(): Promise<void> {
  await pool.query('DELETE FROM users WHERE email <> ?', [ADMIN_EMAIL])
  await pool.query(
    "UPDATE users SET name = 'techcadd-team', role = 'super-admin', active = 1 WHERE email = ?",
    [ADMIN_EMAIL],
  )
}

export { pool }
