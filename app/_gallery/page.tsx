import type { Metadata } from "next"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { GalleryMarquee } from "@/components/gallery-marquee"
import { loadGalleryTiles } from "@/lib/content"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Gallery — Inside the Techcadd Jalandhar Centre",
  description:
    "Classrooms, labs, live projects, workshops and placement drives — a look inside the Techcadd centre in Jalandhar.",
  alternates: { canonical: `${SITE.url}/gallery` },
}

export default async function GalleryPage() {
  const tiles = await loadGalleryTiles()

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
            suppressHydrationWarning
            className="mt-7 max-w-3xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            Inside the <span className="text-white">classrooms, labs</span> and{" "}
            <span className="text-white">live projects.</span>
          </h1>

          <p
            data-reveal
            suppressHydrationWarning
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 lg:text-lg"
          >
            Hover a tile to bring it forward — the wall drifts on its own, and
            follows your pointer.
          </p>
        </Container>
      </section>

      {/*
        Four horizontal lanes, alternating direction.

        The section carries its own vertical padding rather than the lanes
        doing it: the marquee is full-bleed and its fade mask runs to the
        viewport edge, so any spacing put inside would be cropped by it.
      */}
      <section className="py-16 lg:py-24">
        <Container>
          <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
            Life at Techcadd
          </p>

          <h2
            data-reveal
            className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
          >
            Our Gallery
          </h2>
        </Container>

        {/* Outside the Container, so the lanes run the full width of the
            viewport rather than the 1304px content column. */}
        <div className="mt-10 lg:mt-14">
          <GalleryMarquee tiles={tiles} />
        </div>
      </section>

      <Cta />
    </main>
  )
}
