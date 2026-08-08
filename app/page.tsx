import { About } from "@/components/about"
import { Faq } from "@/components/faq"
import { Footer } from "@/components/footer"
import { FeaturedCourses } from "@/components/featured-courses"
import { Hero } from "@/components/hero"
import { Navbar } from "@/components/navbar"
import { Stats } from "@/components/stats"
import { Technologies } from "@/components/technologies"
import { Testimonials } from "@/components/testimonials"

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

        <Stats />

        <About />

        <FeaturedCourses />

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

        <Testimonials />

        <Faq />
      </main>

      <Footer />
    </>
  )
}
