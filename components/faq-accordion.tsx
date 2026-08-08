"use client"

import { useState } from "react"
import type { Faq } from "@/lib/faqs"

/**
 * Single-open accordion. Answers stay mounted and collapse via a 0fr→1fr grid
 * row, so the height animates without measuring anything in JS and the text
 * remains in the document for search and screen readers.
 */
export function FaqAccordion({ items }: { items: readonly Faq[] }) {
  const [open, setOpen] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      {items.map((faq, i) => {
        const isOpen = i === open

        return (
          <div
            key={faq.question}
            className={`rounded-2xl border transition-colors duration-300 ${
              isOpen
                ? "border-transparent bg-subtle"
                : "border-line bg-white hover:border-foreground/20"
            }`}
          >
            <h3>
              <button
                type="button"
                id={`faq-trigger-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center gap-6 px-6 py-5 text-left lg:px-7"
              >
                <span className="flex-1 text-base font-medium tracking-tight text-foreground lg:text-[1.0625rem]">
                  {faq.question}
                </span>
                <Toggle isOpen={isOpen} />
              </button>
            </h3>

            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-sm leading-relaxed text-muted lg:px-7 lg:text-[0.9375rem]">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
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
