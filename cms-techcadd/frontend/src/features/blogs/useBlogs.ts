import { blogsApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const blogHooks = createResourceHooks('blogs', blogsApi)
