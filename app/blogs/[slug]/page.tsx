import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Cta } from "@/components/cta"
import { BlogArticle } from "@/components/blog-article"
import { cmsImageUrl, getBlog, getBlogs, isCmsNotFound } from "@/lib/cms"
import { SITE } from "@/lib/site"

type Props = { params: Promise<{ slug: string }> }

/**
 * Articles written in the CMS.
 *
 * Only CMS posts have a page. The checked-in POSTS in lib/blogs.ts are teasers
 * with no article body, so there is nothing to render for them — the listing
 * links a card only when the post it came from is a real article, and an
 * unknown slug is a hard 404 rather than an empty page.
 */

/** On, so an article published after a deploy still gets a page. */
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const { items } = await getBlogs(100)
    return items.map((post) => ({ slug: post.slug }))
  } catch {
    // A build must not fail because the CMS is briefly unreachable. Pages are
    // rendered on demand instead, which dynamicParams already allows.
    return []
  }
}

async function load(slug: string) {
  try {
    return await getBlog(slug)
  } catch (error) {
    // Only a real 404 means the post is gone. See the note in app/[slug].
    if (isCmsNotFound(error)) return undefined
    throw error
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await load((await params).slug)
  if (!post) return {}

  const url = `${SITE.url}/blogs/${post.slug}`

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      locale: "en_IN",
      publishedTime: post.publishDate,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await load((await params).slug)
  if (!post) notFound()

  return (
    <main>
      <BlogArticle
        post={{
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          tags: post.tags,
          coverUrl: cmsImageUrl(post.coverImage?.url),
          coverAlt: post.coverImage?.alt,
          date: (post.publishDate ?? post.updatedAt).slice(0, 10),
        }}
      />
      <Cta />
    </main>
  )
}
