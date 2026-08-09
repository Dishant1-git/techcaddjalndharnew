/**
 * The lowercase "t" from the techcadd wordmark.
 *
 * Traced from `/assets/icon/tce.png` rather than set in a typeface: the logo's
 * t is a rounded geometric letterform with a 22:70 stroke-to-width ratio and a
 * hooked bottom terminal, which no font on the page reproduces.
 *
 * The viewBox is the glyph's own bounding box (70 x 152 in source pixels), so
 * it sits flush with no optical padding to compensate for. Colour comes from
 * `currentColor`.
 */
export function TechcaddT({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 152" fill="none" className={className} aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Stem, curving into the bottom-right hook. */}
        <path d="M26.5 11V115c0 14 8.5 25 21 25" />
        {/* Crossbar. */}
        <path d="M11 57h47" />
      </g>
    </svg>
  )
}
