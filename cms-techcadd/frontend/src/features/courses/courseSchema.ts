import { z } from 'zod'

import {
  CONTENT_BLOCK_TYPES,
  contentBlockFields,
  requireBlockContent,
} from '../shared/contentBlockSchema'

const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const seoSchema = z.object({
  metaTitle: z.string().max(60, 'Keep meta titles under 60 characters.').optional(),
  metaDescription: z.string().max(160, 'Keep meta descriptions under 160 characters.').optional(),
  keywords: z.array(z.string()),
  ogImage: mediaRefSchema.nullish(),
  canonicalUrl: z.string().optional(),
})

const syllabusModuleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Module title is required.'),
  topics: z.array(z.string()),
  hours: z.number().min(0).optional(),
})

/**
 * Block kinds a course page offers.
 *
 * The shared list minus 'blogs': a course page already closes with its own
 * related-courses strip, and a second list of unrelated posts in the middle of
 * a syllabus is not something an editor should be offered.
 */
export const SECTION_TYPES = CONTENT_BLOCK_TYPES.filter((t) => t.value !== 'blogs')

/**
 * The generated sections of the course page, in the order they render.
 *
 * `hideable` is false for the three that are structural — the hero carries the
 * title and the facts, and the CTA and enquiry form are how the page converts.
 * A block can still be anchored to them.
 */
export const PAGE_SECTIONS = [
  { id: 'hero', label: 'Hero', hideable: false },
  { id: 'overview', label: 'Overview & video', hideable: true },
  { id: 'who-can-do', label: 'Who can do this', hideable: true },
  { id: 'why-this-program', label: 'The case for it', hideable: true },
  { id: 'modules', label: 'Modules by duration', hideable: true },
  { id: 'what-you-will-learn', label: 'What you will learn', hideable: true },
  { id: 'tools', label: 'Tools', hideable: true },
  { id: 'outcomes', label: 'Future scope', hideable: true },
  { id: 'projects', label: 'Hands-on projects', hideable: true },
  { id: 'why-techcadd', label: 'Why techcadd', hideable: true },
  { id: 'reviews', label: 'Reviews', hideable: true },
  { id: 'faqs', label: 'FAQs', hideable: true },
  { id: 'cta', label: 'Call to action', hideable: false },
  { id: 'enquiry', label: 'Enquiry form', hideable: false },
] as const

const SECTION_ANCHORS = PAGE_SECTIONS.map((s) => s.id)

/**
 * A course block: the shared block, plus where on the page it sits.
 *
 * The fields and the per-kind rules come from features/shared, so a block on
 * a course and a block on a page validate identically — same link rule, same
 * "this kind needs that field" messages. Only the anchoring is particular to
 * courses, because only a course positions a block against a generated
 * section.
 */
export const courseSectionSchema = z
  .object({
    ...contentBlockFields,
    type: z.enum(['rich-text', 'image', 'video', 'cta']),
    anchor: z.enum(SECTION_ANCHORS as unknown as [string, ...string[]]),
    placement: z.enum(['before', 'after']),
  })
  .superRefine(requireBlockContent)

export type CourseSectionValues = z.infer<typeof courseSectionSchema>

export const courseSchema = z
  .object({
    title: z.string().min(1, 'Title is required.').max(120, 'Keep titles under 120 characters.'),
    slug: z
      .string()
      .min(1, 'Slug is required.')
      .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
    categoryId: z.string().optional(),
    segment: z.enum(['courses', 'internship-training', 'after-12th-courses']),
    tagline: z.string().max(300).optional(),
    demand: z.string().optional(),
    careers: z.array(z.string()),
    tools: z.array(z.string()),
    salary: z.string().max(120).optional(),
    shortDescription: z
      .string()
      .min(1, 'A short description is required.')
      .max(200, 'Keep this under 200 characters.'),
    description: z.string(),
    duration: z.string().min(1, 'Duration is required.'),
    // '' means "not stated". A course nobody has graded should say nothing on
    // its page rather than claim a level, so the facts strip keeps the
    // segment's generic wording until someone decides.
    level: z.union([z.enum(['beginner', 'intermediate', 'advanced']), z.literal('')]),
    mode: z.union([z.enum(['online', 'offline', 'hybrid']), z.literal('')]),
    thumbnail: mediaRefSchema.nullish(),
    syllabus: z.array(syllabusModuleSchema),
    highlights: z.array(z.string()),
    eligibility: z.string().optional(),
    certification: z.string().optional(),
    /** Overrides the generated overview. One paragraph per line. */
    overview: z.string().optional(),
    videoUrl: z.string().max(500).optional(),
    videoTitle: z.string().max(200).optional(),
    hiddenSections: z.array(z.string()),
    sections: z.array(courseSectionSchema),
    featured: z.boolean(),
    seo: seoSchema,
    status: z.enum(['published', 'draft', 'review']),
  })


export type CourseFormValues = z.infer<typeof courseSchema>

export function emptyCourse(): CourseFormValues {
  return {
    title: '',
    slug: '',
    categoryId: undefined,
    segment: 'courses',
    tagline: '',
    demand: '',
    careers: [],
    tools: [],
    salary: '',
    shortDescription: '',
    description: '',
    duration: '',
    level: '',
    mode: '',
    thumbnail: undefined,
    syllabus: [],
    highlights: [],
    eligibility: '',
    certification: '',
    overview: '',
    videoUrl: '',
    videoTitle: '',
    hiddenSections: [],
    sections: [],
    featured: false,
    seo: { keywords: [] },
    status: 'draft',
  }
}

export const LEVEL_OPTIONS = [
  { value: '', label: 'Not stated' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const MODE_OPTIONS = [
  { value: '', label: 'Not stated' },
  { value: 'offline', label: 'Offline' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
]
