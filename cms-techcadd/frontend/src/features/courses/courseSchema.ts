import { z } from 'zod'

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
    fee: z.number('Fee is required.').min(0, 'Fee cannot be negative.'),
    discountedFee: z.number().min(0, 'Discounted fee cannot be negative.').optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    mode: z.enum(['online', 'offline', 'hybrid']),
    thumbnail: mediaRefSchema.nullish(),
    gallery: z.array(mediaRefSchema),
    syllabus: z.array(syllabusModuleSchema),
    highlights: z.array(z.string()),
    eligibility: z.string().optional(),
    certification: z.string().optional(),
    branchIds: z.array(z.string()),
    featured: z.boolean(),
    seo: seoSchema,
    status: z.enum(['published', 'draft', 'review']),
  })
  .superRefine((values, ctx) => {
    // A "discount" above the real price would display as a price increase.
    if (values.discountedFee !== undefined && values.discountedFee > values.fee) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountedFee'],
        message: 'The discounted fee must be lower than the full fee.',
      })
    }
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
    fee: 0,
    discountedFee: undefined,
    level: 'beginner',
    mode: 'offline',
    thumbnail: undefined,
    gallery: [],
    syllabus: [],
    highlights: [],
    eligibility: '',
    certification: '',
    branchIds: [],
    featured: false,
    seo: { keywords: [] },
    status: 'draft',
  }
}

export const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const MODE_OPTIONS = [
  { value: 'offline', label: 'Offline' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
]
