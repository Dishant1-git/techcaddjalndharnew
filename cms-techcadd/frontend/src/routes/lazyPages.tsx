import { lazy, Suspense, type ReactNode } from 'react'

import { SkeletonTable } from '../components/feedback/Skeleton'

// Split per route. Every form page pulls in the rich text editor, which is far
// too large to sit in the initial bundle.
export const CoursesListPage = lazy(() => import('../features/courses/CoursesListPage'))
export const CourseFormPage = lazy(() => import('../features/courses/CourseFormPage'))

export const CategoriesListPage = lazy(() => import('../features/categories/CategoriesListPage'))
export const CategoryFormPage = lazy(() => import('../features/categories/CategoryFormPage'))

export const PagesListPage = lazy(() => import('../features/pages/PagesListPage'))
export const PageFormPage = lazy(() => import('../features/pages/PageFormPage'))

export const BlogsListPage = lazy(() => import('../features/blogs/BlogsListPage'))
export const BlogFormPage = lazy(() => import('../features/blogs/BlogFormPage'))

export const BannersListPage = lazy(() => import('../features/banners/BannersListPage'))
export const BannerFormPage = lazy(() => import('../features/banners/BannerFormPage'))

export const FacultyListPage = lazy(() => import('../features/faculty/FacultyListPage'))
export const FacultyFormPage = lazy(() => import('../features/faculty/FacultyFormPage'))

export const BranchesListPage = lazy(() => import('../features/branches/BranchesListPage'))
export const BranchFormPage = lazy(() => import('../features/branches/BranchFormPage'))

export const TestimonialsListPage = lazy(() => import('../features/testimonials/TestimonialsListPage'))
export const TestimonialFormPage = lazy(() => import('../features/testimonials/TestimonialFormPage'))

export const GalleryListPage = lazy(() => import('../features/gallery/GalleryListPage'))
export const AlbumFormPage = lazy(() => import('../features/gallery/AlbumFormPage'))

export const EnquiriesListPage = lazy(() => import('../features/enquiries/EnquiriesListPage'))

export const MediaLibraryPage = lazy(() => import('../features/media/MediaLibraryPage'))
export const SeoPage = lazy(() => import('../features/seo/SeoPage'))
export const SettingsPage = lazy(() => import('../features/settings/SettingsPage'))

export const LoginPage = lazy(() => import('../features/auth/LoginPage'))
export const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage'))
export const ResetPasswordPage = lazy(() => import('../features/auth/ResetPasswordPage'))

/** Route-level suspense boundary — a skeleton, never a bare spinner. */
export function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<SkeletonTable />}>{children}</Suspense>
}

export const FaqsListPage = lazy(() => import('../features/faqs/FaqsListPage'))
export const FaqFormPage = lazy(() => import('../features/faqs/FaqFormPage'))
export const ReviewsListPage = lazy(() => import('../features/reviews/ReviewsListPage'))
export const ReviewFormPage = lazy(() => import('../features/reviews/ReviewFormPage'))
