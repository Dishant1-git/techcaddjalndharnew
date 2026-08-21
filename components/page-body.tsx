import { AuthoredHtml } from "./authored-html"
import { Container } from "./container"
import { ContentBlockView, type BlogTeaser } from "./content-block"
import { type ContentBlock } from "@/lib/content-blocks"

/**
 * The body of a CMS page: its blocks, or its prose if it has none.
 *
 * Both paths are kept because both are real. Pages written before the block
 * editor existed — the privacy notice, the policies — hold a single field of
 * HTML and are perfectly well served by it; forcing them through a migration
 * to gain nothing would be churn. A page with blocks uses them, a page without
 * renders what it always did.
 *
 * Pure and synchronous, so the CMS preview pane can mount this exact component
 * over unsaved state rather than approximating it.
 */
export function PageBody({
  blocks,
  content,
  posts,
}: {
  blocks?: ContentBlock[]
  /** The legacy single-field body, used when there are no blocks. */
  content?: string
  /** Recent posts, for any 'blogs' block. Fetched by the caller. */
  posts?: BlogTeaser[]
}) {
  const visible = (blocks ?? []).filter((block) => block.visible)

  if (visible.length > 0) {
    return (
      <>
        {visible.map((block, index) => (
          <ContentBlockView key={block.id ?? index} block={block} posts={posts} />
        ))}
      </>
    )
  }

  if (!content?.trim()) return null

  return (
    <section className="py-14 lg:py-20">
      <Container>
        {/* The measure the prose pages have always used. Blocks set their own,
            because an image or a video block wants the full column. */}
        <div className="mx-auto max-w-3xl">
          <AuthoredHtml html={content} />
        </div>
      </Container>
    </section>
  )
}

/** The dark title band every CMS page opens with. */
export function PageHero({ title }: { title: string }) {
  return (
    <section
      data-cursor="light"
      className="bg-ink pt-32 pb-14 text-white lg:pt-40 lg:pb-16"
    >
      <Container>
        <h1
          data-reveal
          suppressHydrationWarning
          className="max-w-3xl font-display text-3xl leading-[1.12] font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl"
        >
          {title}
        </h1>
      </Container>
    </section>
  )
}
