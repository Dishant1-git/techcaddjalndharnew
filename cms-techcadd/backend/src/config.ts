import 'dotenv/config'
import { z } from 'zod'

/**
 * Environment is validated once, at boot. A missing database password should
 * stop the process immediately with a clear message, not surface as a confusing
 * connection error on the first request.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1),

  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET must be at least 16 characters.'),
  SESSION_DAYS: z.coerce.number().int().positive().default(7),

  /**
   * Sign-in attempts allowed per IP per 15 minutes.
   *
   * Left unset it resolves per environment below: tight in production, where
   * the limit is a defence against credential stuffing, and loose in
   * development, where the only thing it throttles is the people building and
   * testing the CMS.
   */
  LOGIN_ATTEMPTS_PER_15_MIN: z.coerce.number().int().positive().optional(),

  /** Where uploaded files are written. Relative paths resolve from the API's working directory. */
  UPLOAD_DIR: z.string().min(1).default('uploads'),
  /** Largest single upload accepted, in megabytes. */
  MAX_UPLOAD_MB: z.coerce.number().positive().default(10),

  /**
   * SMTP, all optional.
   *
   * Without a host the CMS still runs and mail is logged instead of sent, so a
   * developer never needs a mail server to work on anything else.
   */
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().default('techcadd CMS <no-reply@techcadd.com>'),

  /**
   * Where to tell the website that content changed.
   *
   * Both optional: without them the CMS runs exactly as before and the site
   * picks changes up when its own cache expires. Set them and a publish shows
   * on the site straight away instead of waiting out that window.
   */
  SITE_REVALIDATE_URL: z.string().optional(),
  REVALIDATE_SECRET: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration:')
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  }
  console.error('\nCopy .env.example to .env and fill it in.')
  process.exit(1)
}

export const config = parsed.data
export const isProduction = config.NODE_ENV === 'production'

/** Explicit setting wins; otherwise tight in production, loose in development. */
export const loginAttemptLimit =
  config.LOGIN_ATTEMPTS_PER_15_MIN ?? (isProduction ? 10 : 200)
