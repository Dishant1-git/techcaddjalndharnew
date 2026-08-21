import type { Metadata } from "next"

import { PagePreviewHost } from "@/components/preview/page-preview-host"
import { parseOrigins } from "@/components/preview/preview-protocol"
import { Cta } from "@/components/cta"
import { getBlogs } from "@/lib/cms"

/**
 * The CMS page preview, served by the website itself.
 *
 * Same reasoning as /preview/course: it lives here so the preview *is* the
 * site — same components, same CSS, same breakpoints — rather than a second
 * implementation of the page that would start lying the day it fell behind.
 *
 * Inert on its own. Everything it renders arrives by postMessage from the
 * frame above it, so a stranger who visits this URL sees "waiting for the
 * editor" and nothing else.
 */

export const metadata: Metadata = {
  title: "Page preview",
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = "force-dynamic"

/** Teasers for a 'blogs' block. Degrades to none if the CMS is unreachable. */
async function recentPosts() {
  try {
    const { items } = await getBlogs(6)
    return items.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverUrl: post.coverImage?.url,
    }))
  } catch {
    return []
  }
}

export default async function PagePreviewRoute() {
  const allowedOrigins = parseOrigins(
    process.env.CMS_ADMIN_ORIGIN ?? "http://localhost:5173",
  )

  return <PagePreviewHost
      posts={await recentPosts()}
      allowedOrigins={allowedOrigins}
      cta={<Cta />}
    />
}
