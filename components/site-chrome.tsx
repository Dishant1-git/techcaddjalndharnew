"use client"

import { usePathname } from "next/navigation"

/**
 * Hides the public site's furniture on /admin.
 *
 * The navbar, footer, enquiry popup and preloader live in the root layout so
 * they survive client navigations instead of remounting per page. The
 * dashboard is under that same root — App Router layouts always compose — and
 * a marketing navbar, a "Book a demo" popup and a full-screen brand preloader
 * on an internal tool are all wrong.
 *
 * The alternative is a second root layout in a route group, which would mean
 * moving every existing page into a `(site)` folder for the sake of one new
 * route. This is the smaller change, and it keeps the chrome's persistence
 * intact for the pages that want it.
 *
 * `usePathname` renders on the server too, so /admin never sends the navbar's
 * markup and then hides it — it is simply not in the response.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname?.startsWith("/admin")) return null

  return <>{children}</>
}
