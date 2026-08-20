import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CoursePageView } from "@/components/course-page-view"
import { PromoBanner } from "@/components/promo-banner"
import { SegmentIndexView, SEGMENT_INDEX } from "@/components/segment-index-view"
import { loadCourseCatalogue, loadCourseSpecs } from "./content"
import { getCoursePage, hrefFor, slugsInSegment, type Segment } from "./course-pages"
import { jsonLd } from "./json-ld"

/**
 * Shared plumbing for the three course segments, so /courses/[slug],
 * /internship-training/[slug] and /after-12th-courses/[slug] stay three-line
 * files over one implementation.
 */

const SITE = "https://techcadd.com"

export async function paramsFor(segment: Segment) {
  return slugsInSegment(segment, await loadCourseCatalogue()).map((slug) => ({ slug }))
}

export async function metadataFor(segment: Segment, slug: string): Promise<Metadata> {
  const page = getCoursePage(
    segment,
    slug,
    await loadCourseSpecs(),
    await loadCourseCatalogue(),
  )
  if (!page) return {}

  const url = `${SITE}${hrefFor(page)}`

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: "website",
      locale: "en_IN",
    },
  }
}

export function indexMetadataFor(segment: Segment): Metadata {
  const copy = SEGMENT_INDEX[segment]
  const url = `${SITE}/${segment}`

  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: url },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      type: "website",
      locale: "en_IN",
    },
  }
}

export async function SegmentIndexRoute({ segment }: { segment: Segment }) {
  const copy = SEGMENT_INDEX[segment]

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.h1,
    description: copy.description,
    url: `${SITE}/${segment}`,
    isPartOf: { "@type": "WebSite", name: "Techcadd", url: SITE },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <main>
        <SegmentIndexView segment={segment} extra={await loadCourseCatalogue()} />
      </main>
    </>
  )
}

export async function CourseRoute({
  segment,
  slug,
}: {
  segment: Segment
  slug: string
}) {
  const page = getCoursePage(
    segment,
    slug,
    await loadCourseSpecs(),
    await loadCourseCatalogue(),
  )
  if (!page) notFound()

  const url = `${SITE}${hrefFor(page)}`

  /**
   * Course + Breadcrumb always; FAQPage only once FAQs exist, since an empty
   * FAQ block is a structured-data error rather than a neutral omission.
   */
  const schema: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: page.h1,
      description: page.description,
      url,
      inLanguage: "en-IN",
      provider: {
        "@type": "EducationalOrganization",
        name: "Techcadd",
        url: SITE,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jalandhar",
          addressRegion: "Punjab",
          addressCountry: "IN",
        },
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: ["Onsite", "Blended"],
        courseWorkload: page.facts.find((f) => f.label === "Duration")?.value,
        location: {
          "@type": "Place",
          name: "Techcadd Jalandhar",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Jalandhar",
            addressRegion: "Punjab",
            addressCountry: "IN",
          },
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        {
          "@type": "ListItem",
          position: 2,
          name: page.segment.replace(/-/g, " "),
          item: `${SITE}/${page.segment}`,
        },
        { "@type": "ListItem", position: 3, name: page.h1, item: url },
      ],
    },
  ]

  if (page.faqs?.length) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    })
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <main>
        <CoursePageView page={page} />

        {/* The "course page" placement, on every course page. Renders nothing
            unless a banner is scheduled and live, so a page with no campaign
            running is byte-for-byte what it was. */}
        <PromoBanner placement="course-page" />
      </main>
    </>
  )
}
