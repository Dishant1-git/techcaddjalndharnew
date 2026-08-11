import { CourseRoute, metadataFor, paramsFor } from "@/lib/course-route"

type Props = { params: Promise<{ slug: string }> }

/** Unknown slugs are genuine 404s, not pages to render on demand. */
export const dynamicParams = false

export function generateStaticParams() {
  return paramsFor("after-12th-courses")
}

export async function generateMetadata({ params }: Props) {
  return metadataFor("after-12th-courses", (await params).slug)
}

export default async function Page({ params }: Props) {
  return <CourseRoute segment="after-12th-courses" slug={(await params).slug} />
}
