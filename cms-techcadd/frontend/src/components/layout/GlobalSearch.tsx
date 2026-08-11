import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, FileText, Inbox, Newspaper, Search, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { fetchSearch, type SearchGroup } from '../../api/resources/dashboard'
import { useDebounce } from '../../hooks/useDebounce'
import { cn } from '../../lib/cn'
import { Spinner } from '../feedback/Spinner'

interface Hit {
  id: string
  label: string
  detail?: string
  to: string
}

interface HitGroup {
  key: string
  label: string
  icon: LucideIcon
  hits: Hit[]
}

interface GroupMeta {
  label: string
  icon: LucideIcon
  to: (id: string) => string
}

/** Where each group's hits link to, and how they are labelled. */
const GROUP_META: Record<SearchGroup['key'], GroupMeta> = {
  courses: { label: 'Courses', icon: BookOpen, to: (id) => `/courses/${id}/edit` },
  blogs: { label: 'Blogs', icon: Newspaper, to: (id) => `/blogs/${id}/edit` },
  pages: { label: 'Pages', icon: FileText, to: (id) => `/pages/${id}/edit` },
  faculty: { label: 'Faculty', icon: Users, to: (id) => `/faculty/${id}/edit` },
  // Enquiries open in a drawer on the list page, not at their own route.
  enquiries: { label: 'Enquiries', icon: Inbox, to: () => '/enquiries' },
}

/**
 * One request across every searchable table.
 *
 * This used to fan out to five list endpoints and merge the results here;
 * the server does the same work in one round trip.
 */
async function searchEverything(term: string): Promise<HitGroup[]> {
  const { groups } = await fetchSearch(term)

  return groups.map((group) => {
    const meta = GROUP_META[group.key]
    return {
      key: group.key,
      label: meta.label,
      icon: meta.icon,
      hits: group.hits.map((hit) => ({
        id: hit.id,
        label: hit.label,
        detail: hit.detail,
        to: meta.to(hit.id),
      })),
    }
  })
}

export function GlobalSearch({ className }: { className?: string }) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const debounced = useDebounce(term, 300)

  const query = useQuery({
    queryKey: ['global-search', debounced],
    queryFn: () => searchEverything(debounced),
    enabled: debounced.trim().length >= 2,
  })

  const groups = useMemo(() => query.data ?? [], [query.data])
  const flat = useMemo(() => groups.flatMap((group) => group.hits), [groups])

  // Cmd/Ctrl+K focuses search from anywhere.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  function go(hit: Hit) {
    navigate(hit.to)
    setOpen(false)
    setTerm('')
    inputRef.current?.blur()
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (flat.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % flat.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + flat.length) % flat.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const hit = flat[activeIndex]
      if (hit) go(hit)
    }
  }

  const showPanel = open && debounced.trim().length >= 2
  let runningIndex = -1

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Search
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-label="Search courses, blogs, pages, faculty and enquiries"
        placeholder="Search courses, blogs, enquiries…"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value)
          setActiveIndex(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-14 pl-9 text-sm text-slate-700 transition-colors placeholder:text-slate-400 hover:bg-white focus:bg-white"
      />

      <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:block">
        ⌘K
      </kbd>

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          {query.isLoading ? (
            <p className="flex items-center gap-2 px-3 py-6 text-sm text-slate-500">
              <Spinner />
              Searching…
            </p>
          ) : groups.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              Nothing matches “{debounced}”.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.key} className="mb-1 last:mb-0">
                <p className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  <group.icon size={12} aria-hidden="true" />
                  {group.label}
                </p>

                {group.hits.map((hit) => {
                  runningIndex += 1
                  const isActive = runningIndex === activeIndex

                  return (
                    <button
                      key={hit.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => go(hit)}
                      className={cn(
                        'flex w-full items-baseline gap-2 rounded-lg px-3 py-2 text-left text-sm',
                        isActive ? 'bg-primary-50 text-primary-900' : 'text-slate-700 hover:bg-slate-50',
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate font-medium">{hit.label}</span>
                      {hit.detail && (
                        <span className="shrink-0 text-xs text-slate-400">{hit.detail}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
