import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/admin/login-form"
import { readSession } from "@/lib/admin-auth"

/** Reads the session cookie, so it can never be prerendered or cached. */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
}

export default async function LoginPage() {
  // Someone who is already signed in has no business on this page — sending
  // them to the dashboard is what a bookmarked /admin/login should do.
  if (await readSession()) redirect("/admin")

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-line bg-white p-8 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)]">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-600 uppercase">
            techcadd
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Dashboard sign-in
          </h1>
          <p className="mt-2 mb-7 text-sm text-muted">
            Enquiries, call requests and form activity for techcadd.com.
          </p>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          This area is private. Credentials are set in the site&apos;s environment
          file.
        </p>
      </div>
    </main>
  )
}
