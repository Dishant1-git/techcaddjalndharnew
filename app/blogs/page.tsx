import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { formatPostDate, type Post } from "@/lib/blogs"
import { loadPosts } from "@/lib/content"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Blog — Guides on AI, Development, Careers and Training",
  description:
    "Notes from the classroom and the codebase — course guides, hiring trends and career advice from the trainers and placement team at Techcadd Jalandhar.",
  alternates: { canonical: `${SITE.url}/blogs` },
}

export default async function BlogsPage() {
  const posts = await loadPosts()

  return (
    <main>
      {/*
        A short ink band rather than the full-screen hero the About pages use.
        An index exists to be scrolled: a viewport-filling header would push
        every card below the fold and make the page look empty on arrival.
      */}
      <section
        data-cursor="light"
        className="bg-ink pt-32 pb-16 text-white lg:pt-40 lg:pb-20"
      >
        <Container>
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            Blog
          </span>

          <h1
            data-reveal
            suppressHydrationWarning
            className="mt-7 max-w-3xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            Notes from the <span className="text-white">classroom</span> and the{" "}
            <span className="text-white">codebase.</span>
          </h1>

          <p
            data-reveal
            suppressHydrationWarning
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 lg:text-lg"
          >
            Course guides, hiring trends and career advice, written by the
            trainers and placement team who see what employers actually ask for.
          </p>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              Latest posts
            </p>
            {/* Reads off the list rather than being typed in, so it cannot go
                stale when a post is added. */}
            <p className="font-mono text-xs text-muted">
              {posts.length} articles
            </p>
          </div>

          {/* Three across on desktop, two on tablet, one on a phone. The cards
              stretch to the tallest in their row, and each one pins its own
              footer to the bottom, so the meta lines stay on a common baseline
              however long the titles run. */}
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
            {posts.map((post, index) => (
              <li
                key={post.href}
                /* The site-wide scroll reveal: ScrollReveal in the layout adds
                   `is-visible` as each card crosses into view, and globals.css
                   fades and lifts it in. Safe to put on this element because
                   nothing here also animates a transform — the cards are static
                   by design, and a hover lift on the same node would be
                   outranked by the reveal's own `transform: none`. */
                data-reveal
                suppressHydrationWarning
                /* Staggered by column rather than by absolute position: each
                   row enters as a left-to-right cascade, and because the delay
                   resets every third card the last row starts as promptly as
                   the first instead of waiting out a growing queue. */
                style={
                  {
                    "--reveal-delay": `${(index % 3) * 90}ms`,
                  } as React.CSSProperties
                }
                className="flex"
              >
                <PostCard post={post} priority={index < 3} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Cta />
    </main>
  )
}

/**
 * Cover photograph above, copy below.
 *
 * The title links only when there is an article behind it. Posts written in
 * the CMS have a body and a page; the checked-in teasers in lib/blogs.ts do
 * not, and linking one would be a 404 on every click.
 */
function PostCard({ post, priority }: { post: Post; priority?: boolean }) {
  return (
    <article className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-brand-300">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-subtle">
        {/* Decorative: the title below carries the meaning, so alt text here
            would only repeat it. */}
        <Image
          src={post.image}
          alt=""
          fill
          /* Three columns at 1304px, two at tablet, full width on a phone. */
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          /* The first row is above the fold on most screens; the rest stay
             lazy so the index does not fetch nine photographs at once. */
          priority={priority}
        />

        <span className="absolute bottom-3 left-3 rounded-full border border-white/25 bg-black/35 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-white uppercase backdrop-blur-md">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true" className="size-1 rounded-full bg-muted/50" />
          {post.readTime}
        </div>

        <h2 className="mt-3 font-display text-lg leading-snug font-bold tracking-tight text-balance">
          {post.hasArticle ? (
            /* Stretched over the whole card, so the click target is the card
               rather than the two lines of the heading. */
            <Link href={post.href} className="after:absolute after:inset-0 hover:text-brand-600">
              {post.title}
            </Link>
          ) : (
            post.title
          )}
        </h2>

        {/* `flex-1` pushes nothing below it, but it is what makes every card in
            a row end level regardless of excerpt length. */}
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>
      </div>
    </article>
  )
}
