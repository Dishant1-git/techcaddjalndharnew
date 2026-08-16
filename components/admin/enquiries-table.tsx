import Link from "next/link"
import type { EnquiryFilters, Page } from "@/lib/admin-data"
import { formTypeColor } from "./form-colors"
import { toQuery } from "./query"

/**
 * Every matching enquiry, newest first.
 *
 * This is also the charts' accessibility relief: two of the four form colours
 * sit below 3:1 against white, and the rule for that is that the same numbers
 * must be readable as text somewhere on the page. They are here.
 */

/** The dot is the same colour as this form's bar in the split above. */
function FormBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium text-foreground">
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: formTypeColor(label) }}
      />
      {label}
    </span>
  )
}

export function EnquiriesTable({
  page,
  filters,
}: {
  page: Page
  filters: EnquiryFilters
}) {
  const { rows, total, pageCount } = page
  const first = total === 0 ? 0 : (page.page - 1) * page.pageSize + 1
  const last = Math.min(total, page.page * page.pageSize)

  return (
    <section className="rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line p-5">
        <h2 className="text-base font-semibold text-foreground">Enquiries</h2>
        <p className="text-sm text-muted">
          {total === 0
            ? "No matching rows"
            : `Showing ${first}–${last} of ${total.toLocaleString("en-IN")}`}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted">
          Nothing matches these filters. Clear them to see every enquiry.
        </p>
      ) : (
        // The table keeps its full width and scrolls inside this box, so a
        // narrow screen never widens the whole page.
        <div className="overflow-x-auto">
          <table className="w-full min-w-[60rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {["Received", "Form", "Name", "Phone", "Course", "Details"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3 text-xs font-semibold tracking-wide text-muted uppercase"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                // The three optional fields collapse into one cell: only the
                // brochure form fills email and address, so dedicated columns
                // would be empty on most rows.
                const details = [
                  row.message,
                  row.email,
                  row.address,
                  row.source && `via ${row.source}`,
                ]
                  .filter(Boolean)
                  .join(" · ")

                return (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 align-top hover:bg-subtle"
                  >
                    <td
                      className="px-5 py-3 whitespace-nowrap text-muted"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {row.createdAt}
                    </td>
                    <td className="px-5 py-3">
                      <FormBadge label={row.formType} />
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">{row.name}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {/* The point of this screen is calling people back. */}
                      <a
                        href={`tel:${row.phone}`}
                        className="text-brand-700 hover:underline"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {row.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-foreground">{row.course}</td>
                    <td className="max-w-md px-5 py-3 text-muted">
                      {details ? (
                        <span className="line-clamp-2" title={details}>
                          {details}
                        </span>
                      ) : (
                        <span aria-hidden>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-line p-4">
          <PageLink
            href={`/admin${toQuery(filters, { page: page.page - 1 })}`}
            disabled={page.page <= 1}
          >
            ← Previous
          </PageLink>

          <p className="text-sm text-muted">
            Page {page.page} of {pageCount}
          </p>

          <PageLink
            href={`/admin${toQuery(filters, { page: page.page + 1 })}`}
            disabled={page.page >= pageCount}
          >
            Next →
          </PageLink>
        </div>
      )}
    </section>
  )
}

/**
 * A disabled step renders as text, not as a dead link: an <a> without an href
 * is not focusable and announces as nothing, which is worse than plain words.
 */
function PageLink({
  href,
  disabled,
  children,
}: {
  href: string
  disabled: boolean
  children: React.ReactNode
}) {
  if (disabled)
    return <span className="px-3 py-1.5 text-sm text-muted opacity-50">{children}</span>

  return (
    <Link
      href={href}
      className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-subtle"
    >
      {children}
    </Link>
  )
}
