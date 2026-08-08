"use client"

import { useEffect, useRef, useState } from "react"
import { Logo } from "./logo"
import { CONTACT, NAV_ITEMS, QUICK_LINKS, type NavItem } from "@/lib/navigation"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpenMenu(null)
      setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // A small grace period keeps the mega menu open while the pointer
  // travels from the trigger down into the panel.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 transition-all duration-500">
      <nav
        onMouseLeave={scheduleClose}
        className={`mx-auto transition-all duration-500 ${
          scrolled
            ? "mt-3 max-w-[1240px] rounded-full border border-line/80 bg-white/75 shadow-[0_8px_40px_-16px_rgba(15,23,42,0.28)] backdrop-blur-xl"
            : "mt-0 max-w-[1400px] border border-transparent bg-transparent"
        }`}
      >
        <div
          className={`flex items-center justify-between px-3 transition-all duration-500 sm:px-5 lg:px-8 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <Logo compact={scrolled} />

          {/* --- Desktop links --- */}
          <div className="hidden items-center gap-7 xl:flex">
            {NAV_ITEMS.map((item) => (
              <DesktopNavLink
                key={item.label}
                item={item}
                open={openMenu === item.label}
                onOpen={() => {
                  cancelClose()
                  setOpenMenu(item.groups ? item.label : null)
                }}
              />
            ))}
          </div>

          {/* --- Desktop actions --- */}
          <div className="hidden items-center gap-4 xl:flex">
            <a
              href={CONTACT.phoneHref}
              className="font-mono text-sm text-muted transition-colors duration-300 hover:text-foreground"
            >
              {CONTACT.phone}
            </a>
            <a
              href="/enquiry"
              className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all duration-500 hover:bg-brand-600"
            >
              Enroll now
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="relative z-50 p-2 xl:hidden"
          >
            <span className="sr-only">Menu</span>
            <span className="flex h-6 w-6 flex-col items-center justify-center gap-1.5">
              <span
                className={`block h-px w-6 bg-foreground transition-all duration-300 ${
                  mobileOpen ? "translate-y-[3.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-6 bg-foreground transition-all duration-300 ${
                  mobileOpen ? "-translate-y-[3.5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <MegaMenu
          item={NAV_ITEMS.find((i) => i.label === openMenu) ?? null}
          onEnter={cancelClose}
          onLeave={scheduleClose}
        />
      </nav>

      {/* --- Mobile full-screen menu --- */}
      <div
        className={`fixed inset-0 z-40 bg-background transition-all duration-500 xl:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 pt-24 pb-8 sm:px-8">
          <div className="flex flex-1 flex-col justify-center gap-1">
            {NAV_ITEMS.map((item, i) => (
              <div key={item.label} className="border-b border-foreground/5">
                {item.groups ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSection((v) =>
                          v === item.label ? null : item.label,
                        )
                      }
                      className="flex w-full items-center justify-between py-4 text-left font-display text-3xl tracking-tight transition-colors duration-300 hover:text-brand-600 sm:text-4xl"
                      style={{ transitionDelay: `${i * 40}ms` }}
                    >
                      {item.label}
                      <span
                        className={`font-mono text-base text-muted transition-transform duration-300 ${
                          mobileSection === item.label ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {mobileSection === item.label && (
                      <div className="animate-menu-in grid grid-cols-2 gap-x-6 gap-y-2 pb-6">
                        {item.groups.flatMap((g) => g.items).map((c) => (
                          <a
                            key={c.href}
                            href={c.href}
                            className="text-sm text-muted transition-colors hover:text-brand-600"
                          >
                            {c.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    className="block py-4 font-display text-3xl tracking-tight transition-colors duration-300 hover:text-brand-600 sm:text-4xl"
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-foreground/10 pt-6">
            {QUICK_LINKS.map((q) => (
              <a
                key={q.href}
                href={q.href}
                className="font-mono text-xs tracking-wide text-muted uppercase transition-colors hover:text-foreground"
              >
                {q.label}
              </a>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <a
              href={CONTACT.phoneHref}
              className="flex h-14 flex-1 items-center justify-center rounded-full border border-foreground/20 text-base font-medium transition-colors hover:bg-foreground/5"
            >
              Call us
            </a>
            <a
              href="/enquiry"
              className="flex h-14 flex-1 items-center justify-center rounded-full bg-foreground text-base font-medium text-background transition-colors hover:bg-brand-600"
            >
              Enroll now
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

function DesktopNavLink({
  item,
  open,
  onOpen,
}: {
  item: NavItem
  open: boolean
  onOpen: () => void
}) {
  return (
    <a
      href={item.href}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      aria-expanded={item.groups ? open : undefined}
      className={`group relative text-sm transition-colors duration-300 ${
        open ? "text-foreground" : "text-foreground/70 hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-1.5">
        {item.label}
        {item.groups && (
          <svg
            viewBox="0 0 12 12"
            className={`size-2.5 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m2.5 4.5 3.5 3.5 3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 group-hover:w-full ${
          open ? "w-full" : "w-0"
        }`}
      />
    </a>
  )
}

function MegaMenu({
  item,
  onEnter,
  onLeave,
}: {
  item: NavItem | null
  onEnter: () => void
  onLeave: () => void
}) {
  if (!item?.groups) return null

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="animate-menu-in absolute inset-x-0 top-full hidden px-3 pt-2 xl:block"
    >
      <div className="mx-auto max-w-[1240px] overflow-hidden rounded-3xl border border-line/80 bg-white/90 shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-8 p-8">
          {item.groups.map((group) => (
            <div key={group.title}>
              <div className="mb-4 border-b border-foreground/10 pb-3">
                <span className="font-mono text-xs text-muted">{group.index}</span>
                <h3 className="mt-1 font-display text-lg tracking-tight">
                  {group.title}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  {group.blurb}
                </p>
              </div>
              <ul className="space-y-1.5">
                {group.items.map((c) => (
                  <li key={c.href}>
                    <a
                      href={c.href}
                      className="group/link flex items-center gap-2 text-sm text-foreground/70 transition-colors duration-200 hover:text-brand-600"
                    >
                      <span className="h-px w-0 bg-brand-600 transition-all duration-300 group-hover/link:w-3" />
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-foreground/10 bg-subtle px-8 py-4">
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {QUICK_LINKS.map((q) => (
              <a
                key={q.href}
                href={q.href}
                className="font-mono text-xs tracking-wide text-muted uppercase transition-colors hover:text-foreground"
              >
                {q.label}
              </a>
            ))}
          </div>
          <a
            href="/courses"
            className="group/all inline-flex items-center gap-2 text-sm font-medium text-brand-600"
          >
            Browse all courses
            <span className="transition-transform duration-300 group-hover/all:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
