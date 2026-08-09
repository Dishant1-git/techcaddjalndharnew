import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import { CursorFollower } from "@/components/cursor-follower"
import { Preloader } from "@/components/preloader"
import { ScrollReveal } from "@/components/scroll-reveal"
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
  title: "TechCadd — The IT platform to build and ship",
  description:
    "TechCadd is an IT company and technology institute delivering AI, cloud, cybersecurity and full-stack engineering — plus the training that builds the teams behind it.",
  keywords: [
    "TechCadd",
    "IT company",
    "AI development",
    "software development",
    "cybersecurity",
    "industrial training",
    "Jalandhar",
    "Mohali",
  ],
  openGraph: {
    title: "TechCadd — The IT platform to build and ship",
    description:
      "AI, cloud, cybersecurity and full-stack engineering, delivered end to end.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
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
        <ScrollReveal />
        <CursorFollower />
      </body>
    </html>
  )
}
