import { Hero } from "@/components/hero"
import { Navbar } from "@/components/navbar"
import { Technologies } from "@/components/technologies"
import { CONTACT, NAV_ITEMS, QUICK_LINKS } from "@/lib/navigation"

const CAPABILITIES = [
  {
    index: "01",
    title: "AI & Machine Learning",
    body: "Models, agents and data pipelines built for production — not for the demo.",
  },
  {
    index: "02",
    title: "Full-Stack Engineering",
    body: "MERN, MEAN and PHP stacks delivered end to end, from schema to deploy.",
  },
  {
    index: "03",
    title: "Cloud & Cybersecurity",
    body: "Hardened infrastructure, ethical-hacking audits and cloud migration.",
  },
  {
    index: "04",
    title: "Training & Internships",
    body: "45-day, 6-week and 6-month industrial programmes with placement support.",
  },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <Technologies />

        <section id="capabilities" className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="mb-16 lg:mb-24">
              <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted">
                <span className="h-px w-8 bg-foreground/30" />
                Capabilities
              </span>
              <h2 className="font-display text-4xl font-semibold tracking-tight lg:text-6xl">
                Everything you need to ship.
                <br />
                <span className="text-muted">Nothing you don&apos;t.</span>
              </h2>
            </div>

            <div>
              {CAPABILITIES.map((c) => (
                <div
                  key={c.index}
                  className="group flex flex-col gap-6 border-b border-foreground/10 py-12 lg:flex-row lg:gap-16 lg:py-16"
                >
                  <span className="shrink-0 font-mono text-sm text-muted">
                    {c.index}
                  </span>
                  <div className="grid flex-1 items-center gap-6 lg:grid-cols-2 lg:gap-12">
                    <h3 className="font-display text-3xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
                      {c.title}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/10 bg-subtle py-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight">
                Tech<span className="text-brand-600">cadd</span>
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                Tell us your goal. We&apos;ll code it into reality.
              </p>
              <div className="mt-5 flex flex-col gap-1 font-mono text-sm">
                <a href={CONTACT.phoneHref} className="hover:text-brand-600">
                  {CONTACT.phone}
                </a>
                <a href={CONTACT.emailHref} className="hover:text-brand-600">
                  {CONTACT.email}
                </a>
              </div>
            </div>

            <FooterCol title="Navigate" links={NAV_ITEMS} />
            <FooterCol title="Quick links" links={QUICK_LINKS} />
          </div>

          <p className="mt-14 border-t border-foreground/10 pt-6 font-mono text-xs text-muted">
            © {new Date().getFullYear()} TechCadd. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: readonly { label: string; href: string }[]
}) {
  return (
    <div>
      <p className="mb-4 font-mono text-xs tracking-wide text-muted uppercase">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="text-sm text-foreground/70 transition-colors hover:text-brand-600"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
