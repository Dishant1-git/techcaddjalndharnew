import { bannersApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const bannerHooks = createResourceHooks('banners', bannersApi)
