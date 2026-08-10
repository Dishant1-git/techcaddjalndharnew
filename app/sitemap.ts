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

  const staticRoutes = ["", "/courses", "/internship-training", "/after-12th-courses", "/contact"]

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE.url}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
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
