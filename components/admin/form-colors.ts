import { FORM_TYPE_OPTIONS, UNATTRIBUTED } from "@/lib/admin-data"
import { SERIES, UNKNOWN } from "./palette"

/**
 * The colour of one form, everywhere it appears.
 *
 * Keyed by the form's position in the fixed option list, never by its rank in
 * whatever the current filters returned. "Course Enquiry" is slot 2 on a day
 * it leads and on a day it has no rows at all — so a filter that drops a form
 * cannot repaint the ones that remain, and the badge in the table always
 * matches the bar in the chart above it.
 */
export function formTypeColor(label: string): string {
  if (label === UNATTRIBUTED) return UNKNOWN

  const index = FORM_TYPE_OPTIONS.indexOf(label)
  return SERIES[(index === -1 ? 0 : index) % SERIES.length]
}
