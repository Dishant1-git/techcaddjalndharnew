import {
  FilePlus2,
  GraduationCap,
  Mail,
  MapPinPlus,
  PenSquare,
  UserPlus,
} from 'lucide-react'

import type { QuickAction, WebsiteStatus } from '../types'

/**
 * Structural dashboard configuration.
 *
 * Every record-shaped export has moved to `src/api` — the dashboard reads live
 * counts through `features/dashboard/useDashboard`. What is left here describes
 * the UI itself, not content, so it is not data that could go stale.
 */

/** Navigation shortcuts. */
export const quickActions: QuickAction[] = [
  {
    id: 'add-course',
    label: 'Add Course',
    description: 'Publish a new program',
    icon: GraduationCap,
    path: '/courses/new',
  },
  {
    id: 'add-blog',
    label: 'Add Blog',
    description: 'Write an article',
    icon: PenSquare,
    path: '/blogs/new',
  },
  {
    id: 'add-faculty',
    label: 'Add Faculty',
    description: 'Create a trainer profile',
    icon: UserPlus,
    path: '/faculty/new',
  },
  {
    id: 'add-branch',
    label: 'Add Branch',
    description: 'Register a new centre',
    icon: MapPinPlus,
    path: '/branches/new',
  },
  {
    id: 'create-page',
    label: 'Create Page',
    description: 'Build a landing page',
    icon: FilePlus2,
    path: '/pages/new',
  },
  {
    id: 'view-enquiries',
    label: 'View Enquiries',
    description: 'Track incoming leads',
    icon: Mail,
    path: '/enquiries',
  },
]

/**
 * No uptime monitoring exists, so this reports only what is knowable: the CMS
 * is reachable. `uptime` stays unset rather than inventing a percentage.
 */
export const websiteStatus: WebsiteStatus = {
  label: 'Website Status',
  state: 'online',
  detail: 'All systems operational',
}
