import type { MetadataRoute } from "next"
import { CATALOGUE, COURSE_PAGES } from "@/lib/course-pages"
import { SITE } from "@/lib/site"

/**
 * Generated from the same catalogue the pages are, so a course can never exist
 * without being in the sitemap — or be listed here without existing.
 *
 * Pages with authored copy get a higher priority than the stubs, which is the
 * honest signal: they are the ones worth crawling first.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const authored = new Set(
    COURSE_PAGES.map((p) => `/${p.segment}/${p.slug}`),
  )

  /* The About, Blogs and Gallery pages were each missing here while being
     fully prerendered and linked from every page's nav — crawlable, but not
     declared. They sit below the course index pages in priority: they convert,
     they do not rank for course terms. Anything added under app/ needs a line
     here, or it ships invisible to the sitemap. */
  const staticRoutes = [
    "",
    "/courses",
    "/internship-training",
    "/after-12th-courses",
    "/contact",
    "/about",
    "/about/mission-vision",
    "/about/founder",
    "/blogs",
    "/gallery",
  ]

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE.url}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority:
        path === ""
          ? 1
          : path.startsWith("/about") || path === "/gallery"
            ? 0.6
            : 0.8,
    })),
    ...CATALOGUE.map((entry) => {
      const path = `/${entry.segment}/${entry.slug}`
      return {
        url: `${SITE.url}${path}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: authored.has(path) ? 0.9 : 0.5,
      }
    }),
  ]
}
