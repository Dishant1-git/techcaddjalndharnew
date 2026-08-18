import Image from "next/image"
import Link from "next/link"
import { BlogCarousel } from "./blog-carousel"
import { Container } from "./container"
import { ScrollHeading } from "./scroll-heading"
import { formatPostDate, type Post } from "@/lib/blogs"
import { loadPosts } from "@/lib/content"

export async function Blogs() {
  const posts = await loadPosts()

  return (
    <section id="blogs" className="py-20 lg:py-28">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-line bg-subtle px-4 py-1.5 text-xs font-medium tracking-wide">
              Blogs
            </span>
            <ScrollHeading
              lines={["Notes from the", "classroom and the codebase"]}
              className="mt-6 font-display text-4xl leading-[1.05] font-bold tracking-tight lg:text-5xl"
            />
          </div>

          {/* Restored: /blogs now exists, which is the condition the note here
              set for bringing this back. */}
          <Link
            href="/blogs"
            className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-line bg-white py-2 pr-2 pl-7 text-sm font-semibold transition-colors duration-300 hover:border-brand-600/30 hover:text-brand-600 lg:self-auto"
          >
            Read all posts
            <span className="grid size-9 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        {/* Six across a carousel rather than three in a static grid: the rail
            shows three at a time, so the extra posts cost no vertical space.
            The full list still lives on /blogs. */}
        <div data-reveal suppressHydrationWarning className="mt-12 lg:mt-16">
          <BlogCarousel
            items={posts.slice(0, 6).map((post) => (
              <Card key={post.href} post={post} />
            ))}
          />
        </div>
      </Container>
    </section>
  )
}

function Card({ post }: { post: Post }) {
  return (
    /* The hover lift is only offered when the card opens something — on a
       teaser with no article behind it, it would read as a broken link. */
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white${
        post.hasArticle ? " transition-colors hover:border-brand-300" : ""
      }`}
    >
      {/* The cover photograph, with the gradient behind it as the backdrop for
          anything that has not loaded — a post whose cover has not been set in
          the CMS still gets one of the repository photographs from loadPosts,
          so this is rarely bare. */}
      <div
        className={`relative aspect-video overflow-hidden bg-linear-to-br ${post.from} ${post.to}`}
      >
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="absolute bottom-3 left-3 rounded-full border border-white/25 bg-black/30 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-white uppercase backdrop-blur-md">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true" className="size-1 rounded-full bg-muted/50" />
          {post.readTime}
        </div>

        {/* Linked only when there is an article behind it. Posts written in the
            CMS have a body and a page; the checked-in teasers do not, and
            linking one would be a 404 on every click. */}
        <h3 className="mt-3 font-display text-lg leading-snug font-bold tracking-tight text-balance">
          {post.hasArticle ? (
            /* Stretched over the card, so the whole tile is the click target
               rather than two lines of heading. */
            <Link href={post.href} className="after:absolute after:inset-0 hover:text-brand-600">
              {post.title}
            </Link>
          ) : (
            post.title
          )}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>
      </div>
    </article>
  )
}
