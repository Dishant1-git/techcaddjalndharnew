import Image from "next/image"
import Link from "next/link"

import { AuthoredHtml } from "./authored-html"
import { Container } from "./container"
import { formatPostDate } from "@/lib/blogs"

/**
 * One article, rendered.
 *
 * Pure and synchronous so the CMS preview pane can mount this exact component
 * over unsaved state. The route above it does the fetching; this only draws.
 */

export interface ArticleView {
  title: string
  excerpt?: string
  body: string
  tags: string[]
  /** Already resolved against the CMS origin by the caller. */
  coverUrl?: string
  coverAlt?: string
  /** YYYY-MM-DD. */
  date: string
}

export function BlogArticle({ post }: { post: ArticleView }) {
  return (
    <>
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
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
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
            {post.coverUrl && (
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-subtle">
                {/* The headline above already names the subject, so alt text
                    here would only repeat it — unless the editor wrote one. */}
                <Image
                  src={post.coverUrl}
                  alt={post.coverAlt ?? ""}
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
    </>
  )
}
