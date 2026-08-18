import type { Metadata } from "next"
import Link from "next/link"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { FaqAccordion } from "@/components/faq-accordion"
import { loadFaqCategories, loadFaqs } from "@/lib/content"
import { CONTACT } from "@/lib/navigation"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "FAQ — Admissions, Fees, Batches and Placement",
  description:
    "Answers to the questions our Jalandhar centre is asked most — enrolling, batch timings, fees and instalments, placement support and certification.",
  alternates: { canonical: `${SITE.url}/faq` },
}

export default async function FaqPage() {
  const [faqs, categories] = await Promise.all([loadFaqs(), loadFaqCategories()])

  return (
    <main>
      <section
        data-cursor="light"
        className="bg-ink pt-32 pb-14 text-white lg:pt-40 lg:pb-16"
      >
        <Container>
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            FAQ
          </span>

          <h1
            data-reveal
            className="mt-7 max-w-3xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            <span className="text-white">Questions</span> we are asked, and{" "}
            <span className="text-white">straight answers.</span>
          </h1>

          <p
            data-reveal
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 lg:text-lg"
          >
            Admissions, batches, fees, placement and certification. If something
            is not covered here, the centre will answer it on the phone.
          </p>
        </Container>
      </section>

      {/*
        Grouped by topic rather than one long list. Each category renders its own
        accordion, which also means each keeps its own open item — a single
        accordion across thirty questions would close your place every time you
        opened something in a different section.
      */}
      <section className="py-16 lg:py-24">
        <Container>
          {/* Nothing in the CMS.

              The questions come from it and have no checked-in stand-ins, so an
              empty CMS means no accordions. The "Still not sure?" panel below
              stays either way — with nothing above it, it stops being a
              footnote and becomes the answer to the page. */}
          {faqs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-subtle/50 px-6 py-16 text-center">
              <p className="font-display text-xl font-bold tracking-tight">
                No questions published yet.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                Nothing here yet — but the centre answers all of this on the
                phone, and there is no charge for asking.
              </p>
            </div>
          )}

          <div className="space-y-14 lg:space-y-20">
            {categories.map((category) => {
              const items = faqs.filter((faq) => faq.category === category)
              // A category with nothing in it renders nothing, so the page
              // cannot show an empty heading if the data is edited later.
              if (!items.length) return null

              return (
                <div key={category}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h2
                      data-reveal
                      className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl"
                    >
                      {category}
                    </h2>
                    <span className="font-mono text-xs text-muted">
                      {String(items.length).padStart(2, "0")}
                    </span>
                  </div>

                  <FaqAccordion
                    items={items}
                    columns={2}
                    className="mt-6 lg:mt-8"
                  />
                </div>
              )
            })}
          </div>

          {/* The honest end of an FAQ: the list is never complete. */}
          <div className="mt-16 rounded-2xl border border-line bg-subtle p-8 text-center lg:mt-20 lg:p-10">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink lg:text-2xl">
              Still not sure?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted lg:text-base">
              Course choice, batch timing and fees are easier to settle in one
              conversation than by reading. Counselling is free and there is no
              registration charge.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={CONTACT.phoneHref}
                className="inline-flex h-12 items-center justify-center rounded-full bg-brand-600 px-7 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-700"
              >
                Call {CONTACT.phone}
              </a>
              {/* `<Link>`, not `<a>`: an anchor to an internal route drops out
                  of the client router and reloads the whole document. */}
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-white px-7 text-sm font-semibold text-foreground transition-colors duration-300 hover:border-brand-600/40 hover:text-brand-600"
              >
                Book a free demo
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Cta />
    </main>
  )
}
