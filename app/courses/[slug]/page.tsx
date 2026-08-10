import { CourseRoute, metadataFor, paramsFor } from "@/lib/course-route"

type Props = { params: Promise<{ slug: string }> }

/**
 * The catalogue is fully known at build time, so anything outside it is a real
 * 404 rather than a page to render on demand. Without this Next serves an
 * unknown slug with a 200 and the not-found body — a soft 404.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return paramsFor("courses")
}

export async function generateMetadata({ params }: Props) {
  return metadataFor("courses", (await params).slug)
}

export default async function Page({ params }: Props) {
  return <CourseRoute segment="courses" slug={(await params).slug} />
}
