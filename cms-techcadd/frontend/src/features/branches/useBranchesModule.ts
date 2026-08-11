import { branchesApi, facultyApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const branchModuleHooks = createResourceHooks('branches', branchesApi)
export const facultyRefHooks = createResourceHooks('faculty', facultyApi)
