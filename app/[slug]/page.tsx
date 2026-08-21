import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Cta } from "@/components/cta"
import { PageBody, PageHero } from "@/components/page-body"
import { getBlogs, getPage, isCmsNotFound } from "@/lib/cms"
import { resolveBlockMedia } from "@/lib/content"
import { SITE } from "@/lib/site"

type Props = { params: Promise<{ slug: string }> }

/**
 * Standalone pages written in the CMS — policies, notices, landing copy.
 *
 * The lowest-priority route in the app: Next matches every real directory under
 * app/ before falling through to here, so a CMS page can never shadow /about or
 * /courses however it is slugged. A slug the CMS does not know is a hard 404.
 *
 * Rendered on demand rather than pre-generated. A page written in the CMS after
 * the last deploy is exactly the case this route exists for, and enumerating
 * slugs at build time would miss it.
 */

export const dynamicParams = true

export async function generateStaticParams() {
  // Deliberately empty: every page renders on first request and is then cached
  // like any other. Prebuilding would need a list endpoint that only serves the
  // build, and would still miss anything published afterwards.
  return []
}

async function load(slug: string) {
  try {
    return await getPage(slug)
  } catch (error) {
    // Absent is absent; unreachable is not. Returning undefined here renders
    // notFound(), so only a real 404 from the CMS may do it — a timeout has to
    // surface as an error rather than telling a visitor, and Next's cache,
    // that a page which exists does not.
    if (isCmsNotFound(error)) return undefined
    throw error
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await load((await params).slug)
  if (!page) return {}

  const url = page.seo?.canonicalUrl || `${SITE.url}/${page.slug}`

  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription,
    keywords: page.seo?.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription,
      url,
      type: "website",
      locale: "en_IN",
    },
  }
}

export default async function CmsPageRoute({ params }: Props) {
  const page = await load((await params).slug)
  if (!page) notFound()

  // Only fetched when a block actually asks for posts — most pages have none,
  // and a request per page render for a list nothing displays is waste.
  const needsPosts = page.sections?.some((block) => block.type === "blogs" && block.visible)
  const posts = needsPosts ? await recentPosts() : undefined

  return (
    <main>
      <PageHero title={page.title} />
      <PageBody blocks={resolveBlockMedia(page.sections)} content={page.content} posts={posts} />
      <Cta />
    </main>
  )
}

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
    return undefined
  }
}
