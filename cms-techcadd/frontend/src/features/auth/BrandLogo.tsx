import { cn } from '../../lib/cn'

/** Supplied artwork in `public/`. Transparent RGBA, 883 × 191 (about 4.6:1). */
const BRAND_LOGO_URL = '/techcaddLogo.png'

/** Intrinsic size, so the browser reserves the right box and nothing shifts. */
const INTRINSIC_WIDTH = 883
const INTRINSIC_HEIGHT = 191

interface BrandLogoProps {
  className?: string
  /** Height class, e.g. `h-7`. Width follows the aspect ratio. */
  height?: string
}

export function BrandLogo({ className, height = 'h-6' }: BrandLogoProps) {
  return (
    <img
      src={BRAND_LOGO_URL}
      alt="TechCadd"
      width={INTRINSIC_WIDTH}
      height={INTRINSIC_HEIGHT}
      // The artwork is a fixed navy, so it cannot take a text colour the way
      // the old SVG wordmark could — it suits light surfaces only.
      className={cn('w-auto object-contain', height, className)}
    />
  )
}
