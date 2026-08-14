import type { Syllabus, SyllabusStage } from "@/lib/course-pages"

/**
 * The syllabus as a duration comparison.
 *
 * Three stage cards state what each enrolment length certifies, then one table
 * lists every module once with a tick under each duration that includes it.
 * The alternative — three separate module lists — makes a reader hold two of
 * them in their head to answer the only question they came with: what does the
 * extra six months actually buy?
 *
 * A server component: nothing here needs state, so none of it ships to the
 * browser.
 */
export function ModuleComparison({ syllabus }: { syllabus: Syllabus }) {
  const { stages, modules, intro, note } = syllabus
  if (modules.length === 0) return null

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
          min-width so the three duration columns stay readable, and the page
          body never scrolls sideways because of it. */}
      <div className="mt-10 overflow-x-auto rounded-3xl border border-white/12 bg-white/[0.04] backdrop-blur-md">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <caption className="sr-only">
            Every module in the programme, with the durations that include it
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

          <tbody>
            {modules.map((module, i) => {
              // A band header wherever the entry point changes, so the reader
              // can see where each stage starts without counting rows.
              const opensStage = i === 0 || modules[i - 1].from !== module.from
              const stage = stages.find((s) => s.months === module.from)

              return (
                <BandedRows
                  key={module.n}
                  band={
                    opensStage && stage
                      ? `Stage ${stages.indexOf(stage) + 1} · ${stage.label} · ${stage.range}`
                      : null
                  }
                >
                  <tr className="border-b border-white/8 transition-colors duration-300 last:border-0 hover:bg-white/[0.05]">
                    <th
                      scope="row"
                      className="px-5 py-4 align-top font-normal sm:px-7"
                    >
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

                    {stages.map((s) => (
                      <td key={s.months} className="px-3 py-4 text-center align-top">
                        <Mark included={s.months >= module.from} />
                      </td>
                    ))}
                  </tr>
                </BandedRows>
              )
            })}
          </tbody>
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
 * A row plus an optional band header above it.
 *
 * Returned as a fragment rather than a wrapper element: anything between
 * <tbody> and <tr> is invalid table markup, and browsers respond by hoisting
 * the stray element out of the table entirely.
 */
function BandedRows({
  band,
  children,
}: {
  band: string | null
  children: React.ReactNode
}) {
  return (
    <>
      {band && (
        <tr>
          <td
            colSpan={4}
            className="border-y border-white/12 bg-white/[0.06] px-5 py-2.5 font-mono text-[0.7rem] tracking-[0.18em] text-white/60 uppercase sm:px-7"
          >
            {band}
          </td>
        </tr>
      )}
      {children}
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
