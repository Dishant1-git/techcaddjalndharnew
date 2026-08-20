import { COURSE_SPECS } from "./course-specs"
import {
  specFromCourse,
  type CourseBlockSource,
  type CourseSpecSource,
} from "./course-spec-from-cms"
import {
  CATALOGUE,
  COURSE_PAGES,
  getCoursePage,
  type CatalogueEntry,
  type CoursePage,
  type PageLayout,
  type Segment,
} from "./course-pages"

/**
 * Turns an unsaved CMS course record into the page the website would render.
 *
 * The whole point of this file is that it adds no rendering logic of its own.
 * It maps the draft to a `CourseSpec` with `specFromCourse` — the same call
 * `loadCourseSpecs` makes for saved records — and then hands off to
 * `getCoursePage`, which is what the live route calls. So a preview built
 * from this cannot show a layout, a fallback or a generated sentence that the
 * real page would not, because it is the real page's own code deciding.
 *
 * Everything here is pure and synchronous, which is what lets it run in the
 * browser inside the preview pane rather than needing a round trip per
 * keystroke.
 */

export interface CourseDraft extends CourseSpecSource {
  title: string
  slug: string
  segment: Segment
  categoryName?: string
  /** The page arrangement — see `applyPageLayout`. */
  overview?: string
  videoUrl?: string
  videoTitle?: string
  hiddenSections?: string[]
  sections?: CourseBlockSource[]
}

const SEGMENTS: Segment[] = ["courses", "internship-training", "after-12th-courses"]

export const isSegment = (value: unknown): value is Segment =>
  typeof value === "string" && SEGMENTS.includes(value as Segment)

/**
 * Sections of this course's page that are hand-written and have no CMS field.
 *
 * Six courses were authored in `course-pages.ts` before the CMS existed. The
 * fields an editor now has boxes for win over that copy — see
 * `withCmsPrecedence` — but the richer sections have no box to win from, so
 * they will keep showing what a developer wrote no matter what is typed here.
 *
 * Naming them is the honest thing to do. Without this the preview looks like
 * it is ignoring the editor, when in fact those sections are simply not
 * theirs to change yet.
 */
export function uneditableSections(segment: string, slug: string): string[] {
  const authored = COURSE_PAGES.find((p) => p.segment === segment && p.slug === slug)
  if (!authored) return []

  /*
    Only keys that put visible copy on the page and have no CMS equivalent.

    Deliberately excludes everything `withCmsPrecedence` now hands back to the
    editor — title, tagline, the facts strip, the tool list — because those are
    no longer stuck, and listing them would send someone hunting for a problem
    that has been fixed.
  */
  const NO_CMS_FIELD: Record<string, string> = {
    overview: "Overview",
    whoCanDo: "Who can do this",
    whyProgram: "The case for it",
    syllabus: "Module comparison table",
    learn: "What you will learn",
    outcomes: "Future scope",
    projects: "Hands-on projects",
    whyTechcadd: "Why techcadd",
    reviews: "Reviews",
    faqs: "FAQs",
    heroImage: "Hero illustration",
  }

  return [
    ...new Set(
      Object.entries(NO_CMS_FIELD)
        .filter(([key]) => (authored as Record<string, unknown>)[key] !== undefined)
        .map(([, label]) => label),
    ),
  ]
}

export function coursePageFromDraft(draft: CourseDraft): CoursePage | undefined {
  if (!draft.slug || !draft.title) return undefined

  const key = `${draft.segment}/${draft.slug}`

  // Layered exactly as the site layers it: the checked-in spec is the floor,
  // the draft overrides it field by field.
  const specs = { ...COURSE_SPECS, [key]: specFromCourse(draft, COURSE_SPECS[key]) }

  const entry: CatalogueEntry = {
    segment: draft.segment,
    slug: draft.slug,
    label: draft.title,
    group: draft.categoryName || "More courses",
  }

  // `extra` is the same channel `loadCourseCatalogue` uses for CMS courses
  // that have no menu entry yet, so a brand-new draft resolves the same way a
  // freshly saved course does. A draft whose slug already exists in the built
  // catalogue is found there first, which is also what would happen live.
  const known = CATALOGUE.some(
    (e) => e.segment === draft.segment && e.slug === draft.slug,
  )

  // The same layout the live page would get, so hiding a section or dragging a
  // block shows up in the pane exactly as publishing would render it.
  const layout: PageLayout = {
    hiddenSections: draft.hiddenSections?.length ? draft.hiddenSections : undefined,
    blocks: draft.sections?.length ? draft.sections : undefined,
    overview: draft.overview || undefined,
    videoUrl: draft.videoUrl || undefined,
    videoTitle: draft.videoTitle || undefined,
  }

  return getCoursePage(draft.segment, draft.slug, specs, known ? [] : [entry], {
    [key]: layout,
  })
}
