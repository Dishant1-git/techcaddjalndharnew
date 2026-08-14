"use client"

import { useState } from "react"
import type { Syllabus, SyllabusModule, SyllabusStage } from "@/lib/course-pages"

/**
 * The syllabus as a duration comparison.
 *
 * Three stage cards state what each enrolment length certifies, then one
 * table lists every module once with a tick under each duration that
 * includes it. The alternative — three separate module lists — makes a
 * reader hold two of them in their head to answer the only question they
 * came with: what does the extra six months actually buy?
 *
 * Each stage's rows sit in their own `<tbody>`, toggled by a header row
 * above them. Stage one starts open — most readers land here still deciding
 * whether to enrol at all — and the deeper stages start collapsed, since
 * they only matter once someone is already weighing a longer track. Every
 * stage opens and closes independently; opening stage two doesn't hide
 * stage one.
 *
 * `"use client"` only because the open/closed state lives here — the tick
 * marks, cards and copy underneath it are all still plain server-rendered
 * markup.
 */
export function ModuleComparison({ syllabus }: { syllabus: Syllabus }) {
  const { stages, modules, intro, note } = syllabus
  // Keyed by `months`, not index — stable even if stages were ever reordered.
  // Declared before the early return below: hooks must run on every render,
  // and an empty-modules bail-out ahead of this one would call it
  // conditionally.
  const [openStages, setOpenStages] = useState<Set<number>>(
    () => new Set(stages[0] ? [stages[0].months] : []),
  )

  if (modules.length === 0) return null

  function toggleStage(months: number) {
    setOpenStages((prev) => {
      const next = new Set(prev)
      if (next.has(months)) {
        next.delete(months)
      } else {
        next.add(months)
      }
      return next
    })
  }

  return (
    <div className="mt-10">
      {intro && (
        <p className="max-w-3xl text-sm leading-relaxed text-white/65 lg:text-base">
          {intro}
        </p>
      )}

      {/* --- What each length certifies ---
          Shopify's two-stage ladder needs two columns, not three with an
          empty gap — the class has to be a static literal for Tailwind's
          scanner to pick it up, so this branches on a fixed string rather
          than interpolating the column count. */}
      <div
        className={`mt-10 grid gap-4 ${
          stages.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
        }`}
      >
        {stages.map((stage, i) => (
          <StageCard
            key={stage.months}
            stage={stage}
            index={i}
            last={i === stages.length - 1}
          />
        ))}
      </div>

      {/* --- The ladder, module by module ---
          Wide content scrolls inside its own container: the table keeps a
          min-width so the duration columns stay readable, and the page body
          never scrolls sideways because of it. */}
      <div className="mt-10 overflow-x-auto rounded-3xl border border-white/12 bg-white/[0.04] backdrop-blur-md">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <caption className="sr-only">
            Every module in the programme, grouped by stage — expand a stage
            to see its modules, with a tick under each duration that includes
            them
          </caption>

          <thead>
            <tr className="border-b border-white/15">
              <th
                scope="col"
                className="px-5 py-4 text-xs font-semibold tracking-[0.16em] text-white/55 uppercase sm:px-7"
              >
                Module
              </th>
              {stages.map((stage) => (
                <th
                  key={stage.months}
                  scope="col"
                  className="w-[6.5rem] px-3 py-4 text-center text-xs font-semibold tracking-[0.16em] text-white/55 uppercase"
                >
                  {stage.months} Months
                </th>
              ))}
            </tr>
          </thead>

          {stages.map((stage, stageIndex) => {
            const stageModules = modules.filter((m) => m.from === stage.months)
            if (stageModules.length === 0) return null

            const isOpen = openStages.has(stage.months)
            const triggerId = `syllabus-stage-${stage.months}-trigger`
            const panelId = `syllabus-stage-${stage.months}-panel`

            return (
              <StageGroup
                key={stage.months}
                stage={stage}
                stageIndex={stageIndex}
                allStages={stages}
                stageModules={stageModules}
                isOpen={isOpen}
                triggerId={triggerId}
                panelId={panelId}
                onToggle={() => toggleStage(stage.months)}
              />
            )
          })}
        </table>
      </div>

      {note && (
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-white/55">
          {note}
        </p>
      )}
    </div>
  )
}

