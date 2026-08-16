import type { TrendPoint } from "@/lib/admin-data"
import { SEQUENTIAL } from "./palette"

/**
 * Enquiries per day, as columns.
 *
 * One series, so there is no legend — the heading names it — and one hue
 * rather than a categorical palette: the bars are magnitude, not identity.
 *
 * Rendered as plain SVG on the server. The hover layer is CSS only: each
 * column sits in a group with a full-height hit target, and the value label
 * above it appears on hover. That costs no JavaScript, and the <title> gives
 * the same number to a native tooltip and to a screen reader.
 */

const WIDTH = 720
const HEIGHT = 220
const PAD = { top: 26, right: 8, bottom: 30, left: 36 }

const PLOT_W = WIDTH - PAD.left - PAD.right
const PLOT_H = HEIGHT - PAD.top - PAD.bottom

/** The widest a single day is allowed to get when there are only a few. */
const MAX_BAR = 30

/** Corner radius on the data end. The baseline end stays square. */
const RADIUS = 4

/**
 * A bar rounded at the top only. A plain <rect rx> would round the foot as
 * well, which lifts the column off its own baseline.
 */
function barPath(x: number, y: number, width: number, height: number): string {
  const r = Math.min(RADIUS, width / 2, height)
  return [
    `M ${x} ${y + height}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    `H ${x + width - r}`,
    `A ${r} ${r} 0 0 1 ${x + width} ${y + r}`,
    `V ${y + height}`,
    "Z",
  ].join(" ")
}

/** A round-ish top tick, so the axis reads 0 / 4 / 8 rather than 0 / 3 / 7. */
function niceMax(value: number): number {
  if (value <= 4) return 4
  const step = value <= 20 ? 2 : value <= 100 ? 10 : 50
  return Math.ceil(value / step) * step
}

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const peak = Math.max(...points.map((point) => point.count), 0)
  const max = niceMax(peak)

  const slot = PLOT_W / points.length
  // A 2px gap between neighbours at minimum, so adjacent columns never fuse
  // into one block.
  const barWidth = Math.max(4, Math.min(MAX_BAR, slot - 8))

  const y = (count: number) => PAD.top + PLOT_H - (count / max) * PLOT_H

  const ticks = [0, max / 2, max]

  // With many days on screen, every label collides; every other one does not.
  const labelEvery = points.length > 16 ? 3 : points.length > 10 ? 2 : 1

  /**
   * Counted back from the newest day, not forward from the oldest. Today is
   * the column a reader looks for first, and stepping from the left leaves it
   * unlabelled whenever the day count is not a multiple of the interval.
   */
  const labelled = (index: number) => (points.length - 1 - index) % labelEvery === 0

  return (
    <figure className="rounded-2xl border border-line bg-white p-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Enquiries per day
        </h2>
        <p className="text-sm text-muted">
          Last {points.length} days · {peak === 0 ? "none yet" : `peak ${peak} in a day`}
        </p>
      </figcaption>

      {peak === 0 ? (
        <p className="mt-6 mb-2 text-sm text-muted">
          No enquiries in this window. The chart fills in as the forms are used.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mt-4 h-auto w-full overflow-visible"
          role="img"
          aria-label={`Enquiries per day for the last ${points.length} days. Peak ${peak}.`}
        >
          {/* Gridlines and their labels are recessive on purpose — they are
              the ruler, not the reading. */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke={tick === 0 ? "#c3c2b7" : "#e2e8f0"}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-muted text-[11px]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {tick}
              </text>
            </g>
          ))}

          {points.map((point, index) => {
            const x = PAD.left + index * slot + (slot - barWidth) / 2
            const height = point.count === 0 ? 0 : PAD.top + PLOT_H - y(point.count)

            return (
              <g key={point.day} className="group">
                <title>{`${point.label}: ${point.count}`}</title>

                {/* The hit target is the whole column slot, so the tooltip
                    does not require landing on a 3px-tall bar. */}
                <rect
                  x={PAD.left + index * slot}
                  y={PAD.top}
                  width={slot}
                  height={PLOT_H}
                  fill="transparent"
                />

                {height > 0 && (
                  <path
                    d={barPath(x, y(point.count), barWidth, height)}
                    fill={SEQUENTIAL}
                    className="transition-opacity group-hover:opacity-80"
                  />
                )}

                <text
                  x={x + barWidth / 2}
                  y={y(point.count) - 8}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {point.count}
                </text>

                {labelled(index) && (
                  <text
                    x={PAD.left + index * slot + slot / 2}
                    y={HEIGHT - 10}
                    textAnchor="middle"
                    className="fill-muted text-[11px]"
                  >
                    {point.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
    </figure>
  )
}
