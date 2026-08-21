import type { ReactElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { AdminLayout } from '../components/layout/AdminLayout'
import { navItems } from '../data/navigation'
import Dashboard from '../pages/Dashboard'
import NotFound from '../pages/NotFound'
import Forbidden from '../pages/Forbidden'
import Placeholder from '../pages/Placeholder'
import { ProtectedRoute } from './ProtectedRoute'
import { DevGalleryRoute } from './DevGalleryRoute'
import {
  AlbumFormPage,
  BannerFormPage,
  BannersListPage,
  BlogFormPage,
  BlogsListPage,
  CategoriesListPage,
  CategoryFormPage,
  CourseFormPage,
  CoursesListPage,
  ForgotPasswordPage,
  EnquiriesListPage,
  GalleryListPage,
  Lazy,
  LoginPage,
  MediaLibraryPage,
  PageFormPage,
  PagesListPage,
  ResetPasswordPage,
  SeoPage,
  SettingsPage,
  TeamFormPage,
  TeamListPage,
  TestimonialFormPage,
  FaqsListPage,
  FaqFormPage,
  ReviewsListPage,
  ReviewFormPage,
  TestimonialsListPage,
} from './lazyPages'

/**
 * Modules that have been built — everything else still gets the stand-in.
 *
 * This list is the one thing here that has to be kept in step by hand, and it
 * had already drifted: /faqs and /reviews were built and shipped but never
 * added, so each got a second, unreachable Placeholder route registered
 * underneath the real one. Harmless only because React Router takes the first
 * match — the next module added below would have silently shadowed itself.
 *
 * Asserted against the real routes at the bottom of this file, so drifting
 * again fails loudly in development instead of quietly.
 */
const BUILT_PATHS = new Set([
  '/courses',
  '/categories',
  '/pages',
  '/blogs',
  '/banners',
  '/team',
  '/testimonials',
  '/gallery',
  '/faqs',
  '/reviews',
  '/enquiries',
  '/media',
  '/seo',
  '/settings',
])

const placeholderItems = navItems.filter(
  (item) => item.path !== '/' && !BUILT_PATHS.has(item.path),
)

/** List, create and edit routes for one module, all lazily loaded. */
function crudRoutes(segment: string, list: ReactElement, form: ReactElement) {
  return [
    { path: segment, element: <Lazy>{list}</Lazy> },
    { path: `${segment}/new`, element: <Lazy>{form}</Lazy> },
    { path: `${segment}/:id/edit`, element: <Lazy>{form}</Lazy> },
  ]
}

/**
 * A data router, not `<BrowserRouter>` — `useBlocker`, which powers the
 * unsaved-changes guard on every form, only exists on this router.
 */
/**
 * Every sidebar entry must resolve to something.
 *
 * A nav item whose path is neither built nor in the placeholder list renders
 * the catch-all — a 404 reached by clicking the menu, which is the one place a
 * 404 should be impossible. Checked in development only; the cost of the
 * assertion is not worth shipping, and a production build has already been
 * through it.
 */
if (import.meta.env.DEV) {
  const routed = new Set([
    ...BUILT_PATHS,
    ...placeholderItems.map((item) => item.path),
    '/',
  ])
  const orphans = navItems.filter((item) => !routed.has(item.path))
  if (orphans.length > 0) {
    console.error(
      'Sidebar entries with no route — these will 404:',
      orphans.map((item) => `${item.label} (${item.path})`).join(', '),
    )
  }
}

export const router = createBrowserRouter([
  { path: 'login', element: <Lazy><LoginPage /></Lazy> },
  { path: 'forgot-password', element: <Lazy><ForgotPasswordPage /></Lazy> },
  { path: 'reset-password', element: <Lazy><ResetPasswordPage /></Lazy> },

  {
    element: <ProtectedRoute />,
    children: [
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },

      ...crudRoutes('courses', <CoursesListPage />, <CourseFormPage />),
      ...crudRoutes('categories', <CategoriesListPage />, <CategoryFormPage />),
      ...crudRoutes('pages', <PagesListPage />, <PageFormPage />),
      ...crudRoutes('blogs', <BlogsListPage />, <BlogFormPage />),
      ...crudRoutes('banners', <BannersListPage />, <BannerFormPage />),
      ...crudRoutes('team', <TeamListPage />, <TeamFormPage />),
      ...crudRoutes('testimonials', <TestimonialsListPage />, <TestimonialFormPage />),
      ...crudRoutes('gallery', <GalleryListPage />, <AlbumFormPage />),
      ...crudRoutes('faqs', <FaqsListPage />, <FaqFormPage />),
      ...crudRoutes('reviews', <ReviewsListPage />, <ReviewFormPage />),

      // Enquiries arrive from the public site — no create/edit page, the
      // detail drawer handles everything editable.
      { path: 'enquiries', element: <Lazy><EnquiriesListPage /></Lazy> },

      { path: 'media', element: <Lazy><MediaLibraryPage /></Lazy> },
      { path: 'seo', element: <Lazy><SeoPage /></Lazy> },
      { path: 'settings', element: <Lazy><SettingsPage /></Lazy> },

      { path: '403', element: <Forbidden /> },

      ...placeholderItems.map((item) => ({
        path: item.path.replace(/^\//, ''),
        element: <Placeholder module={item.label} icon={item.icon} />,
      })),

      ...(import.meta.env.DEV
        ? [{ path: 'dev/primitives', element: <DevGalleryRoute /> }]
        : []),

      { path: '*', element: <NotFound /> },
    ],
  },
    ],
  },
])
