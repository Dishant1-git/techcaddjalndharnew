import { indexMetadataFor, SegmentIndexRoute } from "@/lib/course-route"

export const metadata = indexMetadataFor("courses")

export default function Page() {
  return <SegmentIndexRoute segment="courses" />
}
