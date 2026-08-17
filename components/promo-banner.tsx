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

  const art = (
    <>
      {/* Two files, one slot: the mobile crop where it exists, the desktop one
          otherwise. Both are declared so neither downloads on the wrong
          breakpoint. */}
      {mobile && (
        <Image
          src={mobile}
          alt={banner.altText}
          width={banner.mobileImage?.width ?? 800}
          height={banner.mobileImage?.height ?? 800}
          className={`h-auto w-full ${desktop ? "sm:hidden" : ""}`}
          sizes="100vw"
        />
      )}
      {desktop && (
        <Image
          src={desktop}
          alt={mobile ? "" : banner.altText}
          width={banner.desktopImage?.width ?? 1600}
          height={banner.desktopImage?.height ?? 500}
          className={`h-auto w-full ${mobile ? "hidden sm:block" : ""}`}
          sizes="(min-width: 1304px) 1304px, 100vw"
        />
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