/**
 * One stage's header row plus its module rows, as two sibling `<tbody>`
 * elements — a header tbody (always rendered) and a panel tbody hidden with
 * the native `hidden` attribute when collapsed. `<tbody>` accepts `id` and
 * `hidden` directly, so this needs no grid-row height trick and no invalid
 * table nesting: the browser removes hidden rows from layout and the
 * accessibility tree on its own.
 */
function StageGroup({
  stage,
  stageIndex,
  allStages,
  stageModules,
  isOpen,
  triggerId,
  panelId,
  onToggle,
}: {
  stage: SyllabusStage
  stageIndex: number
  allStages: SyllabusStage[]
  stageModules: SyllabusModule[]
  isOpen: boolean
  triggerId: string
  panelId: string
  onToggle: () => void
}) {
  return (
    <>
      <tbody>
        <tr>
          <td colSpan={1 + allStages.length} className="p-0">
            <button
              type="button"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={onToggle}
              className="flex w-full items-center justify-between gap-3 border-y border-white/12 bg-white/[0.06] px-5 py-2.5 text-left font-mono text-[0.7rem] tracking-[0.18em] text-white/60 uppercase transition-colors duration-300 hover:bg-white/[0.09] sm:px-7"
            >
              <span>
                Stage {stageIndex + 1} · {stage.label} · {stage.range}
              </span>
              <Chevron isOpen={isOpen} />
            </button>
          </td>
        </tr>
      </tbody>

      <tbody id={panelId} aria-labelledby={triggerId} hidden={!isOpen}>
        {stageModules.map((module) => (
          <tr
            key={module.n}
            className="border-b border-white/8 transition-colors duration-300 last:border-0 hover:bg-white/[0.05]"
          >
            <th scope="row" className="px-5 py-4 align-top font-normal sm:px-7">
              <span className="flex gap-3.5">
                <span className="mt-0.5 font-mono text-xs text-white/40">
                  {String(module.n).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[0.95rem] font-bold tracking-tight text-white">
                    {module.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/55">
                    {module.body}
                  </span>
                </span>
              </span>
            </th>

            {allStages.map((s) => (
              <td key={s.months} className="px-3 py-4 text-center align-top">
                <Mark included={s.months >= module.from} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </>
  )
}

function StageCard({
  stage,
  last,
}: {
  stage: SyllabusStage
  index: number
  last: boolean
}) {
  // The longest track is the one most students are deciding about, so it
  // carries the filled treatment while the shorter ones stay quiet.
  const lead = last

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors duration-500 ${
        lead
          ? "border-white/25 bg-white/12"
          : "border-white/12 bg-white/[0.05] hover:border-white/20"
      }`}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold tracking-tight text-white">
          {stage.months}
        </span>
        <span className="text-sm font-medium text-white/60">months</span>
      </div>

      <p className="mt-3 text-xs font-semibold tracking-[0.16em] text-accent-400 uppercase">
        {stage.label}
      </p>
      <p className="mt-1 font-mono text-xs text-white/45">{stage.range}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/65">
        {stage.summary}
      </p>
    </div>
  )
}

/** Chevron that rotates on open — the same visual language as the tick/cross
 * marks below it: a single inline SVG, no icon library. */
function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`size-4 shrink-0 text-white/50 transition-transform duration-300 ${
        isOpen ? "rotate-180" : "rotate-0"
      }`}
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Tick or cross, with the state also carried in text for screen readers. */
function Mark({ included }: { included: boolean }) {
  return (
    <>
      <span className="sr-only">{included ? "Included" : "Not included"}</span>
      {included ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mx-auto size-5 text-accent-400"
        >
          <path
            d="m5 12.5 4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        /* Muted rose rather than a faint white: a comparison table is read at a
           glance, and an exclusion nobody can see defeats the point. Colour is
           supplementary here — the tick and cross differ in shape, and each
           cell carries its state in text for screen readers. */
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mx-auto size-[1.05rem] text-rose-300/60"
        >
          <path
            d="M7 7l10 10M17 7 7 17"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </>
  )
}
