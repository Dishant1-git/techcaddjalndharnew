import { ContentBlockView } from "./content-block"
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
 * Positioning is all this component does. What a block *looks* like is
 * ContentBlockView's job, shared with CMS pages, so a paragraph added to a
 * course and a paragraph added to a page render identically.
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
        <ContentBlockView
          key={block.id ?? `${block.anchor}-${index}`}
          block={block}
        />
      ))}
    </>
  )
}
