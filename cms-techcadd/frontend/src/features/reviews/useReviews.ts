import { reviewsApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const reviewHooks = createResourceHooks('reviews', reviewsApi)
