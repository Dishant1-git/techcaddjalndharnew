"use client"

import { useState } from "react"

/**
 * Answers are ReactNode rather than string so a Server Component can hand in
 * already-rendered content — course pages pass <RichText>, which turns course
 * keywords into internal links. A plain string still satisfies this.
 */
export type AccordionItem = {
  /** Also the identity key, so it must be unique within a list. */
  question: string
  answer: React.ReactNode
  /** Optional mono chip before the question — module numbers, for instance. */
  badge?: string
}

/**
 * Single-open accordion. Answers stay mounted and collapse via a 0fr→1fr grid
 * row, so the height animates without measuring anything in JS and the text
 * remains in the document for search and screen readers.
 *
 * With `columns={2}` the items are split into two *independent* stacks rather
 * than flowed through one grid. In a two-column grid the left and right cards
 * share a row, so opening either one grows that row and shoves the other
 * column's next item down — the columns visibly drag each other about. Two
 * separate flex stacks let each side move on its own.
 */
export function FaqAccordion({
  items,
  columns = 1,
  className = "",
}: {
  items: readonly AccordionItem[]
  columns?: 1 | 2
  className?: string
}) {
  // Keyed by question, not index: the index would shift meaning if the lanes
  // were ever rebalanced.
  const [open, setOpen] = useState<string | null>(items[0]?.question ?? null)

  const split = Math.ceil(items.length / 2)
  const lanes =
    columns === 2 ? [items.slice(0, split), items.slice(split)] : [items]

  return (
    <div
      className={`${
        columns === 2
          ? "grid items-start gap-4 lg:grid-cols-2 lg:gap-5"
          : "flex flex-col"
      } ${className}`}
    >
      {lanes.map((lane, laneIndex) => (
        <div key={laneIndex} className="flex flex-col gap-3 lg:gap-4">
          {lane.map((faq, i) => {
            const id = `faq-${laneIndex}-${i}`
            const isOpen = open === faq.question

            return (
              <Panel
                key={faq.question}
                id={id}
                faq={faq}
                isOpen={isOpen}
                onToggle={() => setOpen(isOpen ? null : faq.question)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Panel({
  id,
  faq,
  isOpen,
  onToggle,
}: {
  id: string
  faq: AccordionItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`rounded-2xl border transition-colors duration-300 ${
        isOpen
          ? "border-transparent bg-subtle"
          : "border-line bg-white hover:border-foreground/20"
      }`}
    >
      <h3>
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="flex w-full items-center gap-4 px-6 py-5 text-left lg:gap-5 lg:px-7"
        >
          {faq.badge && (
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl font-mono text-xs font-semibold transition-colors duration-300 ${
                isOpen
                  ? "bg-brand-600 text-white"
                  : "bg-brand-600/10 text-brand-600"
              }`}
            >
              {faq.badge}
            </span>
          )}
          <span className="flex-1 text-base font-medium tracking-tight text-foreground lg:text-[1.0625rem]">
            {faq.question}
          </span>
          <Toggle isOpen={isOpen} />
        </button>
      </h3>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 text-sm leading-relaxed text-muted lg:px-7 lg:text-[0.9375rem]">
            {faq.answer}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Plus that becomes a minus: only the vertical stroke collapses. */
function Toggle({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
        isOpen ? "bg-foreground text-white" : "bg-foreground/[0.06] text-foreground"
      }`}
    >
      <span className="absolute h-px w-3.5 bg-current" />
      <span
        className={`absolute h-3.5 w-px bg-current transition-transform duration-300 ${
          isOpen ? "scale-y-0" : "scale-y-100"
        }`}
      />
    </span>
  )
}
