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
      role: 'editor',
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

describe('role escalation', () => {
  async function makeAdmin(): Promise<Client> {
    await root.post('/users', {
      name: 'Amit Admin',
      email: 'amit@example.com',
      role: 'admin',
      password: 'AdminPassword1',
    })
    const admin = client()
    await admin.signIn('amit@example.com', 'AdminPassword1')
    return admin
  }

  it('stops an admin minting a super admin', async () => {
    const admin = await makeAdmin()
    const res = await admin.post('/users', {
      name: 'Sneaky',
      email: 'sneaky@example.com',
      role: 'super-admin',
    })
    expect(res.status).toBe(403)
  })

  it('stops an admin editing a super admin', async () => {
    const admin = await makeAdmin()
    const list = await root.get('/users?role=super-admin')
    const superAdminId = list.body.items[0].id

    const res = await admin.patch(`/users/${superAdminId}`, { name: 'Renamed' })
    expect(res.status).toBe(403)
  })
})

describe('the last super admin', () => {
  async function rootId(): Promise<string> {
    const me = await root.get('/auth/me')
    return me.body.userId
  }

  it('cannot be demoted', async () => {
    const res = await root.patch(`/users/${await rootId()}`, { role: 'admin' })
    expect(res.status).toBe(400)
  })

  it('cannot be deactivated', async () => {
    const res = await root.patch(`/users/${await rootId()}`, { active: false })
    expect(res.status).toBe(400)
  })

  it('cannot delete their own account', async () => {
    const res = await root.delete('/users', { ids: [await rootId()] })
    expect(res.status).toBe(400)
  })

  it('can step down once another one exists', async () => {
    await root.post('/users', {
      name: 'Second Root',
      email: 'second@example.com',
      role: 'super-admin',
      password: 'SecondRoot1',
    })

    const demoted = await root.patch(`/users/${await rootId()}`, { role: 'admin' })
    expect(demoted.status).toBe(200)
    expect(demoted.body.role).toBe('admin')

    // And cannot climb back on its own — that is the whole point of the gate.
    const selfRestore = await root.patch(`/users/${await rootId()}`, { role: 'super-admin' })
    expect(selfRestore.status).toBe(403)
  })
})

describe('sessions follow the account', () => {
  it('ends immediately when the user is deactivated', async () => {
    const created = await root.post('/users', {
      name: 'Temp',
      email: 'temp@example.com',
      role: 'editor',
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
      role: 'editor',
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
