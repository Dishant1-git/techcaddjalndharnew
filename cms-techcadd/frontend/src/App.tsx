import { RouterProvider } from 'react-router-dom'

import { TooltipProvider } from './components/common/Tooltip'
import { ErrorBoundary } from './components/feedback/ErrorBoundary'
import { ToastViewport } from './components/feedback/Toast'
import { AuthProvider } from './providers/AuthProvider'
import { ConfirmProvider } from './providers/ConfirmProvider'
import { QueryProvider } from './providers/QueryProvider'
import { ToastProvider } from './providers/ToastProvider'
import { router } from './routes/router'

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        {/* Auth sits inside Query so logout can clear the cache. */}
        <AuthProvider>
          <ToastProvider>
            <TooltipProvider>
              <ConfirmProvider>
                <RouterProvider router={router} />
                <ToastViewport />
              </ConfirmProvider>
            </TooltipProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
