import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'

import { config, isProduction, loginAttemptLimit } from '../../config.js'
import { send } from '../../mail/mailer.js'
import { passwordResetEmail } from '../../mail/templates.js'
import { asyncHandler, unauthorised } from '../../http/errors.js'
import { requireAuth, SESSION_COOKIE } from '../../middleware/auth.js'
import * as auth from './auth.service.js'

export const authRouter = Router()

/** Slows credential stuffing. Keyed by IP; add per-account limiting behind it. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: loginAttemptLimit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Try again in a few minutes.' },
})

const cookieOptions = {
  httpOnly: true, // unreadable from JavaScript, so XSS cannot steal the session
  secure: isProduction, // HTTPS only in production
  sameSite: 'lax' as const, // blocks the common CSRF shapes
  signed: true,
  maxAge: config.SESSION_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
}

const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your email or username.'),
  password: z.string().min(1, 'Enter your password.'),
})

authRouter.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { identifier, password } = loginSchema.parse(req.body)
    const { sessionId, user } = await auth.login(identifier, password, req.get('user-agent'))

    res.cookie(SESSION_COOKIE, sessionId, cookieOptions)
    res.json(user)
  }),
)

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    if (req.signedCookies?.[SESSION_COOKIE]) {
      await auth.logout(req.signedCookies[SESSION_COOKIE] as string)
    }
    res.clearCookie(SESSION_COOKIE, { ...cookieOptions, maxAge: undefined })
    res.status(204).end()
  }),
)

/** Called on app boot to restore the session. 401 simply means "signed out". */
authRouter.get('/me', (req, res) => {
  if (!req.user) throw unauthorised()
  res.json(req.user)
})

const emailSchema = z.object({ email: z.email('Enter a valid email address.') })

authRouter.post(
  '/forgot-password',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-7' }),
  asyncHandler(async (req, res) => {
    const { email } = emailSchema.parse(req.body)
    const token = await auth.requestPasswordReset(email)

    // Sent, not returned. The token must never appear in a response body — the
    // whole point is that only whoever controls the mailbox can use it. With no
    // SMTP server configured the mailer logs the message instead, so local
    // development still works.
    if (token) await send(passwordResetEmail(email, token))

    // Always 204, even for unknown addresses — see auth.service.
    res.status(204).end()
  }),
)

const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v), 'Mix uppercase and lowercase letters.')
  .refine((v) => /\d/.test(v), 'Include at least one number.')

authRouter.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const body = z.object({ token: z.string().min(1), password: passwordSchema }).parse(req.body)
    await auth.resetPassword(body.token, body.password)
    res.status(204).end()
  }),
)

authRouter.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({ currentPassword: z.string().min(1), newPassword: passwordSchema })
      .parse(req.body)

    await auth.changePassword(
      req.user!.userId,
      body.currentPassword,
      body.newPassword,
      req.sessionId!,
    )
    res.status(204).end()
  }),
)
