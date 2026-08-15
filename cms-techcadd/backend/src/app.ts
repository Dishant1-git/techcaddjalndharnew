import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { config } from './config.js'
import { errorHandler } from './http/errors.js'
import { revalidateSite } from './http/revalidate.js'
import { attachUser } from './middleware/auth.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { bannersRouter } from './modules/banners/banners.routes.js'
import { blogsRouter } from './modules/blogs/blogs.routes.js'
import { branchesRouter } from './modules/branches/branches.routes.js'
import { categoriesRouter } from './modules/categories/categories.routes.js'
import { coursesRouter } from './modules/courses/courses.routes.js'
import { dashboardRouter, searchRouter } from './modules/dashboard/dashboard.routes.js'
import { enquiriesRouter } from './modules/enquiries/enquiries.routes.js'
import { facultyRouter } from './modules/faculty/faculty.routes.js'
import { faqsRouter } from './modules/faqs/faqs.routes.js'
import { galleryRouter } from './modules/gallery/gallery.routes.js'
import { mediaRouter } from './modules/media/media.routes.js'
import { UPLOAD_URL_PREFIX, uploadRoot } from './modules/media/storage.js'
import { pagesRouter } from './modules/pages/pages.routes.js'
import { publicRouter } from './modules/public/public.routes.js'
import { redirectsRouter } from './modules/seo/seo.routes.js'
import { reviewsRouter } from './modules/reviews/reviews.routes.js'
import { settingsRouter } from './modules/settings/settings.routes.js'
import { testimonialsRouter } from './modules/testimonials/testimonials.routes.js'
import { usersRouter } from './modules/users/users.routes.js'

export function createApp() {
  const app = express()

  // Behind a reverse proxy this makes req.ip and Secure cookies behave.
  app.set('trust proxy', 1)

  app.use(helmet())

  // An explicit origin, not '*': browsers refuse to send credentials to a
  // wildcard, and the session cookie is the whole auth mechanism.
  app.use(
    cors({
      origin: config.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  )

  app.use(express.json({ limit: '2mb' }))
  app.use(cookieParser(config.COOKIE_SECRET))

  /**
   * Uploaded files.
   *
   * Served with their own headers rather than inheriting the app's: an SVG is
   * markup, so one uploaded with a <script> inside would run if a browser
   * opened it directly on this origin. The empty CSP stops that, and nosniff
   * stops a mislabelled file being reinterpreted as something executable.
   */
  app.use(
    UPLOAD_URL_PREFIX,
    express.static(uploadRoot, {
      index: false,
      // The stored names are random and immutable, so they can cache hard.
      maxAge: '365d',
      setHeaders: (res) => {
        res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox")
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      },
    }),
  )

  // Resolves req.user when a session cookie is present; never rejects.
  app.use(attachUser)

  // Pings the website's cache after a successful content change. Runs after
  // the response, so it can neither slow a save nor fail one.
  app.use(revalidateSite)

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', env: config.NODE_ENV })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/banners', bannersRouter)
  app.use('/api/blogs', blogsRouter)
  app.use('/api/branches', branchesRouter)
  app.use('/api/categories', categoriesRouter)
  app.use('/api/courses', coursesRouter)
  app.use('/api/dashboard', dashboardRouter)
  app.use('/api/enquiries', enquiriesRouter)
  app.use('/api/faculty', facultyRouter)
  app.use('/api/faqs', faqsRouter)
  app.use('/api/gallery', galleryRouter)
  app.use('/api/media', mediaRouter)
  app.use('/api/pages', pagesRouter)

  // No session required — see the note in public.routes.ts.
  app.use('/api/public', publicRouter)
  app.use('/api/redirects', redirectsRouter)
  app.use('/api/reviews', reviewsRouter)
  app.use('/api/search', searchRouter)
  app.use('/api/settings', settingsRouter)
  app.use('/api/testimonials', testimonialsRouter)
  app.use('/api/users', usersRouter)

  app.use((_req, res) => {
    res.status(404).json({ message: 'Endpoint not found.' })
  })

  // Must be last — Express identifies error middleware by its arity.
  app.use(errorHandler)

  return app
}
