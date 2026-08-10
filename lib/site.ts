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
  /** TODO: replace with the verified street address from Google Business Profile. */
  street: "",
  locality: "Jalandhar",
  region: "Punjab",
  postalCode: "144001",
  country: "IN",
  phone: "+91 98881 22255",
  email: "info@techcadd.com",
  founded: "2007",
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
 * `streetAddress` is omitted rather than invented while the real address is
 * unknown — a wrong address is worse than an absent one, because it creates a
 * NAP conflict Google has to resolve against your Business Profile.
 */
export function organisationSchema() {
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
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      ...(SITE.street ? { streetAddress: SITE.street } : {}),
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    areaServed: SITE.areasServed.map((name) => ({ "@type": "Place", name })),
    sameAs: SITE.socials,
  }
}
