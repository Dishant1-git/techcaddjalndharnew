import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'

import { navSections } from '../../data/navigation'
import { cn } from '../../lib/cn'
import type { NavItem } from '../../types'
import { BRANCH_NAME, CMS_NAME } from '../../config/brand'
import { Logo, LogoMark } from '../common/Logo'

interface SidebarProps {
  /** Desktop icon-only mode. */
  collapsed: boolean
  /** Mobile drawer visibility. */
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <aside
      id="cms-sidebar"
      aria-label="Main navigation"
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-shell-900 text-slate-300',
        'transition-[transform,width] duration-200 ease-out',
        'w-64',
        collapsed && 'lg:w-20',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <BrandHeader collapsed={collapsed} onCloseMobile={onCloseMobile} />

      <nav className="scrollbar-slim flex-1 overflow-y-auto px-3 pb-4">
        {navSections.map((section) => (
          <div key={section.id} className="mt-5 first:mt-2">
            <p
              className={cn(
                'px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase',
                collapsed && 'lg:sr-only',
              )}
            >
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.id}>
                  <SidebarLink item={item} collapsed={collapsed} onNavigate={onCloseMobile} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <FooterCard collapsed={collapsed} />
    </aside>
  )
}

function BrandHeader({
  collapsed,
  onCloseMobile,
}: {
  collapsed: boolean
  onCloseMobile: () => void
}) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
      {/* Full wordmark, except on desktop when the rail is collapsed. */}
      <NavLink
        to="/"
        aria-label={`${CMS_NAME} — go to dashboard`}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2.5',
          collapsed && 'lg:hidden',
        )}
      >
        <Logo className="h-6 w-auto text-white" />
        {/* Two lines rather than one chip: this CMS runs one branch's site, and
            "CMS" alone was equally true of every other techcadd install. */}
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-[10px] font-semibold tracking-wider text-primary-300 uppercase">
            CMS
          </span>
          <span className="truncate text-[11px] font-medium text-slate-300">
            {BRANCH_NAME}
          </span>
        </span>
      </NavLink>

      {/* Square mark for the collapsed rail. */}
      <NavLink
        to="/"
        aria-label={`${CMS_NAME} — go to dashboard`}
        className={cn('mx-auto hidden text-primary-500', collapsed && 'lg:block')}
      >
        <LogoMark className="size-10" />
      </NavLink>

      <button
        type="button"
        onClick={onCloseMobile}
        aria-label="Close navigation menu"
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

interface SidebarLinkProps {
  item: NavItem
  collapsed: boolean
  /** Dismisses the mobile drawer once a destination is chosen. */
  onNavigate: () => void
}

function SidebarLink({ item, collapsed, onNavigate }: SidebarLinkProps) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          collapsed && 'lg:justify-center lg:px-0',
          isActive
            ? 'bg-primary-500 text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-white',
        )
      }
    >
      <Icon size={18} className="shrink-0" aria-hidden="true" />

      <span className={cn('min-w-0 flex-1 truncate', collapsed && 'lg:hidden')}>{item.label}</span>

      {item.badge !== undefined && (
        <span
          className={cn(
            'rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white',
            collapsed && 'lg:absolute lg:top-1 lg:right-1 lg:px-1.5 lg:py-0',
          )}
        >
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

function FooterCard({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('border-t border-white/10 p-3', collapsed && 'lg:hidden')}>
      <div className="rounded-lg bg-white/5 p-3">
        <p className="text-xs font-semibold text-white">{CMS_NAME}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          Manage courses, enquiries and website content from one place.
        </p>
      </div>
    </div>
  )
}
