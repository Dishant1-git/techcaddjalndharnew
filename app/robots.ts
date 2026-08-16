import type { MetadataRoute } from "next"
import { SITE } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API routes carry no content and would only waste crawl budget.
        // /admin is private; the pages there also send `noindex` themselves,
        // because a disallow only asks politely and does not stop a URL that
        // was linked from somewhere else being listed.
        disallow: ["/api/", "/admin"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
