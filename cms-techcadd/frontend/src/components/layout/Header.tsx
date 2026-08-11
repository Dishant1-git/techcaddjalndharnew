import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  X,
} from 'lucide-react'

import { Avatar } from '../common/Avatar'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../common/DropdownMenu'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'
import { GlobalSearch } from './GlobalSearch'
import { NotificationsBell } from './NotificationsBell'

interface HeaderProps {
  title: string
  collapsed: boolean
  onOpenMobileSidebar: () => void
  onToggleCollapse: () => void
}

export function Header({ title, collapsed, onOpenMobileSidebar, onToggleCollapse }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          aria-controls="cms-sidebar"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          aria-controls="cms-sidebar"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:inline-flex"
        >
          {collapsed ? (
            <PanelLeftOpen size={20} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={20} aria-hidden="true" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{title}</h1>
        </div>

        <GlobalSearch className="hidden md:block md:w-64 lg:w-80" />

        <button
          type="button"
          onClick={() => setMobileSearchOpen((open) => !open)}
          aria-label={mobileSearchOpen ? 'Hide search' : 'Show search'}
          aria-expanded={mobileSearchOpen}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
        >
          {mobileSearchOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Search size={20} aria-hidden="true" />
          )}
        </button>

        <NotificationsBell />
        <ProfileMenu />
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-slate-100 px-4 py-3 md:hidden">
          <GlobalSearch />
        </div>
      )}
    </header>
  )
}

function ProfileMenu() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  if (!session) return null

  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          aria-label="Account menu"
          className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-slate-100"
        >
          <Avatar name={session.name} size="sm" />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-slate-900">{session.name}</span>
            <span className="block text-xs text-slate-500 capitalize">
              {session.role.replace('-', ' ')}
            </span>
          </span>
          <ChevronDown size={16} className={cn('hidden text-slate-400 sm:block')} aria-hidden="true" />
        </button>
      }
    >
      <div className="border-b border-slate-100 px-3 py-2">
        <p className="truncate text-sm font-semibold text-slate-900">{session.name}</p>
        <p className="truncate text-xs text-slate-500">{session.email}</p>
      </div>

      <div className="p-1 pt-1.5">
        <DropdownItem icon={Settings} onSelect={() => navigate('/settings')}>
          Settings
        </DropdownItem>
      </div>

      <DropdownSeparator />

      <DropdownItem
        icon={LogOut}
        tone="danger"
        onSelect={async () => {
          await logout()
          toast.success('Signed out.')
          navigate('/login', { replace: true })
        }}
      >
        Sign out
      </DropdownItem>
    </DropdownMenu>
  )
}
