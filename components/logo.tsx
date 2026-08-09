import Image from "next/image"
import Link from "next/link"

/** Intrinsic size of the source artwork, used for the aspect ratio. */
const LOGO_WIDTH = 952
const LOGO_HEIGHT = 262

/**
 * The techcadd wordmark.
 *
 * The source PNG is navy on transparent, so `brightness-0 invert` flattens it
 * to pure white for the dark navbar and preloader — one asset, both grounds,
 * no second file to keep in sync.
 */
export function Logo({
  compact = false,
  onDark = false,
}: {
  compact?: boolean
  onDark?: boolean
}) {
  return (
    <Link href="/" className="block shrink-0" aria-label="TechCadd home">
      <Image
        src="/assets/icon/tce.png"
        alt="TechCadd — Your Skill & Technology Partner"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
        className={`w-auto transition-all duration-500 ${
          compact ? "h-9" : "h-11 lg:h-12"
        } ${onDark ? "brightness-0 invert" : ""}`}
      />
    </Link>
  )
}
