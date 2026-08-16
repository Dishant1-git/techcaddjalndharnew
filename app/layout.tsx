import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { CookieConsent } from "@/components/cookie-consent"
import { CursorFollower } from "@/components/cursor-follower"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { EnquiryPopup } from "@/components/enquiry-popup"
import { NavProgress } from "@/components/nav-progress"
import { Preloader } from "@/components/preloader"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ScrollToTop } from "@/components/scroll-to-top"
import { SiteChrome } from "@/components/site-chrome"
import { jsonLd } from "@/lib/json-ld"
import { organisationSchema, SITE } from "@/lib/site"
import "./globals.css"

/*
  The site's only webfont — body, headings and label text all resolve here.
  No weight list, so this is the variable file and every weight the design asks
  for (400 through 700) comes out of it.

  Space Grotesk (`--font-display`) and JetBrains Mono (`--font-mono`) both used
  to load alongside it and were dropped when those roles moved onto Inter:
  nothing referenced them any more, and a font that downloads but never paints
  costs every visitor a request for nothing. To bring either back, add its
  loader here, put its variable back on <html>, and repoint the matching token
  in app/globals.css.
*/
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Techcadd Jalandhar — IT Courses, Training & Placement",
    // Course pages set their own full title; anything else inherits the brand.
    template: "%s | Techcadd",
  },
  description:
    "Techcadd is an IT company and technology institute in Jalandhar — AI, data, cloud, cybersecurity, full-stack and digital marketing courses with live projects, internship letters and placement support.",
  keywords: [
    "Techcadd",
    "IT institute in Jalandhar",
    "computer course in Jalandhar",
    "digital marketing course Jalandhar",
    "industrial training Jalandhar",
    "placement course Jalandhar",
    "Jalandhar",
    "Punjab",
  ],
  alternates: { canonical: SITE.url },
  openGraph: {
    title: "Techcadd Jalandhar — IT Courses, Training & Placement",
    description:
      "AI, cloud, cybersecurity, full-stack and digital marketing courses in Jalandhar, with live projects and placement support.",
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
      suppressHydrationWarning is required, not cosmetic: the inline script
      below adds `reveal-ready` to <html> during parsing, so the class attribute
      React hydrates against is already different from the one it rendered.
      Scoped to this element only — children still warn normally.
    */
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body>
        {/* Organisation identity, emitted once for the whole site. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organisationSchema()) }}
        />

        {/* Arms the reveal styles during HTML parsing, before anything paints.
            Waiting for ScrollReveal's effect would let above-the-fold blocks
            render, then blink out as the class landed. Inline and script-gated,
            so a no-JS visit still gets the plain, fully visible page. */}
        {/* The second statement makes a reload start at the top of the page.
            Browsers restore the previous scroll offset on reload by default,
            and that restore happens after this script runs — so it has to be
            switched off here rather than undone later with a scrollTo, which
            would show the old position first and then jump.

            Anchors are left alone: with `manual` set, a URL carrying a #hash is
            still scrolled to its target by the browser. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("reveal-ready");if("scrollRestoration" in history)history.scrollRestoration="manual"`,
          }}
        />
        {/* Covers the gap between a link click and the new route committing —
            after which the per-segment loading.tsx skeletons take over. */}
        <NavProgress />

        {/*
          Navbar and Footer live here rather than in each page. They are
          identical on every route, so rendering them per-page meant every
          client-side navigation re-sent the whole nav — six menus, ~60 links —
          and the footer in the RSC payload, then remounted them. In the layout
          they render once and persist, so a navigation only ships the page.

          SiteChrome drops the lot on /admin, which is an internal tool rather
          than a page of the site: a marketing navbar, an enquiry popup and a
          brand preloader all belong to the public visit, not to someone
          reading the enquiries those forms produced.
        */}
        <SiteChrome>
          <Preloader />
          <Navbar />
        </SiteChrome>
        {children}
        <SiteChrome>
          <Footer />
          <EnquiryPopup />
          <CookieConsent />
          <ScrollToTop />
          <ScrollReveal />
          <CursorFollower />
        </SiteChrome>
      </body>
    </html>
  )
}
