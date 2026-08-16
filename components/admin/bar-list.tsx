import type { Slice } from "@/lib/admin-data"
import { SEQUENTIAL } from "./palette"

/**
 * Ranked horizontal bars.
 *
 * Horizontal rather than columns because the categories are long-named — a
 * course title rotated 45° under a column is a category nobody reads.
 *
 * Every row carries its own visible count and share, which is what lets the
 * categorical variant use hues that sit below 3:1 against white: the colour is
 * a second cue on top of a label and a number, never the only one.
 */
export function BarList({
  title,
  subtitle,
  items,
  /**
   * One colour per row, positionally aligned with `items`, when which row is
   * which is the point. Omitted for a ranking, where only bar length carries
   * meaning and a second hue would invent a distinction that is not there.
   *
   * Passed in rather than derived from the row's index here: the caller is the
   * only thing that knows a category's *fixed* slot, and an index into a
   * filtered list is not it.
   */
  colors,
  empty,
}: {
  title: string
  subtitle?: string
  items: Slice[]
  colors?: string[]
  empty: string
}) {
  // Shares are of what is on screen, and the bar lengths are relative to the
  // largest row — a 60/40 split should look like one, not like two stubs.
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const peak = Math.max(...items.map((item) => item.count), 0)

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>

      {total === 0 ? (
        <p className="mt-6 mb-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {items.map((item, index) => {
            const color = colors?.[index] ?? SEQUENTIAL
            const share = Math.round((item.count / total) * 100)

            return (
              <li key={item.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate text-foreground" title={item.label}>
                      {item.label}
                    </span>
                  </span>

                  <span
                    className="shrink-0 font-semibold text-foreground"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {item.count.toLocaleString("en-IN")}{" "}
                    <span className="font-normal text-muted">({share}%)</span>
                  </span>
                </div>

                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line/60">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: peak ? `${(item.count / peak) * 100}%` : "0%",
                      backgroundColor: color,
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
