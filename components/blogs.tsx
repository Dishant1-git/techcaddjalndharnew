import { Container } from "./container"
import { ScrollHeading } from "./scroll-heading"
import { POSTS, type Post } from "@/lib/blogs"

/** Stable across server and client — `toLocaleDateString` is not. */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-")
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`
}

export function Blogs() {
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

          {/* "Read all posts" removed with /blog — there is no index to send
              anyone to yet. Restore it alongside the route. */}
        </div>

        <div
          data-reveal
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
        >
          {POSTS.map((post) => (
            <Card key={post.href} post={post} />
          ))}
        </div>
      </Container>
    </section>
  )
}

function Card({ post }: { post: Post }) {
  return (
    /* Static styling while the cards are not clickable — a hover lift on
       something that cannot be opened reads as a broken link. */
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
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
          <time dateTime={post.date}>{formatDate(post.date)}</time>
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
