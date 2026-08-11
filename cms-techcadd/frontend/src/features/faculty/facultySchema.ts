import { z } from 'zod'

const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const facultySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(80, 'Keep names under 80 characters.'),
  photo: mediaRefSchema.nullish(),
  designation: z.string().min(1, 'Designation is required.'),
  qualifications: z.string(),
  expertise: z.array(z.string()),
  experienceYears: z
    .number('Years of experience is required.')
    .min(0, 'Experience cannot be negative.')
    .max(60, 'That looks too high — check the value.'),
  bio: z.string(),
  branchId: z.string().optional(),
  email: z.union([z.email('Enter a valid email address.'), z.literal('')]).optional(),
  social: z.object({
    linkedin: z.string().optional(),
    x: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
  }),
  order: z.number(),
  status: z.enum(['published', 'draft', 'review']),
})

export type FacultyFormValues = z.infer<typeof facultySchema>

export function emptyFaculty(order = 0): FacultyFormValues {
  return {
    name: '',
    photo: undefined,
    designation: '',
    qualifications: '',
    expertise: [],
    experienceYears: 0,
    bio: '',
    branchId: undefined,
    email: '',
    social: {},
    order,
    status: 'published',
  }
}
