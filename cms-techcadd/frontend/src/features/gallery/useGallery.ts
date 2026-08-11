import { galleryApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const galleryHooks = createResourceHooks('galleryAlbums', galleryApi)
