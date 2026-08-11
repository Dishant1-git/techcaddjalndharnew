import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon } from 'lucide-react'

import { Button } from '../common/Button'
import { Card } from '../common/Card'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Rendered instead of the default panel when provided. */
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // No error-reporting service is wired up yet; the console is the only sink.
    if (import.meta.env.DEV) {
      console.error('Unhandled error:', error, info.componentStack)
    }
  }

  reset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) return this.props.fallback(error, this.reset)

    return (
      <div className="grid min-h-screen place-items-center bg-canvas p-4">
        <Card className="max-w-lg p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <AlertOctagon size={26} aria-hidden="true" />
          </span>

          <h1 className="mt-4 text-xl font-semibold text-slate-900">Something went wrong</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            An unexpected error stopped this page from rendering. Trying again often clears it.
          </p>

          {import.meta.env.DEV && (
            <pre className="scrollbar-slim mt-4 max-h-40 overflow-auto rounded-lg bg-slate-900 p-3 text-left text-xs text-slate-200">
              {error.message}
            </pre>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={this.reset}>Try again</Button>
            <Button variant="secondary" onClick={() => (window.location.href = '/')}>
              Back to dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }
}
