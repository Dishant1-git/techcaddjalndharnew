/** The faint 8 × 12 rule grid the Optimus hero lays under its content. */
export function GridOverlay() {
  const rows = Array.from({ length: 8 }, (_, i) => ((i + 1) * 100) / 8)
  const cols = Array.from({ length: 12 }, (_, i) => ((i + 1) * 100) / 12)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"
    >
      {rows.map((top) => (
        <div
          key={`r-${top}`}
          className="absolute inset-x-0 h-px bg-foreground/10"
          style={{ top: `${top}%` }}
        />
      ))}
      {cols.map((left) => (
        <div
          key={`c-${left}`}
          className="absolute inset-y-0 w-px bg-foreground/10"
          style={{ left: `${left}%` }}
        />
      ))}
    </div>
  )
}
