/**
 * Body copy written in the CMS editor.
 *
 * The site has no typography plugin, so the element styles are declared here
 * once rather than being sprinkled through every page that renders authored
 * HTML. Descendant selectors are the point: the markup comes from the editor,
 * so nothing inside it can carry a class of ours.
 *
 * Distinct from RichText, which takes plain text and auto-links course
 * keywords. This one takes markup and only styles it.
 *
 * On the HTML itself: it is written by a signed-in admin in the CMS, the same
 * trust level as the copy checked into this repository. It is never visitor
 * input and never reaches here from a form.
 */
export function AuthoredHtml({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`
        text-base leading-relaxed text-foreground/85
        [&_p]:mt-5
        [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground lg:[&_h2]:text-3xl
        [&_h3]:mt-9 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground
        [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-5
        [&_li]:mt-2 [&_li]:pl-1
        [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-700
        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-500 [&_blockquote]:pl-5 [&_blockquote]:text-muted [&_blockquote]:italic
        [&_img]:mt-6 [&_img]:rounded-xl
        [&_code]:rounded [&_code]:bg-subtle [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm
        [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-ink [&_pre]:p-5 [&_pre]:text-sm [&_pre]:text-white
        [&_hr]:mt-10 [&_hr]:border-line
        [&_>*:first-child]:mt-0
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
