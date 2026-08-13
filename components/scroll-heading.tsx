import { Fragment } from "react"

/** Milliseconds between one word starting and the next. */
const STAGGER = 55

/**
 * A section heading that writes itself in, word by word, when scrolled to.
 *
 * Deliberately a Server Component: the stagger is expressed as a CSS custom
 * property per word and the trigger is the shared ScrollReveal observer, so
 * this ships zero client JavaScript.
 *
 * `lines` keeps the line breaks explicit — the words carry transition delays
 * that continue across the break, so a two-line heading reads as one sentence
 * being written rather than two that restart.
 */
export function ScrollHeading({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
}: {
  lines: string[]
  as?: "h1" | "h2" | "h3"
  className?: string
  /** Applied to each line wrapper — e.g. to hide a break below a breakpoint. */
  lineClassName?: string
}) {
  let index = 0

  return (
    <Tag data-reveal-words suppressHydrationWarning className={className}>
      {lines.map((line, lineIndex) => (
        <span
          key={lineIndex}
          className={`block ${lineIndex > 0 ? lineClassName : ""}`}
        >
          {line.split(" ").map((word, wordIndex) => {
            const delay = index++ * STAGGER
            return (
              <Fragment key={`${lineIndex}-${wordIndex}`}>
                {/* A real space between clips, so the heading stays
                    selectable and copyable as ordinary text. */}
                {wordIndex > 0 && " "}
                <span className="sh-clip">
                  <span
                    className="sh-word"
                    style={{ "--word-delay": `${delay}ms` } as React.CSSProperties}
                  >
                    {word}
                  </span>
                </span>
              </Fragment>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}
