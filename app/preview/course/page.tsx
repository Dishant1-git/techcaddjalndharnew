import type { Metadata } from "next"

import { CoursePreviewHost } from "@/components/preview/course-preview-host"
import { parseOrigins } from "@/components/preview/preview-protocol"
import { loadContact } from "@/lib/content"

/**
 * The CMS course preview, served by the website itself.
 *
 * It lives here rather than in the CMS so the preview is the site: same
 * components, same CSS, same fonts, same breakpoints. A preview rebuilt inside
 * the admin SPA would be a second implementation to keep in step, and the day
 * it fell behind it would start lying about what publishing does.
 *
 * The page is inert on its own — it renders "waiting for the editor" to anyone
 * who visits it directly, because all of its content arrives by postMessage
 * from the frame above it.
 */

export const metadata: Metadata = {
  title: "Course preview",
  // Never a search result: it is a tool, and it has no content of its own.
  robots: { index: false, follow: false, nocache: true },
}

/** The draft only ever comes from the parent frame, so nothing to cache. */
export const dynamic = "force-dynamic"

export default async function CoursePreviewPage() {
  const allowedOrigins = parseOrigins(
    process.env.CMS_ADMIN_ORIGIN ?? "http://localhost:5173",
  )

  return (
    <CoursePreviewHost contact={await loadContact()} allowedOrigins={allowedOrigins} />
  )
}
