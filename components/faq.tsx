import { Container } from "./container"
import { FaqAccordion } from "./faq-accordion"
import { ScrollHeading } from "./scroll-heading"
import { FAQS } from "@/lib/faqs"

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

        <FaqAccordion items={FAQS} columns={2} className="mt-12 lg:mt-16" />
      </Container>
    </section>
  )
}
