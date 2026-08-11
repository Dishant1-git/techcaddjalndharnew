/**
 * Shared backdrop for the dark ink panels.
 *
 * Five layers, cheapest first: blueprint grid, diagonal hatch, PCB traces,
 * two colour glows, then grain on top. Everything is CSS or inline SVG — no
 * image requests, and it stays sharp on any display.
 *
 * The parent must be `relative` (and ideally `isolate`), and its content must
 * sit above this in the stacking order.
 */
export function PanelTexture({
  variant = "circuit",
}: {
  /**
   * "circuit" is the homepage schematic; "aurora" is the calmer course-page
   * surface — dot matrix and concentric rings instead of grid and PCB traces.
   */
  variant?: "circuit" | "aurora"
}) {
  if (variant === "aurora") return <AuroraTexture />

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="panel-grid absolute inset-0" />
      <div className="panel-hatch absolute inset-0" />

      {/* PCB traces — right-weighted so they sit behind content rather than
          under the headline. */}
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-y-0 right-0 h-full w-[70%] text-white/[0.13]"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M600 60H430l-40 40H250" />
          <path d="M600 130H470l-30 30H300l-35 35H120" />
          <path d="M600 210H500l-45-45H360" />
          <path d="M600 285H455l-40 40H285" />
          <path d="M600 350H520l-50-50H395" />
          <path d="M180 215v90l40 40h130" />
        </g>
        <g fill="currentColor">
          {[
            [430, 60], [250, 100], [470, 130], [300, 160], [120, 215],
            [500, 210], [360, 165], [455, 285], [285, 325], [520, 350],
            [395, 300], [180, 215], [350, 345],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" />
          ))}
        </g>
      </svg>

      {/* Colour lift, so the ink never reads as flat charcoal. */}
      <div className="absolute -top-40 -left-32 size-[38rem] rounded-full bg-brand-600/30 blur-[130px]" />
      <div className="absolute -right-40 -bottom-44 size-[34rem] rounded-full bg-accent-500/20 blur-[130px]" />

      <div className="panel-noise absolute inset-0" />
    </div>
  )
}

/**
 * Course-page surface: dot matrix, wide concentric rings and a diagonal aurora
 * sweep. Deliberately quieter than the circuit variant — a course page is read
 * top to bottom, and a schematic behind long-form copy competes with it.
 */
function AuroraTexture() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="panel-dots absolute inset-0" />

      {/* Aurora sweep — a soft diagonal band rather than corner blooms. */}
      <div className="absolute -top-1/3 -left-1/4 h-[140%] w-[70%] -rotate-12 bg-linear-to-br from-brand-500/25 via-brand-600/10 to-transparent blur-[120px]" />
      <div className="absolute -right-1/4 -bottom-1/3 h-[120%] w-[55%] -rotate-12 bg-linear-to-tl from-accent-500/20 to-transparent blur-[120px]" />

      <div className="panel-noise absolute inset-0" />
    </div>
  )
}
