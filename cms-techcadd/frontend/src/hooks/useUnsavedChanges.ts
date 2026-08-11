import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Guards navigation away from a dirty form, both within the app (router
 * blocker) and on tab close (`beforeunload`).
 */
export function useUnsavedChanges(dirty: boolean) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!dirty) return

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault()
      // Browsers show their own copy; the return value only opts in.
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  return blocker
}
