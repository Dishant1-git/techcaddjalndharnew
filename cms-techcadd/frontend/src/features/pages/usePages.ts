import { pagesApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const pageHooks = createResourceHooks('pages', pagesApi)
