import type { Metadata } from "next"
import { Container } from "@/components/container"
import { PanelTexture } from "@/components/panel-texture"
import { SITE } from "@/lib/site"
import { loadContact } from "@/lib/content"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What techcadd collects when you use this website, why, and how to have it removed.",
  alternates: { canonical: `${SITE.url}/privacy` },
  robots: { index: true, follow: true },
}

/*
  IMPORTANT — this page needs a legal review before launch.

  Everything below describes what the code in this repository actually does:
  the fields app/api/enquiry collects, the IP address lib/request-guard reads
  for rate limiting, and the two browser storage keys the site writes. Nothing
  here is boilerplate copied from another policy, and nothing claims a practice
  the code does not have.

  It is not legal advice and it is not complete as a compliance document — a
  retention period, a named grievance contact and the lawful basis for
  processing are business decisions nobody has made in code. Have a lawyer
  confirm it against how enquiries are actually handled inside the business
  before relying on it.

  Keep it in step with the code: if analytics, a pixel or an embedded player is
  ever added, "Cookies and site storage" below stops being true the day it ships.
*/

const UPDATED = "14 August 2026"

const SECTIONS = [
  {
    title: "What we collect, and when",
    body: [
      "We collect nothing until you send it. Reading these pages does not create an account, and there is no login on this site.",
      "When you submit an enquiry, a brochure request or the contact form, we receive the fields on that form — your name, phone number, and depending on the form your email address, postal address and the course you asked about. We also record which page you sent it from, so a counsellor knows what you were reading.",
      "Every submission is checked by an arithmetic security question before it reaches us. The challenge and your answer are used once, to confirm the form was filled in by a person, and are not kept afterwards.",
    ],
  },
  {
    title: "Your IP address",
    body: [
      "Our servers see the IP address your request arrives from, as every web server does. We use it to limit how many enquiries and security challenges a single source can send in a short window, which is what keeps the enquiry inbox usable.",
      "It is stored alongside the enquiry it came with. It is not used to build a profile of you and it is not shared for advertising.",
    ],
  },
  {
    title: "Cookies and site storage",
    body: [
      "This site sets no advertising or analytics cookies. It runs no third-party trackers.",
      "It does keep two small values in your own browser: the choice you make on the cookie notice, so you are not asked again, and a note that the enquiry popup has already been shown to you in this tab, so it does not reappear. Both stay on your device, are readable only by this site, and are cleared when you clear your browser data.",
      "Choosing Reject on the notice does not reduce anything the site does today, because there is nothing non-essential to switch off. It is recorded so that anything added later stays off for you.",
    ],
  },
  {
    title: "What we do with an enquiry",
    body: [
      "A counsellor uses it to contact you about the course you asked about — by phone, WhatsApp or email. That is the only reason we ask for it.",
      "We do not sell enquiry data, and we do not pass it to other institutes or to advertisers.",
    ],
  },
  {
    title: "Embedded content",
    body: [
      "Some pages embed a map from Google and videos from YouTube. When one of those loads, the provider receives your IP address and can set its own cookies under its own policy — we have no control over that and cannot see it. Videos are embedded through YouTube's no-cookie domain, which limits what it stores until you press play.",
    ],
  },
  {
    title: "Having your details removed",
    body: [
      "Ask us and we will delete your enquiry. Write to the email address below from the address you used, or call the centre and ask for the details you gave to be removed.",
    ],
  },
]

export default async function PrivacyPage() {
  const contact = await loadContact()

  return (
    <main>
      <section
        data-cursor="light"
        className="relative isolate overflow-hidden bg-ink pt-32 pb-16 text-white lg:pt-40 lg:pb-20"
      >
        <PanelTexture />

        <Container className="relative">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            Legal
          </span>

          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance lg:text-6xl">
            Privacy Policy
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            What this website collects when you use it, why it is collected, and
            how to have it removed. Last updated {UPDATED}.
          </p>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="max-w-3xl space-y-12">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((para) => (
                    <p
                      key={para}
                      className="text-base leading-relaxed text-muted"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-line bg-subtle p-6">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                Contact
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {SITE.legalName}
                <br />
                {contact.street}, {contact.locality}, {contact.region} {contact.postalCode}
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted">
                <a
                  href={`mailto:${contact.email}`}
                  className="font-medium text-brand-600 underline underline-offset-2"
                >
                  {contact.email}
                </a>
                {" · "}
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="font-medium text-brand-600 underline underline-offset-2"
                >
                  {contact.phone}
                </a>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  )
}
