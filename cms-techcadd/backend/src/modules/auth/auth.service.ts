import { createHash, randomBytes, randomUUID } from 'node:crypto'
import argon2 from 'argon2'

import { config } from '../../config.js'
import { execute, query, queryOne } from '../../db/pool.js'
import { forbidden, unauthorised, unprocessable } from '../../http/errors.js'

/** The CMS has a single role: an admin can do everything. */
export type UserRole = 'admin'

export interface SessionUser {
  userId: string
  name: string
  email: string
  role: UserRole
}

interface UserRow {
  id: string
  name: string
  email: string
  password_hash: string
  role: UserRole
  active: 0 | 1
}

/** argon2id with sensible cost. Never store or log a plaintext password. */
export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2 })
}

async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain)
  } catch {
    // A malformed stored hash must read as "wrong password", never as a crash.
    return false
  }
}

export async function login(
  identifier: string,
  password: string,
  userAgent?: string,
): Promise<{ sessionId: string; user: SessionUser }> {
  const user = await queryOne<UserRow>(
    'SELECT id, name, email, password_hash, role, active FROM users WHERE email = ? LIMIT 1',
    [identifier.trim().toLowerCase()],
  )

  // Hash a dummy password when the user is missing so the response takes about
  // the same time either way — otherwise timing alone reveals which addresses
  // are registered.
  const ok = user
    ? await verifyPassword(user.password_hash, password)
    : await verifyPassword('$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$0000000000000000000000000000000000000000000', password)

  // One message for both cases, for the same reason.
  if (!user || !ok) throw unauthorised('That email and password combination is not recognised.')

  if (!user.active) {
    throw forbidden('This account has been deactivated. Ask another administrator to restore it.')
  }

  const sessionId = randomUUID()
  await execute(
    `INSERT INTO sessions (id, user_id, expires_at, user_agent, created_at)
     VALUES (?, ?, DATE_ADD(NOW(3), INTERVAL ? DAY), ?, NOW(3))`,
    [sessionId, user.id, config.SESSION_DAYS, userAgent?.slice(0, 255) ?? null],
  )

  return {
    sessionId,
    user: { userId: user.id, name: user.name, email: user.email, role: user.role },
  }
}

export async function resolveSession(sessionId: string): Promise<SessionUser | undefined> {
  return queryOne<SessionUser>(
    `SELECT u.id AS userId, u.name, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > NOW(3) AND u.active = 1
      LIMIT 1`,
    [sessionId],
  )
}

export async function logout(sessionId: string): Promise<void> {
  await execute('DELETE FROM sessions WHERE id = ?', [sessionId])
}

/** Removes every session for a user — used after a password change. */
async function revokeAllSessions(userId: string): Promise<void> {
  await execute('DELETE FROM sessions WHERE user_id = ?', [userId])
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

/**
 * Always resolves, whether or not the address exists. Returning an error for
 * unknown emails would turn this endpoint into an account-enumeration oracle.
 * The returned token is only for the caller to email — never store it raw.
 */
export async function requestPasswordReset(email: string): Promise<string | undefined> {
  const user = await queryOne<{ id: string }>(
    'SELECT id FROM users WHERE email = ? AND active = 1 LIMIT 1',
    [email.trim().toLowerCase()],
  )
  if (!user) return undefined

  const token = randomBytes(32).toString('hex')
  await execute(
    `INSERT INTO password_resets (token_hash, user_id, expires_at, created_at)
     VALUES (?, ?, DATE_ADD(NOW(3), INTERVAL 1 HOUR), NOW(3))`,
    [hashToken(token), user.id],
  )

  return token
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const row = await queryOne<{ user_id: string }>(
    `SELECT user_id FROM password_resets
      WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW(3)
      LIMIT 1`,
    [hashToken(token)],
  )
  if (!row) throw unauthorised('This reset link is invalid or has expired.')

  await execute('UPDATE users SET password_hash = ?, updated_at = NOW(3) WHERE id = ?', [
    await hashPassword(newPassword),
    row.user_id,
  ])
  await execute('UPDATE password_resets SET used_at = NOW(3) WHERE token_hash = ?', [
    hashToken(token),
  ])

  // Anyone already signed in with the old password is signed out.
  await revokeAllSessions(row.user_id)
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  keepSessionId: string,
): Promise<void> {
  const user = await queryOne<UserRow>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId])
  if (!user) throw unauthorised()

  if (!(await verifyPassword(user.password_hash, currentPassword))) {
    throw unprocessable({ currentPassword: 'Your current password is not correct.' })
  }

  await execute('UPDATE users SET password_hash = ?, updated_at = NOW(3) WHERE id = ?', [
    await hashPassword(newPassword),
    userId,
  ])

  // Drop other devices but keep the caller signed in.
  await execute('DELETE FROM sessions WHERE user_id = ? AND id <> ?', [userId, keepSessionId])
}

/** Housekeeping — call from a scheduled job. */
export async function purgeExpired(): Promise<number> {
  const before = await query<{ n: number }>('SELECT COUNT(*) AS n FROM sessions')
  await execute('DELETE FROM sessions WHERE expires_at <= NOW(3)')
  await execute('DELETE FROM password_resets WHERE expires_at <= NOW(3)')
  const after = await query<{ n: number }>('SELECT COUNT(*) AS n FROM sessions')
  return (before[0]?.n ?? 0) - (after[0]?.n ?? 0)
}
