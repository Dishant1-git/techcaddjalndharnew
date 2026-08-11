import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

import { quickActions } from '../../data/mockData'
import { Card, CardBody, CardHeader } from '../common/Card'

export function QuickActions() {
  return (
    <Card flush>
      <CardHeader title="Quick Actions" subtitle="Jump straight into the most common tasks" />
      <CardBody>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <li key={action.id}>
                <Link
                  to={action.path}
                  className="group flex h-full items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-primary-300 hover:bg-primary-50/50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-primary-500 group-hover:text-white">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {action.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {action.description}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-slate-300 transition-colors group-hover:text-primary-500"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </CardBody>
    </Card>
  )
}
