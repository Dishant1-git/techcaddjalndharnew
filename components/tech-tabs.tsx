"use client"

import { Children, useState, type ReactNode } from "react"

/**
 * Tab controller for the technology orbit.
 *
 * Panels arrive as `children` from a Server Component, so the ~90 brand SVG
 * paths stay in the HTML payload and never reach the client bundle. This
 * component only decides which panel is visible.
 */
export function TechTabs({
  labels,
  children,
}: {
  labels: string[]
  children: ReactNode
}) {
  const [active, setActive] = useState(0)
  const panels = Children.toArray(children)

  return (
    <>
      <div className="-mx-6 mb-14 overflow-x-auto px-6 pb-2 lg:mx-0 lg:px-0">
        <div
          role="tablist"
          aria-label="Technology categories"
          className="mx-auto flex w-max gap-1 rounded-full border border-line/80 bg-white/70 p-1.5 backdrop-blur-sm"
        >
          {labels.map((label, i) => (
            <button
              key={label}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`tech-panel-${i}`}
              onClick={() => setActive(i)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                i === active
                  ? "bg-brand-600 text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.7)]"
                  : "text-muted hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Only the selected panel's contents are rendered — see the matching
          note in CapabilityTabs. Seven orbits in the document at once, six of
          them hidden, was the single largest block of markup on the homepage.
          The wrapper still renders for every tab so `aria-controls` resolves. */}
      {panels.map((panel, i) => (
        <div
          key={i}
          id={`tech-panel-${i}`}
          role="tabpanel"
          hidden={i !== active}
          className={i === active ? "animate-fade-in" : undefined}
        >
          {i === active && panel}
        </div>
      ))}
    </>
  )
}
