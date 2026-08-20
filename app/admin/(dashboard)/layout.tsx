import Link from "next/link"
import { redirect } from "next/navigation"
import { adminDisplayName, readSession } from "@/lib/admin-auth"

/**
 * The signed-in shell.
 *
 * The guard lives here rather than in middleware on purpose. Middleware runs
 * on the Edge runtime, where `node:crypto` — which verifies the session
 * signature — is not available; a check there could only look for the presence
 * of a cookie, which is not a check at all. Every route in this group is a
 * server component, so the real verification runs before anything renders.
 */
export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await readSession()
  if (!session) redirect("/admin/login")

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-600 uppercase">
              techcadd
            </p>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Enquiry dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-muted sm:block">
              Signed in as{" "}
              <span className="font-medium text-foreground">{adminDisplayName()}</span>
            </p>

            <Link
              href="/"
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-subtle"
            >
              View site
            </Link>

            {/* A form, not a fetch: signing out is the one action that has to
                work even if this page's JavaScript never loaded. */}
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-subtle"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
