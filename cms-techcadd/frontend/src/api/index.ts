/**
 * The swap point.
 *
 * Every resource below is backed by the Express API through `./http/resource`,
 * which builds the five `Resource<T>` methods from a base path. Nothing outside
 * this directory knows where the data comes from — the contract in `./types` is
 * what the features are written against, which is why the cut over from the
 * localStorage mock in `./mock` touched only these files.
 */
export { bannersApi } from './resources/banners'
export { blogsApi } from './resources/blogs'
export { categoriesApi } from './resources/categories'
export { coursesApi } from './resources/courses'
export { enquiriesApi } from './resources/enquiries'
export { galleryApi } from './resources/gallery'
export { mediaApi } from './resources/media'
export { pagesApi } from './resources/pages'
export { redirectsApi } from './resources/redirects'
export { testimonialsApi } from './resources/testimonials'
export { faqsApi } from './resources/faqs'
export { reviewsApi } from './resources/reviews'
export { usersApi } from './resources/users'
export { settingsApi } from './resources/settings'

export { ApiError, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from './types'
export type { ListParams, ListResult, Resource, SortDirection } from './types'

export { configureMockBehaviour, getMockBehaviour } from './mock/latency'
export { resetDatabase } from './mock/store'
