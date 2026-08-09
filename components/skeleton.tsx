/**
 * Shimmering placeholder block.
 *
 * `dark` switches the tint for skeletons sitting on the ink panels, where the
 * default light sweep would blow out.
 */
export function Skeleton({
  className = "",
  dark = false,
  rounded = "rounded-lg",
}: {
  className?: string
  dark?: boolean
  /** Override when the placeholder stands in for something not rectangular. */
  rounded?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton ${dark ? "skeleton-dark" : ""} ${rounded} ${className}`}
    />
  )
}
