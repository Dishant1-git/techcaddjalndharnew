import {
  BookOpen,
  FileText,
  Folder,
  GalleryVerticalEnd,
  Image,
  LayoutDashboard,
  MessageSquareQuote,
  Newspaper,
  Search,
  Settings,
  Images,
  CircleHelp,
  Star,
  Users,
  Mail,
} from 'lucide-react'

import type { NavSection } from '../types'

/**
 * Single source of truth for the sidebar, the routes and the header title.
 * Adding a module here wires it into all three.
 */
export const navSections: NavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard }],
  },
  {
    id: 'content',
    title: 'Content',
    items: [
      { id: 'courses', label: 'Courses', path: '/courses', icon: BookOpen },
      { id: 'categories', label: 'Categories', path: '/categories', icon: Folder },
      { id: 'pages', label: 'Pages', path: '/pages', icon: FileText },
      { id: 'banners', label: 'Banners', path: '/banners', icon: GalleryVerticalEnd },
      { id: 'blogs', label: 'Blogs', path: '/blogs', icon: Newspaper },
      { id: 'faqs', label: 'FAQ', path: '/faqs', icon: CircleHelp },
    ],
  },
  {
    id: 'institute',
    title: 'Institute',
    items: [
      { id: 'testimonials', label: 'Testimonials', path: '/testimonials', icon: MessageSquareQuote },
      { id: 'gallery', label: 'Gallery', path: '/gallery', icon: Image },
      { id: 'reviews', label: 'Reviews', path: '/reviews', icon: Star },
    ],
  },
  {
    id: 'engagement',
    title: 'Engagement',
    items: [{ id: 'enquiries', label: 'Enquiries', path: '/enquiries', icon: Mail }],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      // The people who sign in and publish. Formerly a "Faculty" content
      // module describing trainers the website never rendered; what the office
      // actually needed was accounts, not biographies.
      { id: 'team', label: 'Team', path: '/team', icon: Users },
      { id: 'media', label: 'Media Library', path: '/media', icon: Images },
      { id: 'seo', label: 'SEO', path: '/seo', icon: Search },
      { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
]

/** Flattened nav items — handy for route generation and title lookups. */
export const navItems = navSections.flatMap((section) => section.items)

/** Resolves the page title shown in the header for a given pathname. */
export function getPageTitle(pathname: string): string {
  const exact = navItems.find((item) => item.path === pathname)
  if (exact) return exact.label

  // Nested routes (/courses/new, /courses/:id/edit) inherit their module title.
  // Longest match wins so a future /courses/archive/x picks the deeper entry.
  const parent = navItems
    .filter((item) => item.path !== '/' && pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]

  return parent?.label ?? 'Not Found'
}
