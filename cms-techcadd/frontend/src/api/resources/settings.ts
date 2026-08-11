import type { SiteSettings } from '../../types'
import { request } from '../client'

/**
 * Settings is a singleton, not a collection, so it does not use the generic
 * `Resource` contract — there is nothing to list, create or delete.
 */
export const settingsApi = {
  get(): Promise<SiteSettings> {
    return request<SiteSettings>('/settings')
  },

  /**
   * Only the keys sent are written, and the JSON groups (social,
   * notifications, integrations) are merged rather than replaced — each card
   * on the settings page saves on its own.
   */
  update(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    return request<SiteSettings>('/settings', { method: 'PATCH', body: patch })
  },
}
