import Link from "next/link"
import { Container } from "./container"
import { CourseEnquiryForm } from "./course-enquiry-form"
import { EnquireButton } from "./enquire-button"
import { FaqAccordion } from "./faq-accordion"
import { ModuleComparison } from "./module-comparison"
import { ModuleTracks } from "./module-tracks"
import { ReviewMarquee } from "./review-marquee"
import { PanelTexture } from "./panel-texture"
import { PrefetchLink } from "./prefetch-link"
import { RichText } from "./rich-text"
import { ScrollHeading } from "./scroll-heading"
import { ToolMesh } from "./tool-mesh"
import { VideoDialog } from "./video-dialog"
import { hrefFor, type CoursePage } from "@/lib/course-pages"
import { CONTACT } from "@/lib/navigation"

/**
 * Explicit placement for the first four cards: two stacked in column one, two
 * full-height beside them. Auto-placement fills row-wise and would put the
 * second card next to the first instead of under it.
 */
const PROJECT_PLACEMENT = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-2 lg:row-span-2",
  "lg:col-start-3 lg:row-span-2",
]

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
        <PanelTexture variant="aurora" />

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

      {/* --- 1. Overview, full width --- */}
      {page.overview && (
        <Section id="overview">
          <SectionHead eyebrow="Overview" lines={["Course overview"]} />
          {/* One short paragraph, running the full width of the section — no
              column split and no narrow measure to divide it across. It sizes
              up a step because it is the only copy in the block. */}
          <div className="mt-10 space-y-5">
            {page.overview.map((para, i) => (
              <RichText
                key={i}
                text={para}
                exclude={self}
                className="text-lg leading-relaxed text-muted lg:text-xl"
              />
            ))}
          </div>
        </Section>
      )}

      {/* --- 2. Video walkthrough --- */}
      {page.video && (
        <section
          data-cursor="light"
          className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28"
        >
          <PanelTexture variant="aurora" />
          <Container className="relative">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
                Watch first
              </span>
              <ScrollHeading
                lines={["See the course", "before you enrol"]}
                className="mt-6 font-display text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-5xl"
              />
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/65">
                A short walkthrough of the labs, the trainers and a live batch in
                session — so you know what you are signing up for.
              </p>
            </div>

            <div className="relative mx-auto mt-12 grid aspect-video max-w-4xl place-items-center overflow-hidden rounded-[1.75rem] border border-white/15 bg-linear-to-br from-brand-700 via-ink to-brand-900">
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.35),transparent_60%)]"
              />
              <VideoDialog url={page.video.url} title={page.video.title} />
            </div>
          </Container>
        </section>
      )}

      {/* --- 3. Who can do this --- */}
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
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {page.whoCanDo.groups.map((group, i) => (
                <div
                  key={group.title}
                  className="group rounded-2xl border border-line bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-[0_28px_60px_-32px_rgba(15,23,42,0.5)]"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-600/10 font-mono text-xs font-semibold text-brand-600 transition-colors duration-500 group-hover:bg-brand-600 group-hover:text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight">
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

      {/* --- 4. Why this programme, full width --- */}
      {page.whyProgram && (
        <Section id="why-this-program">
          <SectionHead
            eyebrow="The case for it"
            lines={["Why this programme", "is worth your year"]}
          />
          <div className="mt-10 grid gap-x-16 gap-y-5 lg:grid-cols-2">
            {page.whyProgram.map((para, i) => (
              <RichText
                key={i}
                text={para}
                exclude={self}
                className="text-base leading-relaxed text-muted lg:text-lg"
              />
            ))}
          </div>
        </Section>
      )}

      {/* --- 5. Modules, by duration ---
          Two presentations of the same question. A course with an authored
          `syllabus` gets the comparison table; everything else keeps the
          sticky stack it already had, so adding one never disturbs the other
          fifty-one pages. */}
      {(page.syllabus || (page.tracks && page.tracks.length > 0)) && (
        <section
          id="modules"
          data-cursor="light"
          /* overflow-clip, not overflow-hidden: `hidden` would make this a
             scroll container and kill the sticky stack inside. */
          className="relative isolate overflow-clip bg-ink py-20 text-white lg:py-28"
        >
          <PanelTexture variant="aurora" />
          <Container className="relative">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
                Modules
              </span>
              <ScrollHeading
                lines={["Pick your duration,", "see the syllabus"]}
                className="mt-6 font-display text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-5xl"
              />
            </div>

            {page.syllabus ? (
              <ModuleComparison syllabus={page.syllabus} />
            ) : (
              page.tracks && <ModuleTracks tracks={page.tracks} />
            )}
          </Container>
        </section>
      )}

      {/* --- 6. What you will learn --- */}
      {page.learn && (
        <Section id="what-you-will-learn" tinted>
          <SectionHead eyebrow="Syllabus" lines={["What you will learn"]} />
          {page.learn.intro && (
            <Prose>
              <RichText
                text={page.learn.intro}
                exclude={self}
                className="text-base leading-relaxed text-muted lg:text-lg"
              />
            </Prose>
          )}

          {/* Collapsed by default so the whole syllabus is scannable in one
              screen; the detail is a click away rather than a scroll away. */}
          {page.learn.modules && (
            <FaqAccordion
              columns={2}
              className="mt-12"
              items={page.learn.modules.map((module, i) => ({
                badge: String(i + 1).padStart(2, "0"),
                question: module.title,
                answer: (
                  <ul className="space-y-2">
                    {module.points.map((point) => (
                      <li key={point} className="flex gap-2.5">
                        <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-brand-600/50" />
                        {point}
                      </li>
                    ))}
                  </ul>
                ),
              }))}
            />
          )}
        </Section>
      )}

      {/* --- 7. Tools --- */}
      {page.learn?.tools && page.learn.tools.length > 0 && (
        <section
          id="tools"
          data-cursor="light"
          className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28"
        >
          <PanelTexture variant="aurora" />

          <Container className="relative">
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs font-semibold tracking-[0.22em] text-brand-400 uppercase">
                The toolchain behind the craft
              </span>
              <ScrollHeading
                lines={["One course.", "A mesh of real tools."]}
                className="mt-5 font-display text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-5xl"
              />
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/60">
                Everything below is installed on the lab machines and used on
                live client work — not shown once in a slide and forgotten.
              </p>
            </div>

            <div className="mt-14">
              <ToolMesh courseName={page.eyebrow} tools={page.learn.tools} />
            </div>
          </Container>
        </section>
      )}

      {/* --- 8. Future outcomes --- */}
      {page.outcomes && page.outcomes.length > 0 && (
        <Section id="outcomes" tinted>
          <SectionHead
            eyebrow="Future scope"
            lines={["Where this course", "takes you"]}
          />
          <FaqAccordion
            columns={2}
            className="mt-12"
            items={page.outcomes.map((item) => ({
              question: item.q,
              answer: <RichText text={item.a} exclude={self} />,
            }))}
          />
        </Section>
      )}

      {/* --- 9. Hands-on projects ---
          Styling lives in globals.css under "HANDS-ON PROJECTS SECTION"; the
          markup below carries only layout and those class names. */}
      {page.projects && page.projects.length > 0 && (
        <Section id="projects" dark>
          <SectionHead
            eyebrow="Portfolio"
            lines={["Hands-on projects", "you will ship"]}
            dark
          />

          {/* Bento: two stacked on the left, two full-height beside them.
              `projects-section` carries the card custom properties, which
              cascade down to every .project-card inside it. */}
          <div className="projects-section mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
              {page.projects.map((project, i) => (
                <article
                  key={project.title}
                  className={`project-card relative flex flex-col justify-between ${
                    PROJECT_PLACEMENT[i] ?? ""
                  }`}
                >
                  <span className="project-badge relative inline-flex w-fit">
                    Project {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative mt-10">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-body">{project.body}</p>

                    {project.tags.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="project-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
          </div>
        </Section>
      )}

      {/* --- 10. Why Techcadd --- */}
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
            <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {page.whyTechcadd.points.map((point) => (
                <div key={point.title} className="border-t border-white/15 pt-5">
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

      {/* --- 11. Reviews --- */}
      {page.reviews && page.reviews.length > 0 && (
        <Section id="reviews" textured bleed>
          <Container>
            <SectionHead
              eyebrow="Student reviews"
              lines={["What our students", "in Jalandhar say"]}
            />
          </Container>
          <ReviewMarquee items={page.reviews} />
        </Section>
      )}

      {/* --- 12. FAQs --- */}
      {page.faqs && (
        <Section id="faqs">
          <SectionHead eyebrow="FAQs" lines={["Frequently", "asked questions"]} />
          <FaqAccordion
            columns={2}
            className="mt-12"
            items={page.faqs.map((faq) => ({
              question: faq.q,
              answer: <RichText text={faq.a} exclude={self} />,
            }))}
          />
        </Section>
      )}

      {/* --- 13. CTA, deliberately lighter than the homepage one --- */}
      <section className="px-4 pb-4 lg:px-8">
        <Container>
          <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-linear-to-br from-brand-700 via-brand-600 to-accent-500 px-7 py-10 text-white sm:px-10 lg:py-12">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-10 size-64 rounded-full bg-white/15 blur-3xl"
            />
            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl font-bold tracking-tight text-balance lg:text-3xl">
                  Not sure if {page.eyebrow} is the right fit?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  One call with a counsellor is usually enough to find out.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={CONTACT.phoneHref}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-ink transition-colors duration-300 hover:bg-brand-50"
                >
                  <PhoneIcon />
                  {CONTACT.phone}
                </a>
                <EnquireButton className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/15">
                  Book a free demo
                </EnquireButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 14. Related courses --- */}
      {page.related && page.related.length > 0 && (
        <Section id="related">
          <SectionHead eyebrow="Explore more" lines={["Related courses"]} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.related.map((href) => (
              <PrefetchLink
                key={href}
                href={href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.5)]"
              >
                <span className="min-w-0">
                  <span className="block truncate font-display text-base font-bold tracking-tight capitalize">
                    {href.split("/").pop()?.replace(/-/g, " ")}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    Jalandhar · Live projects
                  </span>
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600/10 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                  <ArrowIcon />
                </span>
              </PrefetchLink>
            ))}
          </div>
        </Section>
      )}

      {/* --- 15. Enquiry, over a technology backdrop --- */}
      <section
        id="enquiry"
        data-cursor="light"
        className="relative isolate overflow-hidden py-20 text-white lg:py-28"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 size-full scale-105 object-cover blur-[3px]"
        >
          <source src="/assets/video/bg.mp4" type="video/mp4" />
        </video>
        {/* Legibility floor — the form sits on light glass over moving video. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-ink/95 via-ink/85 to-ink/70"
        />

        <Container className="relative">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,36rem)] lg:gap-14">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
                Course Information
              </span>
              <ScrollHeading
                lines={["Ask about", page.eyebrow]}
                className="mt-6 font-display text-3xl leading-[1.05] font-bold tracking-tight sm:text-4xl lg:text-5xl"
              />

              <p className="mt-8 max-w-md text-base leading-relaxed text-white/70">
                Send your question and a counsellor will call you back — batch
                timings, fees, EMI options, placement record, or whether this
                course fits your degree.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  "Free counselling and demo class",
                  "Weekday, evening and weekend batches",
                  "Internship letter and placement support",
                ].map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm text-white/70"
                  >
                    <span className="mt-1.5 grid size-4 shrink-0 place-items-center rounded-full bg-white/15 text-white">
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

            <CourseEnquiryForm course={page.eyebrow} source={self} />
          </div>
        </Container>
      </section>
    </article>
  )
}

/**
 * Section shell.
 *
 * `textured` is the homepage testimonial surface — grain backdrop plus two
 * colour blooms — and it is the only variant whose children may need to bleed
 * past the container, so it renders them full width and leaves the containing
 * to the caller.
 */
function Section({
  id,
  children,
  tinted = false,
  dark = false,
  textured = false,
  bleed = false,
}: {
  id: string
  children: React.ReactNode
  tinted?: boolean
  dark?: boolean
  textured?: boolean
  bleed?: boolean
}) {
  const surface = dark
    ? "isolate overflow-hidden bg-ink text-white"
    : textured
      ? "isolate overflow-hidden bg-subtle"
      : tinted
        ? "bg-subtle"
        : ""

  return (
    <section
      id={id}
      data-cursor={dark ? "light" : undefined}
      className={`relative py-20 lg:py-28 ${surface}`}
    >
      {dark && <PanelTexture variant="aurora" />}

      {textured && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 bg-[url('/assets/texture.svg')] bg-cover bg-center opacity-90"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-20 left-[12%] size-[30rem] rounded-full bg-brand-400/25 blur-[120px]" />
            <div className="absolute right-[8%] bottom-0 size-[26rem] rounded-full bg-accent-400/20 blur-[120px]" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2/3 bg-linear-to-b from-white/85 to-transparent"
          />
        </>
      )}

      {bleed ? (
        <div className="relative">{children}</div>
      ) : (
        <Container className="relative">{children}</Container>
      )}
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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M16.9 21c-1.9 0-3.9-.5-5.9-1.6a20.6 20.6 0 0 1-6.4-5.4A19.5 19.5 0 0 1 1.5 7c-.2-1 0-1.9.6-2.6l2-2.1c.5-.5 1.3-.5 1.8 0l2.6 2.7c.5.5.5 1.3 0 1.8L7.1 8.3c.5 1 1.2 2 2 2.9.9.9 1.9 1.6 3 2.2l1.4-1.5c.5-.5 1.3-.5 1.8 0l2.6 2.7c.5.5.5 1.3 0 1.8l-2 2.1c-.5.4-1.2.6-1.9.5Z"
        fill="currentColor"
      />
    </svg>
  )
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
