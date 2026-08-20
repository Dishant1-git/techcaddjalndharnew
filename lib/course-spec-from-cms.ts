import {
  GENERIC_SPEC,
  type CourseSpec,
  type CourseSpecField,
} from "./course-specs"

/**
 * One CMS course record, turned into the spec the page generator consumes.
 *
 * This lives on its own, apart from lib/content.ts, because two callers need
 * it and they must not drift:
 *
 *   - `loadCourseSpecs` maps the saved records the live website renders.
 *   - `coursePageFromDraft` maps the unsaved record the CMS preview renders.
 *
 * If those two mappings were written twice, the preview would eventually stop
 * predicting the page — which is the one thing a preview must never do. A
 * pure function with no I/O is also what lets the preview run in the browser.
 */

/**
 * A block an editor added, as the CMS sends it.
 *
 * Structurally identical to `CourseBlock` on the page side; kept separate so
 * this file does not have to import from course-pages.ts, which pulls in the
 * whole 3,000-line registry for a type.
 */
export interface CourseBlockSource {
  id?: string
  type: 'rich-text' | 'image' | 'video' | 'cta'
  title?: string
  body?: string
  media?: { id: string; url: string; alt: string; width?: number; height?: number }
  linkUrl?: string
  linkLabel?: string
  linkTarget: 'same' | 'new'
  anchor: string
  placement: 'before' | 'after'
  visible: boolean
}

/** The fields of a CMS course this mapping reads. */
export interface CourseSpecSource {
  tagline?: string
  demand?: string
  careers: string[]
  tools: string[]
  highlights: string[]
  salary?: string
  duration?: string
  fee: number
  discountedFee?: number
  level: string
  mode: string
}

/** The CMS stores a key; the page prints a phrase. */
const MODE_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Classroom",
  hybrid: "Classroom & Online",
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

/**
 * The fee as a visitor should read it.
 *
 * Zero counts as "not priced" rather than "free": the field starts at 0 on a
 * new course, and a page announcing a free course because nobody filled the box
 * in is a worse error than showing no price. A discount prints as the price
 * being charged with the old one in brackets, since the strip is one line.
 */
export function feeLabel(course: {
  fee: number
  discountedFee?: number
}): string | undefined {
  if (!course.fee || course.fee <= 0) return undefined

  const money = (value: number) => `₹${value.toLocaleString("en-IN")}`
  return course.discountedFee && course.discountedFee < course.fee
    ? `${money(course.discountedFee)} (was ${money(course.fee)})`
    : money(course.fee)
}

/**
 * `existing` is the checked-in spec for this course when there is one, so a
 * field the office has not filled in keeps its authored copy rather than
 * falling back to generic wording.
 */
export function specFromCourse(
  course: CourseSpecSource,
  existing: CourseSpec = GENERIC_SPEC,
): CourseSpec {
  const tagline = course.tagline || undefined
  const demand = course.demand || undefined
  const careers = course.careers.length > 0 ? course.careers : undefined
  const topics = course.highlights.length > 0 ? course.highlights : undefined
  const tools = course.tools.length > 0 ? course.tools : undefined
  const salary = course.salary || undefined
  const duration = course.duration || undefined
  const mode = MODE_LABELS[course.mode] ?? undefined
  const level = LEVEL_LABELS[course.level] ?? undefined
  const fee = feeLabel(course)

  /*
    Which fields somebody actually typed into the CMS, as opposed to which ones
    fell back to checked-in copy.

    This has to be recorded here because it cannot be recovered afterwards:
    once the tagline has been resolved to a string there is no telling whether
    it came from the record or from the fallback beside it. Six course pages
    carry hand-written copy that otherwise sits on top of the CMS, and this
    list is what lets an edited field win while the hand-written sections
    nobody can edit yet stay where they are.
  */
  const fromCms: CourseSpecField[] = []
  const supplied: [CourseSpecField, unknown][] = [
    ['tagline', tagline],
    ['demand', demand],
    ['careers', careers],
    ['topics', topics],
    ['tools', tools],
    ['salary', salary],
    ['duration', duration],
    ['mode', mode],
    ['level', level],
    ['fee', fee],
  ]
  for (const [field, value] of supplied) if (value !== undefined) fromCms.push(field)

  return {
    tagline: tagline ?? existing.tagline,
    demand: demand ?? existing.demand,
    careers: careers ?? existing.careers,
    topics: topics ?? existing.topics,
    tools: tools ?? existing.tools,
    salary: salary ?? existing.salary,
    // The facts strip. Absent unless the CMS has a value, so a course nobody
    // has priced keeps the segment's generic wording.
    duration,
    mode,
    level,
    fee,
    fromCms,
  }
}
