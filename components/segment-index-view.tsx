import { Container } from "./container"
import { CourseFinder } from "./course-finder"
import { EnquireButton } from "./enquire-button"
import { PanelTexture } from "./panel-texture"
import { courseMark } from "@/lib/course-icons"
import { groupedSegment, type Segment } from "@/lib/course-pages"
import { groupSlug } from "@/lib/navigation"

export const SEGMENT_INDEX: Record<
  Segment,
  { eyebrow: string; h1: string; intro: string; title: string; description: string }
> = {
  courses: {
    eyebrow: "Courses",
    h1: "IT & Software Courses in Jalandhar",
    intro:
      "Programming, AI, data, cloud, cybersecurity and digital marketing — every track taught on live projects at Techcadd Jalandhar, with an internship letter and placement support.",
    title: "IT & Software Courses in Jalandhar | Techcadd",
    description:
      "Browse Techcadd Jalandhar's courses — Python, Java, MERN, AI, data science, cybersecurity, cloud and digital marketing. Live projects, internship letter, placement support.",
  },
  "internship-training": {
    eyebrow: "Internship & Training",
    h1: "Industrial Training & Internship in Jalandhar",
    intro:
      "45-day, 6-week, 4-month and 6-month industrial training at Techcadd Jalandhar — university-recognised, finished with a live client project and an internship letter.",
    title: "Industrial Training & Internship in Jalandhar | Techcadd",
    description:
      "45 days, 6 weeks, 4 months and 6 months industrial training in Jalandhar. Live client projects, internship letter and placement drives at Techcadd.",
  },
  "after-12th-courses": {
    eyebrow: "After 12th",
    h1: "Courses After 12th in Jalandhar",
    intro:
      "Career tracks you can start straight after school — 6-month and 1-year certificate programmes in AI, cloud, cybersecurity, programming and digital marketing.",
    title: "Best Courses After 12th in Jalandhar | Techcadd",
    description:
      "Certificate courses after 12th in Jalandhar — generative AI, cloud computing, data science, cybersecurity, Python and digital marketing at Techcadd.",
  },
}

export function SegmentIndexView({ segment }: { segment: Segment }) {
  const copy = SEGMENT_INDEX[segment]

  /*
    Marks are resolved here, on the server, and handed down as plain path data.
    Resolving them inside CourseFinder would drag the whole simple-icons index
    into the browser bundle to produce about thirty paths.
  */
  const groups = groupedSegment(segment).map(([title, entries]) => ({
    title,
    id: groupSlug(title),
    entries: entries.map((entry) => ({
      slug: entry.slug,
      segment: entry.segment,
      label: entry.label,
      mark: courseMark(entry.label),
    })),
  }))

  return (
    <article>
      <section
        data-cursor="light"
        className="relative isolate overflow-hidden bg-ink pt-32 pb-16 text-white lg:pt-40 lg:pb-20"
      >
        <PanelTexture variant="aurora" />

        <Container className="relative">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            {copy.eyebrow}
          </span>

          <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance lg:text-6xl">
            {copy.h1}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            {copy.intro}
          </p>

          <EnquireButton className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-7 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-brand-50">
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
        </Container>
      </section>

      {/* Search plus the grouped card sections. The cards warm their route on
          hover rather than on sight — viewport prefetching 35 of them would
          fire 35 RSC requests on load. */}
      <CourseFinder groups={groups} />
    </article>
  )
}
