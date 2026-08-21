import Image from "next/image"
import Link from "next/link"

import { AuthoredHtml } from "./authored-html"
import { Container } from "./container"
import { embedUrl, type ContentBlock } from "@/lib/content-blocks"

/**
 * One editor-authored block, rendered.
 *
 * Shared by course pages and CMS pages so a paragraph added to a course and a
 * paragraph added to a page are the same thing on screen. Pure and
 * synchronous — no data fetching — which is what lets the CMS preview pane
 * mount this exact component over unsaved state.
 *
 * The 'blogs' type is the one exception: it needs posts, which it cannot fetch
 * itself, so the caller passes them in. A block that asks for posts and is
 * given none renders nothing rather than an empty heading.
 */

export interface BlogTeaser {
  slug: string
  title: string
  excerpt?: string
  coverUrl?: string
}

export function ContentBlockView({
  block,
  posts,
}: {
  block: ContentBlock
  posts?: BlogTeaser[]
}) {
  const body = <Body block={block} posts={posts} />
  if (body === null) return null

  return (
    <section className="py-12 lg:py-16">
      <Container>
        {block.title && (
          <h2 className="font-display text-2xl leading-tight font-bold tracking-tight text-balance lg:text-3xl">
            {block.title}
          </h2>
        )}

        <div className={block.title ? "mt-6" : undefined}>{body}</div>

        {/* A 'cta' carries its own button inside the panel. */}
        {block.type !== "cta" && block.linkUrl && block.linkLabel && (
          <div className="mt-6">
            <BlockLink block={block} />
          </div>
        )}
      </Container>
    </section>
  )
}

function Body({
  block,
  posts,
}: {
  block: ContentBlock
  posts?: BlogTeaser[]
}) {
  switch (block.type) {
    case "rich-text":
      // AuthoredHtml, the same component blog bodies and page content use for
      // markup written in the CMS editor. It carries this site's existing trust
      // model: the HTML comes from a signed-in admin, never from a visitor.
      return block.body ? <AuthoredHtml html={block.body} /> : null

    case "image":
      if (!block.media) return null
      return (
        <figure>
          <Image
            src={block.media.url}
            alt={block.media.alt}
            width={block.media.width ?? 1600}
            height={block.media.height ?? 900}
            sizes="(min-width: 1024px) 1240px, 100vw"
            className="h-auto w-full rounded-2xl object-cover"
          />
          {block.body && (
            <figcaption className="mt-3 text-sm text-muted">{block.body}</figcaption>
          )}
        </figure>
      )

    case "video":
      if (!block.linkUrl) return null
      return (
        <div className="overflow-hidden rounded-2xl bg-ink">
          {/* 16:9, reserved before the frame loads so the page does not jump. */}
          <div className="relative aspect-video">
            <iframe
              src={embedUrl(block.linkUrl)}
              title={block.title ?? "Video"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>
        </div>
      )

    case "cta":
      return (
        <div className="rounded-2xl bg-linear-to-br from-brand-700 via-brand-600 to-accent-500 px-7 py-10 text-white sm:px-10">
          {block.body && (
            <p className="max-w-2xl text-sm leading-relaxed text-white/90">{block.body}</p>
          )}
          {block.linkUrl && block.linkLabel && (
            <div className="mt-6">
              <BlockLink block={block} solid />
            </div>
          )}
        </div>
      )

    case "blogs":
      if (!posts?.length) return null
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-line transition-shadow hover:shadow-[0_22px_50px_-24px_rgba(15,23,42,0.35)]"
            >
              {post.coverUrl && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 400px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-display text-base leading-snug font-semibold tracking-tight text-balance">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )
  }
}

/**
 * One link, internal or external.
 *
 * `next/link` for a path on this site so the navigation stays client-side, a
 * plain anchor for anything else — `Link` to an external URL gives up its
 * prefetching and adds nothing. `rel` is set whenever the link opens a new tab,
 * external or not: `noopener` is what stops the opened page reaching back
 * through `window.opener`.
 */
function BlockLink({ block, solid = false }: { block: ContentBlock; solid?: boolean }) {
  const className = solid
    ? "inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
    : "inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"

  const newTab = block.linkTarget === "new"
  const label = block.linkLabel ?? "Learn more"
  const href = block.linkUrl ?? "#"

  if (href.startsWith("/") && !newTab) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    )
  }

  return (
    <a
      href={href}
      className={className}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {label}
      {newTab && <span className="sr-only">, opens in a new tab</span>}
    </a>
  )
}
