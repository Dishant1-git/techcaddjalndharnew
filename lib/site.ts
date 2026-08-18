/**
 * Single source of truth for the site's identity.
 *
 * NAP (name, address, phone) must match Google Business Profile and every
 * directory listing character for character — inconsistent NAP is one of the
 * few things that measurably suppresses local rankings.
 */
export const SITE = {
  name: "Techcadd",
  url: "https://techcadd.com",
  legalName: "Techcadd Computer Education",
  tagline: "Your Skill & Technology Partner",
  /**
   * Taken from the Google Business Profile listing, so the NAP here matches
   * the listing character for character. "Techcadd" rather than the listing's
   * own casing — the brand spelling is fixed everywhere on this site, and
   * Google's matching is case-insensitive.
   */
  street: "2nd Floor, Crystal Plaza, SCS 78, Opposite PIMS Hospital",
  locality: "Jalandhar",
  region: "Punjab",
  postalCode: "144001",
  country: "IN",
  /** The listing's own pin, not the centre of Jalandhar. */
  geo: { latitude: 31.3054981, longitude: 75.5933857 },
  phone: "+91 98881 22255",
  email: "info@techcadd.com",
  founded: "2007",
  /**
   * The walkthrough that opens from every course page.
   * TODO: replace with Techcadd's own campus/course video — one edit here
   * changes it on all 50+ course pages.
   */
  promoVideo: "https://www.youtube.com/watch?v=aircAruvnKk",

  /**
   * What the contact page's map points at.
   *
   * `cid` is Google's own identifier for the listing and is what makes the
   * embed exact: it resolves to one business and cannot drift to a similarly
   * named place the way a text search can. It is the second half of the
   * feature id in a Maps URL — `!1s0x391a5bb1521b03bf:0x370912cf8f0f3f7c` —
   * converted from hex to decimal.
   *
   * `query` is the human-readable fallback and is what the "Get directions"
   * link always uses, because a bare numeric id is a poor thing to show
   * someone if it ever fails to resolve.
   */
  maps: {
    cid: "3965721629544103804",
    query:
      "Techcadd Computer Education, 2nd Floor, Crystal Plaza, SCS 78, Opposite PIMS Hospital, Jalandhar, Punjab 144001",
  },
  /** Areas the Jalandhar centre actually draws students from. */
  areasServed: [
    "Jalandhar",
    "Model Town",
    "Urban Estate",
    "Adarsh Nagar",
    "Basti Bawa Khel",
    "Rama Mandi",
    "Phagwara",
    "Kapurthala",
    "Nakodar",
    "Hoshiarpur",
    "Adampur",
    "Kartarpur",
  ],
  socials: [
    "https://instagram.com/techcadd",
    "https://linkedin.com/company/techcadd",
    "https://facebook.com/techcadd",
    "https://youtube.com/@techcadd",
    "https://x.com/techcadd",
  ],
}

/**
 * Organisation-level structured data, emitted once site-wide.
 *
 * The address is now the verified one from the Business Profile, so it is
 * emitted in full — including `geo` and `hasMap`, which are what let Google
 * tie this page to the listing rather than merely to the city. The
 * `streetAddress` guard is kept: an empty value should still be omitted rather
 * than published as an empty string.
 */
/**
 * The organisation's structured data.
 *
 * Takes the contact details rather than reading them, so the schema, the
 * contact page and the brochure print the same NAP — they must not disagree,
 * or the Business Profile match weakens. Defaults to the constants, so a caller
 * with nothing to pass behaves exactly as before.
 */
export function organisationSchema(contact?: {
  phone: string
  email: string
  street: string
  locality: string
  region: string
  postalCode: string
}) {
  const nap = contact ?? SITE

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}/assets/icon/tce.png`,
    foundingDate: SITE.founded,
    slogan: SITE.tagline,
    telephone: nap.phone,
    email: nap.email,
    address: {
      "@type": "PostalAddress",
      ...(nap.street ? { streetAddress: nap.street } : {}),
      addressLocality: nap.locality,
      addressRegion: nap.region,
      postalCode: nap.postalCode,
      addressCountry: SITE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    /* Points at the listing itself, which is the strongest single signal
       connecting this site to that Business Profile. */
    hasMap: `https://www.google.com/maps?cid=${SITE.maps.cid}`,
    areaServed: SITE.areasServed.map((name) => ({ "@type": "Place", name })),
    sameAs: SITE.socials,
  }
}
