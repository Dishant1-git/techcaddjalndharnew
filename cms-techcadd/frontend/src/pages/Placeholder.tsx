import { Link } from 'react-router-dom'

import { SITE_LABEL } from '../config/brand'
import { ArrowLeft, Construction } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

interface PlaceholderProps {
  /** Module name, e.g. "Courses". */
  module: string
  icon: LucideIcon
}

/** Reusable stand-in for modules that are not built yet. */
export default function Placeholder({ module, icon: Icon }: PlaceholderProps) {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-xl bg-primary-50 text-primary-600">
        <Icon size={26} aria-hidden="true" />
      </span>

      <Badge tone="warning" className="mt-4">
        <Construction size={12} aria-hidden="true" />
        Coming Soon
      </Badge>

      <h2 className="mt-4 text-xl font-semibold text-slate-900">{module}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        The {module} module is under construction. It will let you manage {module.toLowerCase()} for
        the {SITE_LABEL} from this dashboard.
      </p>

      <Link to="/" className="mt-6 inline-block">
        <Button variant="secondary" icon={ArrowLeft}>
          Back to Dashboard
        </Button>
      </Link>
    </Card>
  )
}
