import { BannerView } from "./banner-view"
import { type CmsBanner } from "@/lib/cms"
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

  return <BannerView banner={banner} />
}

