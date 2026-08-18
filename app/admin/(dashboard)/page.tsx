import { BarList } from "@/components/admin/bar-list"
import { EnquiriesTable } from "@/components/admin/enquiries-table"
import { FilterBar } from "@/components/admin/filter-bar"
import { formTypeColor } from "@/components/admin/form-colors"
import { toQuery } from "@/components/admin/query"
import { StatTile } from "@/components/admin/stat-tile"
import { TrendChart } from "@/components/admin/trend-chart"
import {
  ensureTable,
  getDailyTrend,
  getFormTypeSplit,
  getSummary,
  getTopCourses,
  hasFilters,
  listEnquiries,
  parseFilters,
} from "@/lib/admin-data"

/** Reads cookies and live rows — never prerendered, never cached. */
export const dynamic = "force-dynamic"

/** How many days the pulse chart covers. */
const TREND_DAYS = 14

const PAGE_SIZE = 25

type SearchParams = Record<string, string | string[] | undefined>

/** Percentage change, or null when there is no previous period to compare to. */
function delta(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const filters = parseFilters(params)
  const page = Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1

  /*
    Everything the page needs, in one round of queries.

    A single try/catch around the lot rather than per-panel error states: the
    only realistic failure here is the database being unreachable, and that
    fails all six identically. Six copies of the same message, laid out as if
    five panels still worked, would read as a data problem rather than a
    connection one.
  */
  let data
  try {
    // A fresh database has no table until the first enquiry is submitted; this
    // makes that case an empty dashboard rather than an error.
    await ensureTable()

    const [summary, trend, split, courses, rows] = await Promise.all([
      getSummary(),
      getDailyTrend(TREND_DAYS),
      getFormTypeSplit(filters),
      getTopCourses(filters),
      listEnquiries(filters, page, PAGE_SIZE),
    ])

    data = { summary, trend, split, courses, rows }
  } catch (error) {
    // The message can carry the database password, so it stays in the log.
    console.error("[admin] dashboard query failed:", error)

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-base font-semibold text-red-900">
          The database could not be reached
        </h2>
        <p className="mt-2 max-w-prose text-sm text-red-800">
          Every panel on this page reads the <code>enquiries</code> table, so
          none of them can be shown. Check that MySQL is running and that{" "}
          <code>DB_HOST</code>, <code>DB_USER</code>, <code>DB_PASSWORD</code>{" "}
          and <code>DB_NAME</code> in <code>.env.local</code> are correct — the
          server log has the specific error.
        </p>
      </div>
    )
  }

  const { summary, trend, split, courses, rows } = data
  const filtered = hasFilters(filters)
  const scope = filtered ? "Matching current filters" : "All time"

  return (
    <div className="space-y-6">
      {/*
        This page reads the website's own table, which is only a safety net: an
        enquiry lands here solely when the CMS could not be reached, and is
        forwarded on as soon as it can be. The CMS is where staff work the
        queue, with status, notes and assignment — so this says so rather than
        presenting itself as a second inbox to remember to check.
      */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-amber-900">
          The CMS is where enquiries are worked
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-amber-800">
          Enquiries go straight to the CMS inbox, where they carry a status, notes and an
          assignee. Anything below was held here because the CMS was briefly unreachable, and
          is forwarded automatically once it is back — so this page should normally be a
          historical record rather than a queue.
        </p>
      </section>

      {/* Site-wide totals. These deliberately ignore the filters below — they
          are the standing picture the page opens with, and a number that moved
          because of a search box is not a total. */}
      <section>
        <h2 className="sr-only">Totals</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile
            label="Total enquiries"
            value={summary.total}
            hint={summary.latest ? `Latest ${summary.latest}` : "None yet"}
          />
          <StatTile
            label="Call requests"
            value={summary.callRequests}
            hint="From the site-wide popup"
          />
          <StatTile label="Today" value={summary.today} hint="Since midnight" />
          <StatTile
            label="Last 7 days"
            value={summary.last7}
            delta={delta(summary.last7, summary.prev7)}
          />
          <StatTile label="Last 30 days" value={summary.last30} />
        </div>
      </section>

      <TrendChart points={trend} />

      <FilterBar
        filters={filters}
        exportHref={`/api/admin/enquiries/export${toQuery(filters)}`}
        showClear={filtered}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarList
          title="By form"
          subtitle={scope}
          items={split}
          colors={split.map((slice) => formTypeColor(slice.label))}
          empty="No enquiries match these filters."
        />

        <BarList
          title="Most enquired courses"
          subtitle={scope}
          items={courses}
          empty="No courses to rank yet."
        />
      </div>

      <EnquiriesTable page={rows} filters={filters} />
    </div>
  )
}
