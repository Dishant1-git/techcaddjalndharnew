import { Container } from "./container"
import { FaqAccordion } from "./faq-accordion"
import { ScrollHeading } from "./scroll-heading"
import Link from "next/link"
import { HOMEPAGE_FAQS } from "@/lib/faqs"

export function Faq() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <Container>
        <div className="max-w-3xl">
          <ScrollHeading
            lines={["Frequently", "asked questions"]}
            className="font-display text-4xl leading-[1.05] font-bold tracking-tight lg:text-5xl"
          />

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted lg:text-lg">
            Find quick answers to common questions about our courses, batches,
            fees and placement support.
          </p>
        </div>

        {/* The six most-asked. The rest live on /faq, grouped by topic. */}
        <FaqAccordion items={HOMEPAGE_FAQS} columns={2} className="mt-12 lg:mt-16" />

        <Link
          href="/faq"
          className="group mt-10 inline-flex items-center gap-3 rounded-full border border-line bg-white py-2 pr-2 pl-7 text-sm font-semibold transition-colors duration-300 hover:border-brand-600/30 hover:text-brand-600"
        >
          See all questions
          <span className="grid size-9 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </Container>
    </section>
  )
}
