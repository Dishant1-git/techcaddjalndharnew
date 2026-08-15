import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { AuthoredHtml } from "@/components/authored-html"
import { formatPostDate } from "@/lib/blogs"
import { cmsImageUrl, getBlog, getBlogs, CmsUnavailableError } from "@/lib/cms"
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
    if (error instanceof CmsUnavailableError) return undefined
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

  const cover = cmsImageUrl(post.coverImage?.url)
  const date = (post.publishDate ?? post.updatedAt).slice(0, 10)

  return (
    <main>
      <section
        data-cursor="light"
        className="bg-ink pt-32 pb-14 text-white lg:pt-40 lg:pb-16"
      >
        <Container>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-white/60 uppercase transition-colors hover:text-white"
          >
            <span aria-hidden="true">&larr;</span> All articles
          </Link>

          <h1
            data-reveal
            suppressHydrationWarning
            className="mt-7 max-w-3xl font-display text-3xl leading-[1.12] font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl"
          >
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-white/55">
            <time dateTime={date}>{formatPostDate(date)}</time>
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/20 px-3 py-1 tracking-[0.12em] uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <article className="py-14 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            {cover && (
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-subtle">
                {/* The headline above already names the subject, so alt text
                    here would only repeat it — unless the editor wrote one. */}
                <Image
                  src={cover}
                  alt={post.coverImage?.alt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 768px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {post.excerpt && (
              <p className="text-lg leading-relaxed font-medium text-foreground lg:text-xl">
                {post.excerpt}
              </p>
            )}

            <AuthoredHtml html={post.body} className="mt-8" />
          </div>
        </Container>
      </article>

      <Cta />
    </main>
  )
}
