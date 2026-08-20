import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'

import { AuthBackground } from './AuthBackground'
import { BrandLogo } from './BrandLogo'

interface AuthLayoutProps {
  /**
   * Page title. Omit it on the sign-in screen, where the logo itself is the
   * heading — every page still ends up with exactly one `h1`.
   */
  title?: string
  description?: string
  children: ReactNode
  /** Secondary link row beneath the card, e.g. "Back to sign in". */
  footer?: ReactNode
  /** The reassurance line under the form. Sign-in only. */
  secure?: boolean
}

/** Shared shell for every signed-out page, so they cannot drift apart. */
export function AuthLayout({ title, description, children, footer, secure }: AuthLayoutProps) {
  const brand = (
    <span className="flex items-center justify-center gap-2">
      <BrandLogo height="h-5" />
      <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-primary-700 uppercase">
        CMS
      </span>
    </span>
  )

  return (
    <div className="relative min-h-dvh">
      <AuthBackground />

      <main className="flex min-h-dvh items-center justify-center px-5 py-24 sm:px-6">
        <div className="w-full max-w-100">
          {/* Glass card: high white opacity so it reads white rather than grey
              over the dark backdrop, with a soft top highlight for depth. */}
          <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/97 p-6 shadow-[0_28px_80px_-20px_rgb(6_10_35/0.7)] backdrop-blur-2xl sm:p-7">
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent"
              aria-hidden="true"
            />

            <header className="text-center">
              {title ? (
                <>
                  {brand}
                  <h1 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                    {title}
                  </h1>
                </>
              ) : (
                <h1>{brand}</h1>
              )}

              {description && (
                <p className="mt-2 text-[13px] text-slate-500">{description}</p>
              )}
            </header>

            <div className="mt-7">{children}</div>

            {secure && (
              <p className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-slate-400">
                <ShieldCheck size={13} className="text-emerald-500" aria-hidden="true" />
                Secured admin area
              </p>
            )}
          </div>

          {footer && <div className="mt-5 text-center text-[13px] text-white/70">{footer}</div>}

          {/* Outside the card so it reads as page furniture, not form content. */}
          <p className="mt-5 text-center text-[13px] text-white/40">
            © 2026 techcadd. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}
