import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'

import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-xl bg-rose-50 text-rose-600">
        <SearchX size={26} aria-hidden="true" />
      </span>

      <p className="mt-4 text-sm font-semibold tracking-widest text-slate-400">ERROR 404</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-900">Page not found</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        The page you are looking for does not exist or has been moved to another module.
      </p>

      <Link to="/" className="mt-6 inline-block">
        <Button icon={Home}>Back to Dashboard</Button>
      </Link>
    </Card>
  )
}
