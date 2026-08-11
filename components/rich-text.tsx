import Link from "next/link"
import { Fragment } from "react"
import { KEYWORD_LINKS } from "@/lib/course-pages"

/**
 * Renders body copy and turns known course keywords into internal links.
 *
 * Two rules keep this from reading as keyword spam, which search engines and
 * students both punish:
 *   - a keyword links only on its FIRST appearance in a given block
 *   - a page never links to itself (`exclude`)
 *
 * Keywords are matched longest-first, so "digital marketing" wins over
 * "marketing" and "machine learning" over "learning".
 */

const SORTED = Object.keys(KEYWORD_LINKS).sort((a, b) => b.length - a.length)

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const PATTERN = new RegExp(`\\b(${SORTED.map(escape).join("|")})\\b`, "gi")

export function RichText({
  text,
  exclude,
  className,
}: {
  text: string
  /** Href of the current page — matches pointing here stay plain text. */
  exclude?: string
  className?: string
}) {
  const nodes: React.ReactNode[] = []
  const linked = new Set<string>()
  let cursor = 0

  for (const match of text.matchAll(PATTERN)) {
    const phrase = match[0]
    const key = phrase.toLowerCase()
    const href = KEYWORD_LINKS[key]
    const index = match.index ?? 0

    if (!href || href === exclude || linked.has(key)) continue

    linked.add(key)
    nodes.push(text.slice(cursor, index))
    nodes.push(
      <Link
        key={`${key}-${index}`}
        href={href}
        className="font-medium text-brand-600 underline decoration-brand-600/30 underline-offset-2 transition-colors duration-200 hover:decoration-brand-600"
      >
        {phrase}
      </Link>,
    )
    cursor = index + phrase.length
  }

  nodes.push(text.slice(cursor))

  return (
    <p className={className}>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </p>
  )
}
