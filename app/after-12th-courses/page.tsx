import { indexMetadataFor, SegmentIndexRoute } from "@/lib/course-route"

export const metadata = indexMetadataFor("after-12th-courses")

export default async function Page() {
  return <SegmentIndexRoute segment="after-12th-courses" />
}
