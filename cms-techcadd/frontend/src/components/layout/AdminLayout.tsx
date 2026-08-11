import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { getPageTitle } from '../../data/navigation'
import { cn } from '../../lib/cn'
import { SIDEBAR_STORAGE_KEY, SidebarContext } from '../../providers/sidebarContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function AdminLayout() {
  const { pathname } = useLocation()
  // Restored on load — the rail used to reset to expanded on every refresh.
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      const next = !value
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {
        // A full or blocked store just means the choice is not remembered.
      }
      return next
    })
  }, [])

  // Escape closes the drawer, and the page behind it must not scroll.
  useEffect(() => {
    if (!mobileOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // No effect closes the drawer on navigation — `SidebarLink` already calls
  // `onCloseMobile` when a destination is chosen.

  const sidebarValue = useMemo(() => ({ collapsed, toggleCollapsed }), [collapsed, toggleCollapsed])

  return (
    <SidebarContext.Provider value={sidebarValue}>
      <div className="min-h-screen bg-canvas">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to content
        </a>

        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          className={cn(
            'flex min-h-screen flex-col transition-[padding] duration-200 ease-out',
            collapsed ? 'lg:pl-20' : 'lg:pl-64',
          )}
        >
          <Header
            title={getPageTitle(pathname)}
            collapsed={collapsed}
            onOpenMobileSidebar={() => setMobileOpen(true)}
            onToggleCollapse={toggleCollapsed}
          />

          <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
