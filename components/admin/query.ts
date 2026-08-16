import type { EnquiryFilters } from "@/lib/admin-data"

/**
 * Builds the dashboard's own links — pagination, the CSV export, "Clear".
 *
 * Everything that narrows the view lives in the query string, so every one of
 * those links is the current filters plus or minus one key. Empty values are
 * dropped rather than sent blank, which keeps a shared or bookmarked URL
 * readable.
 */
export function toQuery(
  filters: EnquiryFilters,
  extra: Record<string, string | number | undefined> = {},
): string {
  const params = new URLSearchParams()

  const put = (key: string, value: string | number | undefined) => {
    const text = String(value ?? "").trim()
    if (text) params.set(key, text)
  }

  put("q", filters.q)
  put("type", filters.formType)
  put("from", filters.from)
  put("to", filters.to)

  for (const [key, value] of Object.entries(extra)) {
    if (value === undefined || value === "") params.delete(key)
    else put(key, value)
  }

  const query = params.toString()
  return query ? `?${query}` : ""
}
