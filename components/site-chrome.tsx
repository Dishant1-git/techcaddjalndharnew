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
 *
 * /preview is the CMS's live preview pane. It keeps the navbar and footer,
 * because those are part of the page an editor is trying to judge, but drops
 * anything that interrupts: a brand preloader that replays on every keystroke,
 * a cookie bar over the content being reviewed, an enquiry popup asking the
 * editor to book a demo.
 */
export function SiteChrome({
  children,
  /**
   * Furniture that demands attention rather than framing the page. Hidden in
   * the preview pane as well as on /admin.
   */
  interruptive = false,
}: {
  children: React.ReactNode
  interruptive?: boolean
}) {
  const pathname = usePathname()

  if (pathname?.startsWith("/admin")) return null
  if (interruptive && pathname?.startsWith("/preview")) return null

  return <>{children}</>
}
