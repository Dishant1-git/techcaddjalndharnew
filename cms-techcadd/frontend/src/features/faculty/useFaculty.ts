import { branchesApi, facultyApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const facultyHooks = createResourceHooks('faculty', facultyApi)
export const branchHooks = createResourceHooks('branches', branchesApi)
