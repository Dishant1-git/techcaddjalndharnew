import { z } from 'zod'

import type { OpeningHours } from '../../types'

const mediaRefSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const hoursSchema = z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.boolean(),
})

export const branchSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(80),
  code: z
    .string()
    .min(1, 'A short code is required.')
    .regex(/^[A-Z0-9-]+$/, 'Use uppercase letters, numbers and hyphens only.'),
  addressLine1: z.string().min(1, 'Address is required.'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required.'),
  state: z.string().min(1, 'State is required.'),
  // Indian PIN codes are six digits and never start with zero.
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code.'),
  phones: z
    .array(z.string().regex(/^[0-9+\-\s()]{7,18}$/, 'Enter a valid phone number.'))
    .min(1, 'Add at least one phone number.'),
  email: z.union([z.email('Enter a valid email address.'), z.literal('')]).optional(),
  mapEmbedUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  hours: z.array(hoursSchema),
  photos: z.array(mediaRefSchema),
  managerId: z.string().optional(),
  status: z.enum(['published', 'draft', 'review']),
})

export type BranchFormValues = z.infer<typeof branchSchema>

export const DAYS: { value: OpeningHours['day']; label: string }[] = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
]

export function defaultHours(): OpeningHours[] {
  return DAYS.map(({ value }) => ({
    day: value,
    open: '09:00',
    close: '18:00',
    closed: value === 'sun',
  }))
}

export function emptyBranch(): BranchFormValues {
  return {
    name: '',
    code: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phones: [''],
    email: '',
    mapEmbedUrl: '',
    latitude: undefined,
    longitude: undefined,
    hours: defaultHours(),
    photos: [],
    managerId: undefined,
    status: 'published',
  }
}
