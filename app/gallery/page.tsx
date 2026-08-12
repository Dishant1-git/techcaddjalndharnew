import type { Metadata } from "next"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { GalleryWall } from "@/components/gallery-wall"
import { GALLERY_TILES } from "@/lib/gallery"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Gallery — Inside the Techcadd Jalandhar Centre",
  description:
    "Classrooms, labs, live projects, workshops and placement drives — a look inside the Techcadd centre in Jalandhar.",
  alternates: { canonical: `${SITE.url}/gallery` },
}

export default function GalleryPage() {
  return (
    <main>
      <section
        data-cursor="light"
        className="bg-ink pt-32 pb-14 text-white lg:pt-40 lg:pb-16"
      >
        <Container>
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            Gallery
          </span>

          <h1
            data-reveal
            className="mt-7 max-w-3xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            Inside the <span className="text-white">classrooms, labs</span> and{" "}
            <span className="text-white">live projects.</span>
          </h1>

          <p
            data-reveal
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 lg:text-lg"
          >
            Hover a tile to bring it forward — the wall drifts on its own, and
            follows your pointer.
          </p>
        </Container>
      </section>

      {/*
        The wall, starting immediately after the hero.

        No coloured band and no heading strip above it: the photographs now sit
        at full brightness, so the boundary with the ink hero is obvious on its
        own and does not need a divider to announce it.

        The height is explicit because DriftWall is `height: 100%` — given an
        auto-height parent it would collapse to nothing. `min-h` keeps it usable
        on a short window where 78vh is only a few hundred pixels.
      */}
      <section className="h-[78vh] max-h-[900px] min-h-[520px] w-full overflow-hidden">
        <GalleryWall tiles={GALLERY_TILES} />
      </section>

      <Cta />
    </main>
  )
}
