import type { Metadata } from "next"

/**
 * Everything under /admin, signed in or not.
 *
 * Its only job is the metadata: this is private, so it must never be indexed
 * and must never be the thing a search engine offers someone looking for the
 * courses page. app/robots.ts disallows the path as well — that is the polite
 * request, and this is the instruction that travels with the page itself.
 *
 * The sign-in guard is deliberately not here. /admin/login lives under this
 * layout too, and a guard at this level would redirect the login page to
 * itself; it sits in the (dashboard) group instead, which is exactly the set
 * of routes that require a session.
 */
export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-subtle">{children}</div>
}
