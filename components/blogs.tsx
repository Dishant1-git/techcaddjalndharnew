import Link from "next/link"
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
    <section id="blogs" className="px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-[1240px]">
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

          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-line bg-white py-2 pr-2 pl-7 text-sm font-semibold transition-colors duration-300 hover:border-brand-600/30 hover:text-brand-600 lg:self-auto"
          >
            Read all posts
            <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-white transition-transform duration-300 group-hover:translate-x-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
                <path
                  d="M5 12h14m-7-7 7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>

        <div
          data-reveal
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
        >
          {POSTS.map((post) => (
            <Card key={post.href} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Card({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-500 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-[0_28px_60px_-32px_rgba(15,23,42,0.5)]">
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

        <h3 className="mt-3 font-display text-lg leading-snug font-bold tracking-tight text-balance">
          <Link href={post.href} className="transition-colors duration-200 hover:text-brand-600">
            {/* Stretches the click target across the whole card. */}
            <span className="absolute inset-0" />
            {post.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
          Read article
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          >
            <path
              d="M5 12h14m-7-7 7 7-7 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </article>
  )
}
