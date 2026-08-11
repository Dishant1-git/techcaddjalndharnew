import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { client, resetUsers, startServer, stopServer, type Client } from './helpers.js'

/**
 * A CMS that can lock out its last administrator is unrecoverable without
 * database access, so most of this file is about the guards rather than CRUD.
 */
let root: Client

beforeAll(startServer)
afterAll(stopServer)

beforeEach(async () => {
  await resetUsers()
  root = client()
  await root.signIn()
})

describe('provisioning', () => {
  it('returns a working one-time password when none was supplied', async () => {
    const created = await root.post('/users', {
      name: 'Priya Editor',
      email: 'Priya@Example.com',
    })

    expect(created.status).toBe(201)
    expect(created.body.temporaryPassword).toBeTruthy()
    // Normalised, so sign-in is unambiguous.
    expect(created.body.email).toBe('priya@example.com')

    const signedIn = client()
    await expect(
      signedIn.signIn('priya@example.com', created.body.temporaryPassword),
    ).resolves.toBeTruthy()
  })

  it('never returns a password hash', async () => {
    await root.post('/users', { name: 'Hidden', email: 'hidden@example.com' })
    const list = await root.get('/users')
    expect(JSON.stringify(list.body)).not.toMatch(/argon2|password_hash|passwordHash/)
  })

  it('rejects a duplicate email regardless of case', async () => {
    await root.post('/users', { name: 'First', email: 'dup@example.com' })
    const second = await root.post('/users', { name: 'Second', email: 'DUP@example.com' })
    expect(second.status).toBe(422)
    expect(second.body.fieldErrors?.email).toBeTruthy()
  })
})

describe('one role', () => {
  it('assigns admin without being asked', async () => {
    // The CMS form has no role picker, so the server decides.
    const created = await root.post('/users', { name: 'Implicit', email: 'implicit@example.com' })
    expect(created.body.role).toBe('admin')
  })

  it('refuses a role that no longer exists', async () => {
    const res = await root.post('/users', {
      name: 'Old Role',
      email: 'old-role@example.com',
      role: 'editor',
    })
    expect(res.status).toBe(422)
  })
})

describe('the last account', () => {
  async function rootId(): Promise<string> {
    const me = await root.get('/auth/me')
    return me.body.userId
  }

  it('cannot be deactivated', async () => {
    const res = await root.patch(`/users/${await rootId()}`, { active: false })
    expect(res.status).toBe(400)
  })

  it('cannot delete their own account', async () => {
    const res = await root.delete('/users', { ids: [await rootId()] })
    expect(res.status).toBe(400)
  })

  it('cannot be emptied by deleting everyone at once', async () => {
    const second = await root.post('/users', {
      name: 'Second',
      email: 'second@example.com',
      password: 'SecondPassword1',
    })

    const other = client()
    await other.signIn('second@example.com', 'SecondPassword1')

    // Counted as a set: deleting both would otherwise let each look like the
    // survivor of the other.
    const wipe = await other.delete('/users', { ids: [await rootId(), second.body.id] })
    expect(wipe.status).toBe(400)
  })

  it('allows removing a spare account', async () => {
    const spare = await root.post('/users', {
      name: 'Spare',
      email: 'spare@example.com',
      password: 'SparePassword1',
    })

    expect((await root.delete('/users', { ids: [spare.body.id] })).status).toBe(204)
  })
})

describe('sessions follow the account', () => {
  it('ends immediately when the user is deactivated', async () => {
    const created = await root.post('/users', {
      name: 'Temp',
      email: 'temp@example.com',
      password: 'TempPassword1',
    })

    const user = client()
    await user.signIn('temp@example.com', 'TempPassword1')
    expect((await user.get('/auth/me')).status).toBe(200)

    await root.patch(`/users/${created.body.id}`, { active: false })
    // A "deactivated" user who keeps working until their cookie expires is the
    // opposite of what the button says.
    expect((await user.get('/auth/me')).status).toBe(401)
  })

  it('ends when the password is rotated', async () => {
    const created = await root.post('/users', {
      name: 'Rotate',
      email: 'rotate@example.com',
      password: 'FirstPassword1',
    })

    const user = client()
    await user.signIn('rotate@example.com', 'FirstPassword1')

    await root.patch(`/users/${created.body.id}`, { password: 'SecondPassword2' })
    expect((await user.get('/auth/me')).status).toBe(401)

    const again = client()
    await expect(again.signIn('rotate@example.com', 'SecondPassword2')).resolves.toBeTruthy()
  })
})
