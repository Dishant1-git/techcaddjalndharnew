import type { CourseFormValues } from './courseSchema'

/**
 * The shape the website's preview route expects.
 *
 * Mirrors `CourseDraft` in the site's lib/course-preview.ts. It is restated
 * here rather than imported because the two apps are separate builds with no
 * shared package — so this file is the seam, and it is deliberately the only
 * place in the CMS that knows the site's field names.
 */
export interface CoursePreviewDraft {
  title: string
  slug: string
  segment: CourseFormValues['segment']
  categoryName?: string
  tagline?: string
  demand?: string
  careers: string[]
  tools: string[]
  highlights: string[]
  salary?: string
  duration?: string
  fee: number
  discountedFee?: number
  level: string
  mode: string
  overview?: string
  videoUrl?: string
  videoTitle?: string
  hiddenSections: string[]
  sections: CourseFormValues['sections']
}

/**
 * Form state, as the website would read it.
 *
 * The category is sent by name, not id: the site groups courses under the
 * category's label and has no way to resolve an id it never sees.
 */
export function toPreviewDraft(
  values: Partial<CourseFormValues>,
  categoryOptions: { value: string; label: string }[],
): CoursePreviewDraft {
  return {
    title: values.title ?? '',
    slug: values.slug ?? '',
    segment: values.segment ?? 'courses',
    categoryName: categoryOptions.find((c) => c.value === values.categoryId)?.label,
    tagline: values.tagline || undefined,
    demand: values.demand || undefined,
    careers: values.careers ?? [],
    tools: values.tools ?? [],
    highlights: values.highlights ?? [],
    salary: values.salary || undefined,
    duration: values.duration || undefined,
    fee: values.fee ?? 0,
    discountedFee: values.discountedFee,
    level: values.level ?? 'beginner',
    mode: values.mode ?? 'offline',
    overview: values.overview || undefined,
    videoUrl: values.videoUrl || undefined,
    videoTitle: values.videoTitle || undefined,
    hiddenSections: values.hiddenSections ?? [],
    sections: values.sections ?? [],
  }
}

/**
 * The editor's sections, and the part of the rendered page each one drives.
 *
 * `anchor` is the DOM id the website's course template already gives that
 * block, so selecting a section here scrolls the preview to the thing being
 * edited rather than leaving the editor to hunt for it.
 */
export const COURSE_SECTIONS = [
  { id: 'basics', label: 'Basics', anchor: 'hero' },
  { id: 'page-copy', label: 'Page copy', anchor: 'overview' },
  { id: 'curriculum', label: 'Curriculum', anchor: 'modules' },
  { id: 'layout', label: 'Page layout', anchor: 'overview' },
  { id: 'details', label: 'Details', anchor: 'who-can-do' },
  { id: 'media', label: 'Media', anchor: 'hero' },
  { id: 'publishing', label: 'Publishing', anchor: 'cta' },
  { id: 'seo', label: 'SEO', anchor: 'hero' },
] as const

export type CourseSectionId = (typeof COURSE_SECTIONS)[number]['id']
