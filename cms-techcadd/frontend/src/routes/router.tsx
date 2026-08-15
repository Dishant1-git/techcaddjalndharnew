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
  BranchesListPage,
  BranchFormPage,
  BlogFormPage,
  BlogsListPage,
  CategoriesListPage,
  CategoryFormPage,
  CourseFormPage,
  CoursesListPage,
  ForgotPasswordPage,
  EnquiriesListPage,
  FacultyFormPage,
  FacultyListPage,
  GalleryListPage,
  Lazy,
  LoginPage,
  MediaLibraryPage,
  PageFormPage,
  PagesListPage,
  ResetPasswordPage,
  SeoPage,
  SettingsPage,
  TestimonialFormPage,
  FaqsListPage,
  FaqFormPage,
  ReviewsListPage,
  ReviewFormPage,
  TestimonialsListPage,
} from './lazyPages'

/** Modules that have been built — everything else still gets the stand-in. */
const BUILT_PATHS = new Set([
  '/courses',
  '/categories',
  '/pages',
  '/blogs',
  '/banners',
  '/faculty',
  '/branches',
  '/testimonials',
  '/gallery',
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
      ...crudRoutes('faculty', <FacultyListPage />, <FacultyFormPage />),
      ...crudRoutes('branches', <BranchesListPage />, <BranchFormPage />),
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
