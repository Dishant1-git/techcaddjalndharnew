import { CourseRoute, metadataFor, paramsFor } from "@/lib/course-route"

type Props = { params: Promise<{ slug: string }> }

/**
 * On, because the catalogue is no longer fully known at build time: a course
 * added in the CMS after a deploy must still get a page. An unknown slug is
 * still a hard 404 — CourseRoute calls notFound() when the lookup misses — so
 * this does not reintroduce the soft-404 the previous setting guarded against.
 */
export const dynamicParams = true

export async function generateStaticParams() {
  return paramsFor("courses")
}

export async function generateMetadata({ params }: Props) {
  return metadataFor("courses", (await params).slug)
}

export default async function Page({ params }: Props) {
  return <CourseRoute segment="courses" slug={(await params).slug} />
}
