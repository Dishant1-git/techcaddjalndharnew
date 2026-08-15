import { toolIcon, toolInitials } from "@/lib/tool-icons"

/**
 * The toolchain as a radial mesh — the course at the centre, its tools as
 * satellites on a ring, joined by connector lines.
 *
 * Server-rendered: positions are trigonometry, not layout measurement, so
 * there is no JavaScript and nothing to hydrate.
 *
 * Below `lg` the ring collapses to a grid. A radial diagram on a 390px screen
 * is unreadable at any node size, and shrinking the nodes to fit would make
 * the labels illegible.
 */

/** Nodes past this crowd the ring; the remainder become chips underneath. */
const MAX_ON_RING = 10

/** Percentage of the stage, measured from the centre. */
const RADIUS = 36

export function ToolMesh({
  courseName,
  tools,
}: {
  courseName: string
  tools: string[]
}) {
  const ring = tools.slice(0, MAX_ON_RING)
  const overflow = tools.slice(MAX_ON_RING)

  const points = ring.map((tool, i) => {
    // Start at twelve o'clock and distribute evenly.
    const angle = (i / ring.length) * Math.PI * 2 - Math.PI / 2
    return {
      tool,
      x: 50 + RADIUS * Math.cos(angle),
      y: 50 + RADIUS * Math.sin(angle),
    }
  })

  return (
    <>
      {/* --- Radial mesh, lg and up --- */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[46rem] lg:block">
        {/* Connector lines, drawn first so the nodes sit on top of them. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          {points.map((p) => (
            <line
              key={p.tool}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeWidth="0.18"
              className="text-white/15"
            />
          ))}
        </svg>

        {/* Ambient glow behind the hub. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/25 blur-[70px]"
        />

        {points.map((p, i) => (
          <div
            key={p.tool}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Node name={p.tool} index={i} />
          </div>
        ))}

        {/* Hub */}
        <div className="absolute top-1/2 left-1/2 grid size-[8.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-linear-to-br from-brand-500 via-brand-600 to-violet-600 text-center shadow-[0_0_60px_-10px_rgba(59,130,246,0.9)]">
          <div className="px-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="mx-auto size-6 text-white"
              aria-hidden="true"
            >
              <path
                d="M12 3v4m0 0-5 3m5-3 5 3M4 11h4m8 0h4M7 10v4l5 3 5-3v-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="mt-2 block text-sm leading-tight font-bold text-white">
              {courseName}
            </span>
          </div>
        </div>
      </div>

      {/* --- Grid, below lg --- */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:hidden">
        {tools.map((tool, i) => (
          <Node key={tool} name={tool} index={i} block />
        ))}
      </div>

      {overflow.length > 0 && (
        <div className="mt-10 hidden flex-wrap justify-center gap-2.5 lg:flex">
          {overflow.map((tool) => (
            <span
              key={tool}
              className="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/75"
            >
              {tool}
            </span>
          ))}
        </div>
      )}
    </>
  )
}

function Node({
  name,
  block = false,
  index = 0,
}: {
  name: string
  block?: boolean
  /** Offsets this node's sweep so the ring does not pulse in unison. */
  index?: number
}) {
  const icon = toolIcon(name)

  return (
    <div
      className={`spin-border rounded-xl p-px shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] ${
        block ? "w-full" : "w-[7.5rem]"
      }`}
      style={
        {
          "--spin-duration": "5s",
          "--spin-delay": `${-index * 0.55}s`,
          "--spin-from": "#22d3ee",
          /* Was white, which vanished against the white face below. */
          "--spin-to": "#2563eb",
        } as React.CSSProperties
      }
    >
      {/*
        A white face, not the old near-black one.

        Brand marks are drawn for light ground: half of these — OpenAI, Claude,
        Anthropic, Next.js, GitHub, Notion — are near-black by definition, so on
        a dark card they were invisible rather than subtle. Inverting the card
        is the only fix that works for every logo at once, and it is how every
        vendor's own press kit expects the mark to be placed.
      */}
      <div className="spin-border__face flex flex-col items-center gap-2 rounded-[0.7rem] bg-white px-3 py-3 text-center">
        {icon?.path ? (
          <svg
            viewBox="0 0 24 24"
            className="size-5 shrink-0"
            fill={`#${icon.hex}`}
            role="img"
            aria-label={name}
          >
            <path d={icon.path} />
          </svg>
        ) : (
          /* Lettered chip for brands that ship no reusable mark. Tinted with
             the brand's own colour so it still reads as that product. */
          <span
            aria-hidden="true"
            className="grid size-5 shrink-0 place-items-center rounded font-display text-[0.6rem] font-bold"
            style={{
              color: `#${icon?.hex ?? "1B1F3B"}`,
              backgroundColor: `#${icon?.hex ?? "1B1F3B"}1a`,
            }}
          >
            {icon?.mono ?? toolInitials(name)}
          </span>
        )}

        <span className="text-[0.7rem] leading-tight font-medium text-ink">
          {name}
        </span>
      </div>
    </div>
  )
}
