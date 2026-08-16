/**
 * One headline number.
 *
 * A stat tile rather than a one-bar chart: these five values have nothing to
 * compare against each other — they are five different questions — so plotting
 * them together would invent a relationship that is not there.
 */
export function StatTile({
  label,
  value,
  hint,
  delta,
}: {
  label: string
  value: number | string
  /** Small print under the number — what it counts, or when it was last true. */
  hint?: string
  /** Change against the previous equivalent period, as a signed percentage. */
  delta?: number | null
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>

      <p className="mt-2 text-3xl leading-none font-bold text-foreground">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>

      {/* The arrow is paired with the sign and the word "vs" rather than
          carrying the meaning on colour alone. */}
      {delta !== undefined && delta !== null && (
        <p
          className={`mt-2 text-sm font-medium ${
            delta > 0 ? "text-green-700" : delta < 0 ? "text-red-700" : "text-muted"
          }`}
        >
          {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"} {Math.abs(delta)}%{" "}
          <span className="font-normal text-muted">vs previous</span>
        </p>
      )}

      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </div>
  )
}
