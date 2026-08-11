"use client"

import { Children, useState, type ReactNode } from "react"

/**
 * Rail-and-panel tab controller for the capabilities section.
 *
 * Panels arrive as `children` from a Server Component, so the ~70 brand SVG
 * paths stay in the HTML payload and never reach the client bundle — the same
 * split TechTabs uses. This component only decides which panel is visible.
 *
 * The rail is a vertical list from `lg` up and a horizontally scrolling row of
 * pills below it, where a 260px column would eat the screen.
 */
export function CapabilityTabs({
  labels,
  blurbs,
  children,
}: {
  labels: string[]
  blurbs: string[]
  children: ReactNode
}) {
  const [active, setActive] = useState(0)
  const panels = Children.toArray(children)

  return (
    <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-6">
      <div
        role="tablist"
        aria-label="Capabilities"
        className="-mx-2 flex gap-1 overflow-x-auto px-2 pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:rounded-3xl lg:border lg:border-white/25 lg:p-3 lg:pb-3"
      >
        {labels.map((label, i) => {
          const selected = i === active
          return (
            <button
              key={label}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`capability-panel-${i}`}
              onClick={() => setActive(i)}
              className={`flex shrink-0 items-center justify-between gap-3 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-300 lg:rounded-xl lg:py-4 lg:text-base lg:whitespace-normal ${
                selected
                  ? "bg-white text-brand-700 lg:bg-white/12 lg:text-white"
                  : "bg-white/10 text-white/55 hover:text-white lg:bg-transparent lg:hover:bg-white/8"
              }`}
            >
              <span className="text-left">{label}</span>
              {/* The arrow marks the selection on desktop, where the rail has
                  no pill background to do it. */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={`hidden size-5 shrink-0 transition-all duration-300 lg:block ${
                  selected ? "opacity-100" : "-translate-x-2 opacity-0"
                }`}
              >
                <path
                  d="M5 12h14m-7-7 7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )
        })}
      </div>

      <div className="rounded-3xl bg-linear-to-br from-white/15 to-white/5 p-4 sm:p-6">
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-white/75">
          {blurbs[active]}
        </p>

        {panels.map((panel, i) => (
          <div
            key={i}
            id={`capability-panel-${i}`}
            role="tabpanel"
            hidden={i !== active}
            className={i === active ? "animate-fade-in" : undefined}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  )
}
