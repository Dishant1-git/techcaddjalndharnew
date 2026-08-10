import { indexMetadataFor, SegmentIndexRoute } from "@/lib/course-route"

export const metadata = indexMetadataFor("internship-training")

export default function Page() {
  return <SegmentIndexRoute segment="internship-training" />
}
