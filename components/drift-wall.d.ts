import type { CSSProperties } from "react"

/**
 * Types for the JavaScript DriftWall component.
 *
 * Without this, TypeScript infers the prop shape from the .jsx and marks every
 * parameter that has no default — `style` — as required, so a perfectly valid
 * call fails to compile. Declaring the surface here fixes that and keeps the
 * upstream source untouched, so a newer version can be dropped in without
 * having to re-apply type annotations.
 *
 * Mirrors the documented props at reactbits.dev; defaults are in the .jsx.
 */

export type DriftWallItem = {
  image: string
  title?: string
  /** Renders the tile as an anchor opening in a new tab. */
  href?: string
}

export type DriftWallProps = {
  /** Tiles to display. */
  items?: DriftWallItem[]
  /** Number of drifting columns. */
  columns?: number
  /** Width of each tile, in pixels. */
  tileWidth?: number
  /** Height of each tile, in pixels. */
  tileHeight?: number
  /** Spacing between tiles and columns, in pixels. */
  gap?: number
  /** Corner radius of each tile, in pixels. */
  radius?: number
  /** Perspective pitch of the wall (rotateX, degrees). */
  tilt?: number
  /** Perspective yaw of the wall (rotateY, degrees). */
  turn?: number
  /** In-plane rotation of the wall (rotateZ, degrees). */
  roll?: number
  /** Perspective distance in pixels — smaller is more dramatic. */
  perspective?: number
  /** How far the wall sits back from the viewer, in pixels. */
  depth?: number
  /** Base drift speed, in pixels per second. */
  speed?: number
  /** Primary drift direction; columns alternate around it. */
  direction?: "up" | "down"
  /** How much column speeds differ from each other (0–1). */
  variance?: number
  /** Pointer-follow tilt strength; 0 disables it. */
  parallax?: number
  /** Pause the whole wall while the pointer is over it. */
  pauseOnHover?: boolean
  /** How far a hovered tile lifts toward the viewer, in pixels. */
  lift?: number
  /** Strength of the edge and depth dissolve (0–1). */
  fade?: number
  /** Resting opacity of unhovered tiles (0–1). */
  dim?: number
  /** Desaturate resting tiles; hover restores colour. */
  grayscale?: boolean
  /** Tint laid over resting tiles, cleared on hover. */
  overlayColor?: string
  /**
   * Fired when a tile without an `href` is clicked or activated by keyboard.
   * `index` is the tile's position in `items`, not in its column.
   *
   * Not upstream — added so the wall can drive a lightbox.
   */
  onSelect?: (item: DriftWallItem, index: number) => void
  className?: string
  style?: CSSProperties
}

declare const DriftWall: (props: DriftWallProps) => React.JSX.Element

export default DriftWall
