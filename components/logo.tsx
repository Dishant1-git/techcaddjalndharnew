import Image from "next/image"
import { PrefetchLink } from "./prefetch-link"

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
    /* Hover-prefetched. The logo sits in the bar on every page and the
       homepage RSC payload is 117 KB — eagerly fetched from every other page
       for a link people rarely take. */
    <PrefetchLink href="/" className="block shrink-0" aria-label="Techcadd home">
      <Image
        src="/assets/icon/tce.png"
        alt="Techcadd — Your Skill & Technology Partner"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
        className={`w-auto transition-all duration-500 ${
          compact ? "h-9" : "h-11 lg:h-12"
        } ${onDark ? "brightness-0 invert" : ""}`}
      />
    </PrefetchLink>
  )
}
