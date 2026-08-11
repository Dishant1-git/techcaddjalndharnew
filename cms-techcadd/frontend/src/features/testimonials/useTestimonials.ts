import { coursesApi, testimonialsApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const testimonialHooks = createResourceHooks('testimonials', testimonialsApi)
export const courseRefHooks = createResourceHooks('courses', coursesApi)
