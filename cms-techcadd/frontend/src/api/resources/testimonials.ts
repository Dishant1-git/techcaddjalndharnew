import type { BaseEntity, Testimonial } from '../../types'
import { createHttpResource } from '../http/resource'

export type TestimonialCreate = Omit<Testimonial, keyof BaseEntity>
export type TestimonialUpdate = Partial<TestimonialCreate>

/** Live against the Express API. */
export const testimonialsApi = createHttpResource<
  Testimonial,
  TestimonialCreate,
  TestimonialUpdate
>('/testimonials')
