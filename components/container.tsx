/**
 * The single content column for the whole site.
 *
 * Every section must use this rather than rolling its own max-width and
 * gutter. Two idioms had drifted apart — `section px-4` + `div max-w-[1240px]`
 * (content 1240px) versus `div max-w-[1240px] px-4` (content 1176px) — which
 * put a 32px step between neighbouring sections and read as sloppy alignment
 * down the page.
 *
 * Padding lives here, not on the section, so a full-bleed coloured section can
 * span the viewport while its copy stays on the same line as everything else.
 */
export function Container({
  className = "",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`mx-auto w-full max-w-[1304px] px-4 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}
