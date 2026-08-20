import Image from "next/image"
import Link from "next/link"

import { AuthoredHtml } from "./authored-html"
import { Container } from "./container"
import { type CourseBlock } from "@/lib/course-pages"

/**
 * The blocks an editor added, rendered at one boundary of the course template.
 *
 * One call sits between every pair of generated sections and renders whatever
 * was anchored to the far side of each: blocks placed *after* the section
 * above, then blocks placed *before* the section below. That is why there is
 * one of these per boundary rather than two per section — the two lists always
 * appear in the same gap, and pairing them here keeps the template readable.
 *
 * Renders nothing at all when there is nothing anchored here, so a course with
 * no added blocks produces byte-for-byte the page it did before.
 */
export function CourseBlocks({
  blocks,
  after,
  before,
}: {
  blocks: CourseBlock[] | undefined
  /** Section id whose "after" blocks belong in this gap. */
  after?: string
  /** Section id whose "before" blocks belong in this gap. */
  before?: string
}) {
  if (!blocks?.length) return null

  const here = blocks.filter(
    (block) =>
      (after !== undefined && block.anchor === after && block.placement === "after") ||
      (before !== undefined && block.anchor === before && block.placement === "before"),
  )

  if (here.length === 0) return null

  return (
    <>
      {here.map((block, index) => (
        <Block key={block.id ?? `${block.anchor}-${index}`} block={block} />
      ))}
    </>
  )
}

function Block({ block }: { block: CourseBlock }) {
  return (
    <section className="py-12 lg:py-16">
      <Container>
        {block.title && (
          <h2 className="font-display text-2xl leading-tight font-bold tracking-tight text-balance lg:text-3xl">
            {block.title}
          </h2>
        )}

        <div className={block.title ? "mt-6" : undefined}>
          <Body block={block} />
        </div>

        {block.type !== "cta" && block.linkUrl && block.linkLabel && (
          <div className="mt-6">
            <BlockLink block={block} />
          </div>
        )}
      </Container>
    </section>
  )
}

function Body({ block }: { block: CourseBlock }) {
  switch (block.type) {
    case "rich-text":
      // AuthoredHtml, the same component blog bodies and page content use for
      // markup written in the CMS editor. It carries this site's existing
      // trust model: the HTML comes from a signed-in admin, never from a
      // visitor or a form.
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
              title={block.title ?? "Course video"}
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
          <div className="mt-6">
            <BlockLink block={block} solid />
          </div>
        </div>
      )
  }
}

/**
 * One link, internal or external.
 *
 * `next/link` for a path on this site so the navigation stays client-side, a
 * plain anchor for anything else — `Link` to an external URL gives up its
 * prefetching and adds nothing. `rel` is set whenever the link opens a new
 * tab, external or not: `noopener` is what stops the opened page reaching back
 * through `window.opener`.
 */
function BlockLink({ block, solid = false }: { block: CourseBlock; solid?: boolean }) {
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

/**
 * Turns a YouTube or Vimeo watch URL into its embed form.
 *
 * Editors paste the address from the browser bar, which is the share URL, not
 * the embeddable one — pasting it straight into an iframe yields a refused
 * connection. Anything unrecognised is passed through untouched, so a URL that
 * is already an embed still works.
 */
function embedUrl(url: string): string {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  )
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return url
}
