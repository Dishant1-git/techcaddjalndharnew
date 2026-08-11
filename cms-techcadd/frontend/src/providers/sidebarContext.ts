import { createContext, useContext } from 'react'

export interface SidebarContextValue {
  collapsed: boolean
  toggleCollapsed(): void
}

/**
 * Shared so the sticky form footer can match the rail width. It previously
 * hardcoded a padding that broke whenever the sidebar was collapsed.
 */
export const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggleCollapsed: () => undefined,
})

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext)
}

export const SIDEBAR_STORAGE_KEY = 'techcadd-cms:sidebar-collapsed'
