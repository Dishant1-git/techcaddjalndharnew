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
    /* Static styling while the cards are not clickable — a hover lift on
       something that cannot be opened reads as a broken link. */
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white">
      {/* Gradient stand-in until real cover art exists. */}
      <div
        className={`relative aspect-[16/9] bg-linear-to-br ${post.from} ${post.to}`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_55%)]"
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

        {/* Not a link, and no "Read article" affordance: POSTS holds teasers
            only — there are no article bodies and no /blog route behind them,
            so every one of these pointed at a 404. Wrap the title in a Link to
            post.href again the moment the posts themselves exist. */}
        <h3 className="mt-3 font-display text-lg leading-snug font-bold tracking-tight text-balance">
          {post.title}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>
      </div>
    </article>
  )
}
