/**
 * The swap point.
 *
 * Every resource below is currently backed by the localStorage mock in
 * `./mock`. When a real backend lands, re-implement these exports against
 * `./client` — nothing outside this directory needs to change, because the
 * `Resource<T>` contract in `./types` stays the same.
 */
export { bannersApi } from './resources/banners'
export { blogsApi } from './resources/blogs'
export { branchesApi } from './resources/branches'
export { categoriesApi } from './resources/categories'
export { coursesApi } from './resources/courses'
export { enquiriesApi } from './resources/enquiries'
export { facultyApi } from './resources/faculty'
export { galleryApi } from './resources/gallery'
export { mediaApi } from './resources/media'
export { pagesApi } from './resources/pages'
export { redirectsApi } from './resources/redirects'
export { testimonialsApi } from './resources/testimonials'
export { usersApi } from './resources/users'
export { settingsApi } from './resources/settings'

export { ApiError, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from './types'
export type { ListParams, ListResult, Resource, SortDirection } from './types'

export { configureMockBehaviour, getMockBehaviour } from './mock/latency'
export { resetDatabase } from './mock/store'
