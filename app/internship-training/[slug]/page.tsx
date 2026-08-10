import { CourseRoute, metadataFor, paramsFor } from "@/lib/course-route"

type Props = { params: Promise<{ slug: string }> }

/** Unknown slugs are genuine 404s, not pages to render on demand. */
export const dynamicParams = false

export function generateStaticParams() {
  return paramsFor("internship-training")
}

export async function generateMetadata({ params }: Props) {
  return metadataFor("internship-training", (await params).slug)
}

export default async function Page({ params }: Props) {
  return <CourseRoute segment="internship-training" slug={(await params).slug} />
}
