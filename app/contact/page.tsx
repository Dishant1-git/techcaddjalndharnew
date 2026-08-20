import type { Metadata } from "next"
import { Container } from "@/components/container"
import { EnquireButton } from "@/components/enquire-button"
import { PanelTexture } from "@/components/panel-texture"
import { ScrollHeading } from "@/components/scroll-heading"
import { SupportAssistance } from "@/components/support-assistance"
import { SITE } from "@/lib/site"
import { loadContact, type Contact } from "@/lib/content"

/**
 * Built rather than declared, so the number in the search snippet is the one
 * the CMS holds. A stale number here is worse than most: it is what someone
 * dials straight from the results page, without ever opening the site.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { phone } = await loadContact()

  return {
    title: "Contact techcadd Jalandhar — Batches, Fees & Free Demo Class",
    description: `Talk to a techcadd counsellor in Jalandhar about course fees, batch timings and placement support. Call ${phone} or book a free demo class.`,
    alternates: { canonical: `${SITE.url}/contact` },
  }
}

/*
  The support desks, and who answers each one.

  TODO: `name`, and the per-desk `phone`, are the two fields that want real
  values. Both currently fall back to the centre's main line from lib/site.ts,
  which is correct but not specific — a direct number reaches the right person
  without a transfer. Put the actual name and extension in here and nothing
  else needs to change.
*/
const supportDesks = (contact: Contact) => [
  {
    id: "student",
    label: "Student Support",
    blurb: "Academic guidance & career counselling",
    icon: "student" as const,
    name: "Student Desk",
    phone: contact.phone,
    email: contact.email,
    location: "techcadd Jalandhar Campus",
  },
  {
    id: "college",
    label: "College Support",
    blurb: "Institution partnerships & collaborations",
    icon: "college" as const,
    name: "Partnerships Desk",
    phone: contact.phone,
    email: contact.email,
    location: "techcadd Jalandhar Campus",
  },
]

export default async function ContactPage() {
  const contact = await loadContact()
  const SUPPORT_DESKS = supportDesks(contact)

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
              a business, and we will tell you honestly which track fits and
              which does not.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {/* Opens the enquiry popup again. It used to scroll to a form
                  further down this page, on the grounds that a modal copy of a
                  form already on screen is two answers to one question — but
                  that form is gone, so the anchor pointed at nothing. */}
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
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-sm font-medium backdrop-blur-md transition-colors duration-300 hover:bg-white/15"
              >
                Call {contact.phone}
              </a>
            </div>
          </Container>
        </section>

        {/* --- Support & Assistance ---
            Replaces "What people call us about", which listed reasons to ring
            without saying who picks up. This answers the harder half: which
            desk you want, and how to reach it. */}
        <section className="bg-subtle py-20 lg:py-28">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <ScrollHeading
                lines={["Support & Assistance"]}
                as="h2"
                className="font-display text-3xl leading-[1.05] font-bold tracking-tight text-brand-600 lg:text-4xl"
              />
              <p className="mt-4 text-base leading-relaxed text-muted">
                Get personalised support for your educational journey.
              </p>
            </div>

            <div data-reveal suppressHydrationWarning className="mt-12">
              <SupportAssistance desks={SUPPORT_DESKS} />
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}
