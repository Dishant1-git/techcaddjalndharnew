import type { Metadata } from "next"
import { Container } from "@/components/container"
import { EnquireButton } from "@/components/enquire-button"
import { PanelTexture } from "@/components/panel-texture"
import { ScrollHeading } from "@/components/scroll-heading"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact Techcadd Jalandhar — Batches, Fees & Free Demo Class",
  description:
    "Talk to a Techcadd counsellor in Jalandhar about course fees, batch timings and placement support. Call +91 98881 22255 or book a free demo class.",
  alternates: { canonical: `${SITE.url}/contact` },
}

const HOURS = [
  { day: "Monday – Saturday", time: "9:00 am – 7:00 pm" },
  { day: "Sunday", time: "Weekend batches only" },
]

const REASONS = [
  {
    title: "Course counselling",
    body: "Compare tracks against your degree, stream and the job you actually want. No obligation, and no fee to sit with a counsellor.",
  },
  {
    title: "Fees and EMI",
    body: "Ask for the current fee sheet for any course. Instalment options are available on the longer programmes.",
  },
  {
    title: "Batch timings",
    body: "Weekday, evening and weekend batches run in parallel. Tell us your college or work schedule and we will find the slot that fits.",
  },
  {
    title: "Placement and internships",
    body: "Questions about the placement cell, hiring partners or the internship letter go straight to the team that runs them.",
  },
]

export default function ContactPage() {
  return (
    <>
      <main>
        {/* --- Hero --- */}
        <section
          data-cursor="light"
          className="relative isolate overflow-hidden bg-ink pt-32 pb-16 text-white lg:pt-40 lg:pb-20"
        >
          <PanelTexture />

          <Container className="relative">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
              Contact
            </span>

            <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance lg:text-6xl">
              Talk to a counsellor in Jalandhar
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
              Tell us where you are — 12th pass, mid-degree, working, or running
              a business — and we will tell you honestly which track fits and
              which does not.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <EnquireButton className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-7 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-brand-50">
                Book a free demo class
                <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                  <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
                    <path
                      d="M5 12h14m-7-7 7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </EnquireButton>

              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-sm font-medium backdrop-blur-md transition-colors duration-300 hover:bg-white/15"
              >
                Call {SITE.phone}
              </a>
            </div>
          </Container>
        </section>

        {/* --- NAP + hours --- */}
        <section className="py-20 lg:py-28">
          <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <ScrollHeading
                lines={["Visit the", "Jalandhar centre"]}
                className="font-display text-3xl leading-[1.05] font-bold tracking-tight lg:text-4xl"
              />

              <dl className="mt-8 space-y-6">
                <div className="border-l-2 border-brand-600/25 pl-4">
                  <dt className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
                    Phone
                  </dt>
                  <dd className="mt-1.5">
                    <a
                      href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                      className="font-display text-xl font-bold tracking-tight transition-colors hover:text-brand-600"
                    >
                      {SITE.phone}
                    </a>
                  </dd>
                </div>

                <div className="border-l-2 border-brand-600/25 pl-4">
                  <dt className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
                    Email
                  </dt>
                  <dd className="mt-1.5">
                    <a
                      href={`mailto:${SITE.email}`}
                      className="font-display text-xl font-bold tracking-tight transition-colors hover:text-brand-600"
                    >
                      {SITE.email}
                    </a>
                  </dd>
                </div>

                <div className="border-l-2 border-brand-600/25 pl-4">
                  <dt className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
                    Opening hours
                  </dt>
                  <dd className="mt-1.5 space-y-1">
                    {HOURS.map((h) => (
                      <span key={h.day} className="block text-sm text-muted">
                        <strong className="font-semibold text-foreground">
                          {h.day}
                        </strong>{" "}
                        · {h.time}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 rounded-2xl border border-line bg-subtle p-6">
                <p className="font-display text-base font-bold tracking-tight">
                  Areas we serve
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {SITE.areasServed.join(" · ")}
                </p>
              </div>
            </div>

            <div>
              <ScrollHeading
                lines={["What people", "call us about"]}
                className="font-display text-3xl leading-[1.05] font-bold tracking-tight lg:text-4xl"
              />

              <div className="mt-8 divide-y divide-line border-y border-line">
                {REASONS.map((reason) => (
                  <div key={reason.title} className="py-6">
                    <h3 className="font-display text-lg font-bold tracking-tight">
                      {reason.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {reason.body}
                    </p>
                  </div>
                ))}
              </div>

              <EnquireButton className="group mt-8 inline-flex items-center gap-3 rounded-full bg-brand-600 py-2 pr-2 pl-7 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.85)] transition-colors duration-300 hover:bg-brand-700">
                Send an enquiry
                <span className="grid size-8 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
                  <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
                    <path
                      d="M5 12h14m-7-7 7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </EnquireButton>
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}
