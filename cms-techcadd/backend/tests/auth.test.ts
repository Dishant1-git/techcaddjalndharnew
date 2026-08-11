import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  client,
  pool,
  resetUsers,
  startServer,
  stopServer,
} from './helpers.js'

beforeAll(startServer)
afterAll(stopServer)
beforeEach(resetUsers)

describe('sign in', () => {
  it('accepts the seeded administrator', async () => {
    const api = client()
    const user = await api.signIn()
    expect(user.email).toBe(ADMIN_EMAIL)
    expect(user.role).toBe('admin')
  })

  it('gives the same answer for a wrong password and an unknown address', async () => {
    // Different messages would let anyone enumerate which emails have accounts.
    const wrongPassword = await client().post('/auth/login', {
      identifier: ADMIN_EMAIL,
      password: 'not-the-password',
    })
    const unknownEmail = await client().post('/auth/login', {
      identifier: 'nobody@example.com',
      password: 'not-the-password',
    })

    expect(wrongPassword.status).toBe(unknownEmail.status)
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message)
  })

  it('never returns password material', async () => {
    const api = client()
    const user = await api.signIn()
    expect(JSON.stringify(user)).not.toMatch(/hash|argon2/i)
  })

  it('keeps the session in an httpOnly cookie', async () => {
    const res = await fetch(`${await startServer()}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifier: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    })

    const cookies = res.headers.getSetCookie?.() ?? []
    expect(cookies.join(';')).toMatch(/HttpOnly/i)
  })
})

describe('session', () => {
  it('resolves the signed-in user', async () => {
    const api = client()
    await api.signIn()
    const me = await api.get('/auth/me')
    expect(me.status).toBe(200)
    expect(me.body.email).toBe(ADMIN_EMAIL)
  })

  it('stops working after signing out', async () => {
    const api = client()
    await api.signIn()
    expect((await api.post('/auth/logout')).status).toBeLessThan(400)
    expect((await api.get('/auth/me')).status).toBe(401)
  })
})

describe('password reset', () => {
  it('never puts the token in the response', async () => {
    // The token is the credential. If the response carried it, anyone could
    // reset any account by asking.
    const res = await client().post('/auth/forgot-password', { email: ADMIN_EMAIL })
    expect(res.status).toBe(204)
    expect(res.body).toBeUndefined()
  })

  it('answers the same way for an address that does not exist', async () => {
    const known = await client().post('/auth/forgot-password', { email: ADMIN_EMAIL })
    const unknown = await client().post('/auth/forgot-password', { email: 'nobody@example.com' })
    expect(known.status).toBe(unknown.status)
  })

  it('stores only a hash of the token', async () => {
    await client().post('/auth/forgot-password', { email: ADMIN_EMAIL })

    const [rows] = await pool.query<any[]>(
      'SELECT token_hash FROM password_resets ORDER BY created_at DESC LIMIT 1',
    )
    // A leaked database must not yield working reset links.
    expect(rows[0]?.token_hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('refuses a token that was never issued', async () => {
    const res = await client().post('/auth/reset-password', {
      token: 'a'.repeat(64),
      password: 'BrandNewPass1',
    })
    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})

describe('access', () => {
  /**
   * There is one role, so every signed-in account can do everything. What
   * still has to hold is that being signed in is required at all — the gate is
   * authentication now, not authorisation.
   */
  it('lets any signed-in account reach every area', async () => {
    const admin = client()
    await admin.signIn()

    const created = await admin.post('/users', {
      name: 'Second Admin',
      email: 'second-admin@example.com',
      password: 'AdminPassword1',
    })
    expect(created.status).toBe(201)
    expect(created.body.role).toBe('admin')

    const other = client()
    await other.signIn('second-admin@example.com', 'AdminPassword1')

    expect((await other.get('/courses')).status).toBe(200)
    expect((await other.patch('/settings', { siteName: 'TechCADD' })).status).toBe(200)
    expect((await other.get('/users')).status).toBe(200)
  })

  it('refuses everything without a session', async () => {
    const anonymous = client()
    expect((await anonymous.get('/courses')).status).toBe(401)
    expect((await anonymous.patch('/settings', { siteName: 'Hijacked' })).status).toBe(401)
    expect((await anonymous.post('/users', { name: 'X', email: 'x@y.z' })).status).toBe(401)
  })
})
