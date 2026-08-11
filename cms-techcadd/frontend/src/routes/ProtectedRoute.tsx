import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Spinner } from '../components/feedback/Spinner'
import { useAuth } from '../hooks/useAuth'

/**
 * Gate for everything inside the admin shell. Unauthenticated visitors are sent
 * to sign in with a `next` param so they land where they were headed.
 */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  // The session is resolved over the network, so redirecting while that request
  // is still open would bounce a signed-in user to the login screen on every
  // refresh. Hold the route until the answer arrives.
  if (status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas">
        <span className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner />
          Checking your session…
        </span>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return <Outlet />
}
