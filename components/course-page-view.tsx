import Link from "next/link"
import { Container } from "./container"
import { CourseEnquiryForm } from "./course-enquiry-form"
import { EnquireButton } from "./enquire-button"
import { PanelTexture } from "./panel-texture"
import { RichText } from "./rich-text"
import { ScrollHeading } from "./scroll-heading"
import { hrefFor, type CoursePage } from "@/lib/course-pages"

/**
 * One template for every course, internship and after-12th page.
 *
 * Sections render only when their content exists, so a page authored up to
 * "Overview" is complete rather than half-broken — later stages light up as
 * they land in the registry.
 */
export function CoursePageView({ page }: { page: CoursePage }) {
  const self = hrefFor(page)

  return (
    <article>
      {/* --- Hero --- */}
      <section
        data-cursor="light"
        className="relative isolate overflow-hidden bg-ink pt-32 pb-16 text-white lg:pt-40 lg:pb-20"
      >
        <PanelTexture />

        <Container className="relative">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-white/55">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/${page.segment}`}
                  className="capitalize transition-colors hover:text-white"
                >
                  {page.segment.replace(/-/g, " ")}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white/80">{page.eyebrow}</li>
            </ol>
          </nav>

          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            {page.eyebrow}
          </span>

          <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance lg:text-6xl">
            {page.h1}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            {page.intro}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <EnquireButton className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-7 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-brand-50">
              Book a free demo class
              <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowIcon />
              </span>
            </EnquireButton>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-sm font-medium backdrop-blur-md transition-colors duration-300 hover:bg-white/15"
            >
              Talk to a counsellor
            </Link>
          </div>

          <dl className="mt-12 grid gap-x-8 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {page.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="font-mono text-xs tracking-[0.14em] text-white/45 uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-1.5 font-display text-lg font-bold tracking-tight">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* --- Overview --- */}
      {page.overview && (
        <Section id="overview">
          <SectionHead eyebrow="Overview" lines={["Course overview"]} />
          <Prose>
            {page.overview.map((para, i) => (
              <RichText
                key={i}
                text={para}
                exclude={self}
                className="text-base leading-relaxed text-muted lg:text-lg"
              />
            ))}
          </Prose>
        </Section>
      )}

      {/* --- Who can do this --- */}
      {page.whoCanDo && (
        <Section id="who-can-do" tinted>
          <SectionHead
            eyebrow="Eligibility"
            lines={["Who can do", "this course"]}
          />
          {page.whoCanDo.intro && (
            <Prose>
              <RichText
                text={page.whoCanDo.intro}
                exclude={self}
                className="text-base leading-relaxed text-muted lg:text-lg"
              />
            </Prose>
          )}
          {page.whoCanDo.groups && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {page.whoCanDo.groups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-2xl border border-line bg-white p-6"
                >
                  <h3 className="font-display text-lg font-bold tracking-tight">
                    {group.title}
                  </h3>
                  <RichText
                    text={group.body}
                    exclude={self}
                    className="mt-2 text-sm leading-relaxed text-muted"
                  />
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* --- Why this program --- */}
      {page.whyProgram && (
        <Section id="why-this-program">
          <SectionHead
            eyebrow="The case for it"
            lines={["Why this programme", "is worth your year"]}
          />
          <Prose>
            {page.whyProgram.map((para, i) => (
              <RichText
                key={i}
                text={para}
                exclude={self}
                className="text-base leading-relaxed text-muted lg:text-lg"
              />
            ))}
          </Prose>
        </Section>
      )}

      {/* --- Why Techcadd --- */}
      {page.whyTechcadd && (
        <Section id="why-techcadd" dark>
          <SectionHead
            eyebrow="Why Techcadd"
            lines={["Why students choose", "Techcadd"]}
            dark
          />
          {page.whyTechcadd.intro && (
            <Prose>
              <RichText
                text={page.whyTechcadd.intro}
                exclude={self}
                className="text-base leading-relaxed text-white/70 lg:text-lg"
              />
            </Prose>
          )}
          {page.whyTechcadd.points && (
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {page.whyTechcadd.points.map((point) => (
                <div
                  key={point.title}
                  className="border-t border-white/15 pt-5"
                >
                  <h3 className="font-display text-lg font-bold tracking-tight">
                    {point.title}
                  </h3>
                  <RichText
                    text={point.body}
                    exclude={self}
                    className="mt-2 text-sm leading-relaxed text-white/60"
                  />
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* --- What you will learn --- */}
      {page.learn && (
        <Section id="what-you-will-learn" tinted>
          <SectionHead
            eyebrow="Syllabus"
            lines={["What you will learn", "and the tools you will use"]}
          />
          {page.learn.intro && (
            <Prose>
              <RichText
                text={page.learn.intro}
                exclude={self}
                className="text-base leading-relaxed text-muted lg:text-lg"
              />
            </Prose>
          )}

          {page.learn.modules && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {page.learn.modules.map((module, i) => (
                <div
                  key={module.title}
                  className="rounded-2xl border border-line bg-white p-6"
                >
                  <span className="font-mono text-xs text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold tracking-tight">
                    {module.title}
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {module.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2 text-sm leading-relaxed text-muted"
                      >
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-brand-600" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {page.learn.tools && (
            <div className="mt-8 flex flex-wrap gap-2.5">
              {page.learn.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* --- Reviews --- */}
      {page.reviews && (
        <Section id="reviews">
          <SectionHead
            eyebrow="Student reviews"
            lines={["What our students", "in Jalandhar say"]}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.reviews.map((review) => (
              <figure
                key={review.name}
                className="flex flex-col justify-between rounded-2xl border border-line bg-white p-6"
              >
                <div>
                  <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <StarIcon key={i} />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-foreground/85">
                    {review.quote}
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-600 to-accent-500 font-display text-xs font-bold text-white"
                  >
                    {review.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold tracking-tight">
                      {review.name}
                    </span>
                    <span className="block text-xs text-muted">
                      {review.role} · {review.city}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {/* --- FAQs --- */}
      {page.faqs && (
        <Section id="faqs" tinted>
          <SectionHead
            eyebrow="FAQs"
            lines={["Frequently", "asked questions"]}
          />
          <div className="mt-10 divide-y divide-line border-y border-line">
            {page.faqs.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-base font-bold tracking-tight lg:text-lg">
                  {faq.q}
                  <span className="mt-1 shrink-0 font-mono text-base text-muted transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <RichText
                  text={faq.a}
                  exclude={self}
                  className="mt-3 max-w-3xl text-sm leading-relaxed text-muted lg:text-base"
                />
              </details>
            ))}
          </div>
        </Section>
      )}

      {/* --- Enquiry --- */}
      <Section id="enquiry" tinted>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div>
            <SectionHead
              eyebrow="Course Information"
              lines={["Ask about", `${page.eyebrow}`]}
            />
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted">
              Send your question and a counsellor will call you back — batch
              timings, fees, EMI options, placement record, or whether this
              course fits your degree. No obligation, and no registration fee to
              sit in on a demo class.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Free counselling and demo class",
                "Weekday, evening and weekend batches",
                "Internship letter and placement support",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-muted">
                  <span className="mt-1.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-600/10 text-brand-600">
                    <svg viewBox="0 0 24 24" fill="none" className="size-2.5" aria-hidden="true">
                      <path
                        d="m5 12.5 4.5 4.5L19 7.5"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* The course is fixed by the page it is rendered on. */}
          <CourseEnquiryForm course={page.eyebrow} source={self} />
        </div>
      </Section>

      {/* --- Related --- */}
      {page.related && page.related.length > 0 && (
        <Section id="related">
          <SectionHead eyebrow="Explore more" lines={["Related courses"]} />
          <div className="mt-10 flex flex-wrap gap-3">
            {page.related.map((href) => (
              <Link
                key={href}
                href={href}
                className="group inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium capitalize transition-colors duration-300 hover:border-brand-600/30 hover:text-brand-600"
              >
                {href.split("/").pop()?.replace(/-/g, " ")}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </article>
  )
}

function Section({
  id,
  children,
  tinted = false,
  dark = false,
}: {
  id: string
  children: React.ReactNode
  tinted?: boolean
  dark?: boolean
}) {
  return (
    <section
      id={id}
      data-cursor={dark ? "light" : undefined}
      className={`relative px-4 py-16 lg:px-8 lg:py-24 ${
        dark ? "isolate overflow-hidden bg-ink text-white" : tinted ? "bg-subtle" : ""
      }`}
    >
      {dark && <PanelTexture />}
      <Container className="relative">{children}</Container>
    </section>
  )
}

function SectionHead({
  eyebrow,
  lines,
  dark = false,
}: {
  eyebrow: string
  lines: string[]
  dark?: boolean
}) {
  return (
    <div className="max-w-2xl">
      <span
        className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium tracking-wide ${
          dark
            ? "border border-white/25 bg-white/10 backdrop-blur-md"
            : "border border-line bg-white"
        }`}
      >
        {eyebrow}
      </span>
      <ScrollHeading
        lines={lines}
        className="mt-6 font-display text-3xl leading-[1.05] font-bold tracking-tight sm:text-4xl lg:text-5xl"
      />
    </div>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 max-w-3xl space-y-5">{children}</div>
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M5 12h14m-7-7 7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-amber-400" aria-hidden="true">
      <path d="m12 17.27 5.18 3.13-1.37-5.89 4.57-3.96-6.02-.52L12 4.5 9.64 10.03l-6.02.52 4.57 3.96-1.37 5.89L12 17.27Z" />
    </svg>
  )
}
