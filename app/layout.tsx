import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import { CursorFollower } from "@/components/cursor-follower"
import { EnquiryPopup } from "@/components/enquiry-popup"
import { Preloader } from "@/components/preloader"
import { ScrollReveal } from "@/components/scroll-reveal"
import { organisationSchema, SITE } from "@/lib/site"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/* Organisation identity, emitted once for the whole site. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organisationSchema()),
          }}
        />

        {/* Arms the reveal styles during HTML parsing, before anything paints.
            Waiting for ScrollReveal's effect would let above-the-fold blocks
            render, then blink out as the class landed. Inline and script-gated,
            so a no-JS visit still gets the plain, fully visible page. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("reveal-ready")`,
          }}
        />
        <Preloader />
        {children}
        <EnquiryPopup />
        <ScrollReveal />
        <CursorFollower />
      </body>
    </html>
  )
}
