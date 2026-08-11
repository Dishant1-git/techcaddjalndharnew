/**
 * Serialises structured data for an inline <script type="application/ld+json">.
 *
 * JSON is not HTML. Inside a script element the parser is still hunting for
 * `</script`, so a `<` that survives JSON.stringify closes the element early
 * and everything after it is parsed as markup. Escaping it to < is
 * transparent to a JSON parser and inert to an HTML one.
 *
 * Today every value comes from our own catalogue, so this is defence in depth
 * rather than a fix — but the day a course title, testimonial or address is
 * loaded from the database, the escape is what stops it becoming stored XSS.
 */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}
