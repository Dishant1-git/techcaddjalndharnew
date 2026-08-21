import { usersApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

/**
 * The people who sign in to this CMS.
 *
 * Backed by /users, which has existed since the beginning and had no interface
 * — accounts could only be created by someone with database access. This is
 * that interface.
 */
export const teamHooks = createResourceHooks('users', usersApi)
