import { coursesApi, enquiriesApi, usersApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const enquiryHooks = createResourceHooks('enquiries', enquiriesApi)
export const courseRefHooks = createResourceHooks('courses', coursesApi)
export const userRefHooks = createResourceHooks('users', usersApi)
