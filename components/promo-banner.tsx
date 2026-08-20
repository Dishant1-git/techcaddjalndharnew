import Image from "next/image"
import Link from "next/link"
import { Container } from "./container"
import { cmsImageUrl, type CmsBanner } from "@/lib/cms"
import { loadBanners } from "@/lib/content"

/**
 * Promotional artwork scheduled in the CMS.
 *
 * Renders nothing when no banner is live, so the page is byte-for-byte what it
 * was before a campaign starts and after it ends — an empty band with a border
 * would be worse than no band at all.
 *
 * Only the first banner for a slot is shown. The CMS orders them, so "first"
 * is the editor's choice; stacking several promos would compete with the hero
 * immediately above.
 */
export async function PromoBanner({
  placement = "home-hero",
}: {
  placement?: CmsBanner["placement"]
}) {
  const [banner] = await loadBanners(placement)
  if (!banner) return null

  const desktop = cmsImageUrl(banner.desktopImage?.url)
  const mobile = cmsImageUrl(banner.mobileImage?.url)

  // Artwork is the whole point of a banner; without it there is nothing to show.
  if (!desktop && !mobile) return null

  /*
    The slot has a shape, and the upload is fitted to it.

    Rendering at the file's own proportions meant a square or portrait upload
    became a full-screen image between the hero and the next section, shoving
    the page down, which is what an editor gets by default, because "banner"
    does not tell anyone what dimensions to export. A fixed strip keeps the
    homepage's rhythm whatever arrives, and object-cover fills it without
    distorting anyone's artwork.

    Wider on desktop than on a phone: the same 16:5 strip on a narrow screen
    leaves a band too short to read anything in.
  */
  const art = (
    <>
      {/* Two files, one slot: the mobile crop where it exists, the desktop one
          otherwise. Both are declared so neither downloads on the wrong
          breakpoint. */}
      {mobile && (
        <div
          className={`relative aspect-[3/2] w-full sm:aspect-[16/5] ${desktop ? "sm:hidden" : ""}`}
        >
          <Image
            src={mobile}
            alt={banner.altText}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}
      {desktop && (
        <div
          className={`relative aspect-[3/2] w-full sm:aspect-[16/5] ${mobile ? "hidden sm:block" : ""}`}
        >
          <Image
            src={desktop}
            alt={mobile ? "" : banner.altText}
            fill
            className="object-cover"
            sizes="(min-width: 1304px) 1304px, 100vw"
          />
        </div>
      )}
    </>
  )

  return (
    <section aria-label={banner.title} className="pt-6 lg:pt-10">
      <Container>
        <div className="overflow-hidden rounded-2xl">
          {banner.linkUrl ? (
            <Link href={banner.linkUrl} className="block">
              {art}
            </Link>
          ) : (
            art
          )}
        </div>

        {/* The CTA is a second affordance for the same link, for anyone who
            does not read the artwork as clickable. */}
        {banner.linkUrl && banner.ctaText && (
          <div className="mt-4 text-center">
            <Link
              href={banner.linkUrl}
              className="inline-flex items-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              {banner.ctaText}
            </Link>
          </div>
        )}
      </Container>
    </section>
  )
}
