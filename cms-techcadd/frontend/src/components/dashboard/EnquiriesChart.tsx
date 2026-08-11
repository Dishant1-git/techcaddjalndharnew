import { useState } from 'react'
import { BarChart3 } from 'lucide-react'

import { useEnquiryTrend } from '../../features/dashboard/useDashboard'
import { cn } from '../../lib/cn'
import { Card, CardBody, CardHeader } from '../common/Card'
import { EmptyState } from '../common/EmptyState'

/** Rounds the axis maximum up to the next multiple of `step`. */
function axisMax(values: number[], step = 20): number {
  return Math.ceil(Math.max(...values) / step) * step
}

export function EnquiriesChart() {
  const [hovered, setHovered] = useState<number | null>(null)
  const { data, isLoading } = useEnquiryTrend()
  const enquiryTrend = data ?? []

  const values = enquiryTrend.map((point) => point.value)
  const total = values.reduce((sum, value) => sum + value, 0)

  if (isLoading || values.length === 0 || total === 0) {
    return (
      <Card flush className="flex h-full flex-col">
        <CardHeader title="Enquiries — last 7 days" subtitle="No enquiries recorded yet" />
        <EmptyState
          className="flex-1"
          icon={BarChart3}
          title="Nothing to chart yet"
          description="Daily enquiry volume will appear here once enquiries start coming in."
        />
      </Card>
    )
  }

  const max = axisMax(values)
  const peakIndex = values.indexOf(Math.max(...values))
  const ticks = [max, max * 0.75, max * 0.5, max * 0.25, 0]

  return (
    <Card flush className="flex h-full flex-col">
      <CardHeader
        title="Enquiries — last 7 days"
        subtitle={`${total} enquiries received this week`}
      />

      <CardBody className="flex flex-1 flex-col">
        <figure className="m-0 flex flex-1 flex-col">
          {/* The plot is decorative for assistive tech — the table below carries the data. */}
          <div className="relative flex-1 pl-8" aria-hidden="true">
            {/* Recessive gridlines + y-axis ticks */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {ticks.map((tick) => (
                // Zero-height rows so each line lands exactly on its value,
                // with the last one sitting on the bar baseline.
                <div key={tick} className="flex h-0 items-center gap-2">
                  <span className="w-6 shrink-0 text-right text-[10px] leading-none text-slate-400">
                    {tick}
                  </span>
                  {/* The baseline reads slightly stronger than the gridlines. */}
                  <span className={cn('h-px flex-1', tick === 0 ? 'bg-slate-200' : 'bg-slate-100')} />
                </div>
              ))}
            </div>

            <div className="relative flex h-44 items-end gap-2 sm:gap-3">
              {enquiryTrend.map((point, index) => {
                const height = (point.value / max) * 100
                const isHovered = hovered === index

                return (
                  <div
                    key={point.label}
                    className="relative flex h-full flex-1 flex-col justify-end"
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Direct label on the peak day only. */}
                    {index === peakIndex && !isHovered && (
                      <span className="mb-1 text-center text-[11px] font-semibold text-slate-700">
                        {point.value}
                      </span>
                    )}

                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center whitespace-nowrap shadow-lg">
                        <span className="block text-[11px] font-semibold text-white">
                          {point.value} enquiries
                        </span>
                        <span className="block text-[10px] text-slate-300">{point.fullLabel}</span>
                      </div>
                    )}

                    <div
                      className={cn(
                        'mx-auto w-full max-w-14 rounded-t-sm transition-colors',
                        isHovered ? 'bg-primary-600' : 'bg-primary-500',
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* x-axis */}
          <div className="mt-2 flex gap-2 pl-8 sm:gap-3" aria-hidden="true">
            {enquiryTrend.map((point) => (
              <span key={point.label} className="flex-1 text-center text-[11px] text-slate-400">
                {point.label}
              </span>
            ))}
          </div>

          <figcaption className="sr-only">
            Enquiries received per day over the last seven days
          </figcaption>

          {/* Accessible equivalent of the plot.

              The wrapper carries `sr-only`, not the table: a table ignores the
              utility's `width: 1px` and expands to fit its content, and because
              the utility also positions it absolutely it pushed the page 33px
              wide at 360px. A div honours the width and clips as intended. */}
          <div className="sr-only">
          <table>
            <caption>Enquiries received per day over the last seven days</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Enquiries</th>
              </tr>
            </thead>
            <tbody>
              {enquiryTrend.map((point) => (
                <tr key={point.label}>
                  <th scope="row">{point.fullLabel}</th>
                  <td>{point.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </figure>
      </CardBody>
    </Card>
  )
}
