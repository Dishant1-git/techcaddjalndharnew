import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ApiError } from '../api'

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // An admin tool that re-fetches every time you alt-tab is noise.
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          // Retrying a 404 or a validation failure never succeeds.
          if (error instanceof ApiError && error.status < 500) return false
          return failureCount < 1
        },
      },
      mutations: { retry: false },
    },
  })
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // Created in state so StrictMode's double-render reuses one client.
  const [client] = useState(createQueryClient)

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
