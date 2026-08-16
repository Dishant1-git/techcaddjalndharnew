import Link from "next/link"
import type { EnquiryFilters } from "@/lib/admin-data"
import { FORM_TYPE_OPTIONS } from "@/lib/admin-data"

/**
 * The one row of controls above the charts.
 *
 * A plain GET form, not a client component: the filters already live in the
 * query string, which is what makes a filtered view shareable and the CSV
 * export match the screen. Submitting the form is the browser rebuilding that
 * URL — no JavaScript involved, and the back button behaves.
 *
 * `page` is deliberately not carried through. Changing a filter changes what
 * matches, so staying on page 4 of the previous result set is meaningless.
 */
export function FilterBar({
  filters,
  exportHref,
  showClear,
}: {
  filters: EnquiryFilters
  exportHref: string
  showClear: boolean
}) {
  const field =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-500/25"

  return (
    <form
      action="/admin"
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-4"
    >
      <div className="min-w-[14rem] flex-1">
        <label htmlFor="q" className="mb-1 block text-xs font-medium text-muted">
          Search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Name, phone, course, email or message"
          className={field}
        />
      </div>

      <div className="w-44">
        <label htmlFor="type" className="mb-1 block text-xs font-medium text-muted">
          Form
        </label>
        <select id="type" name="type" defaultValue={filters.formType} className={field}>
          <option value="">All forms</option>
          {FORM_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="w-40">
        <label htmlFor="from" className="mb-1 block text-xs font-medium text-muted">
          From
        </label>
        <input
          id="from"
          name="from"
          type="date"
          defaultValue={filters.from}
          className={field}
        />
      </div>

      <div className="w-40">
        <label htmlFor="to" className="mb-1 block text-xs font-medium text-muted">
          To
        </label>
        <input id="to" name="to" type="date" defaultValue={filters.to} className={field} />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Apply
        </button>

        {showClear && (
          <Link
            href="/admin"
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:bg-subtle"
          >
            Clear
          </Link>
        )}

        {/* A normal link, so the browser's own download handling applies and
            the filters travel with it. */}
        <a
          href={exportHref}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:bg-subtle"
        >
          Export CSV
        </a>
      </div>
    </form>
  )
}
