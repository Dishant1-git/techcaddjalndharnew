/**
 * Puts every course the website already renders into the CMS.
 *
 * Why this exists
 * ---------------
 * The site knows 52 courses across three segments, but they live in
 * `lib/course-pages.ts` and `lib/course-specs.ts` — TypeScript only a developer
 * can edit. The CMS held two. So an admin looking at the Courses list saw two
 * rows and no way to touch the other fifty, even though every one of them has a
 * live page with a heading, a tagline, a tool list and a careers list that
 * someone in the office might reasonably want to change.
 *
 * This reads the same registry the website reads and writes one CMS row per
 * course. After it runs, the CMS is the editing surface for all of them:
 * `withCmsPrecedence` already hands an edited field back to the editor, so a
 * change here reaches the page.
 *
 * Idempotent. Matched on `segment` + `slug`, which is how the site looks a
 * course up. An existing row is left exactly as it is — this seeds the ones
 * that are missing, it never overwrites work an editor has already done.
 *
 * Usage
 * -----
 *   cd cms-techcadd/backend
 *   npm run db:import-courses
 *
 *   DRY_RUN=1 npm run db:import-courses    # report only, write nothing
 */

import { randomUUID } from 'node:crypto'

import { execute, query, queryOne, pool, type Row } from '../src/db/pool.js'
// The website's registry, read directly so there is one source of truth for
// what the catalogue contains.
import { CATALOGUE } from '../../../lib/course-pages.js'
import { COURSE_SPECS, GENERIC_SPEC } from '../../../lib/course-specs.js'

const DRY_RUN = process.env.DRY_RUN === '1'

/**
 * A short description, within the 255 the column allows.
 *
 * Falls back through what the spec actually has rather than inventing a
 * sentence: the tagline is the one line written to describe the course.
 */
function shortDescription(label: string, tagline: string | undefined): string {
  const text = tagline?.trim()
    ? `Learn ${tagline.trim()}`
    : `${label} training at techcadd Jalandhar.`
  return text.length > 255 ? `${text.slice(0, 252)}…` : text
}

async function main(): Promise<void> {
  // Categories are matched by name so an imported course lands in the group the
  // menus already file it under. Missing ones are left unset rather than
  // created — inventing categories is an editorial decision, not an import's.
  const categoryRows = await query<Row>('SELECT id, name FROM categories')
  const categoryByName = new Map(
    categoryRows.map((r) => [String(r.name).toLowerCase(), r.id as string]),
  )

  let created = 0
  let skipped = 0
  let uncategorised = 0

  for (const entry of CATALOGUE) {
    const existing = await queryOne<Row>(
      'SELECT id FROM courses WHERE segment = ? AND slug = ? LIMIT 1',
      [entry.segment, entry.slug],
    )

    if (existing) {
      skipped += 1
      continue
    }

    const spec = COURSE_SPECS[`${entry.segment}/${entry.slug}`] ?? GENERIC_SPEC
    const categoryId = categoryByName.get(entry.group.toLowerCase()) ?? null
    if (!categoryId) uncategorised += 1

    if (DRY_RUN) {
      console.log(`would create  ${entry.segment}/${entry.slug}  (${entry.label})`)
      created += 1
      continue
    }

    const id = randomUUID()

    await execute(
      `INSERT INTO courses
         (id, title, slug, segment, category_id, short_description, description,
          tagline, demand, careers, tools, salary,
          duration, level, mode, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
      [
        id,
        entry.label,
        entry.slug,
        entry.segment,
        categoryId,
        shortDescription(entry.label, spec.tagline),
        // Left empty on purpose. The page generates its overview from the
        // tagline, and pre-filling this with generated prose would make it look
        // hand-written and invite an editor to "fix" copy nothing reads.
        '',
        spec.tagline ?? '',
        spec.demand ?? '',
        JSON.stringify(spec.careers ?? []),
        JSON.stringify(spec.tools ?? []),
        spec.salary ?? '',
        spec.duration ?? '',
        // Left unset, not guessed. The registry has no per-course level or
        // delivery mode, and writing one would put a claim on a live page that
        // nobody made — "Beginner" on a course no one has graded. Absent, the
        // facts strip keeps the segment's generic wording.
        null,
        null,
        // Published, because the page is already live. Importing them as drafts
        // would say the opposite of what a visitor can see right now.
        'published',
      ],
    )

    // The topics list is what the page builds its module ladder from, so it
    // travels with the course rather than being left for someone to retype.
    for (const [index, value] of (spec.topics ?? []).entries()) {
      await execute(
        'INSERT INTO course_highlights (course_id, value, position) VALUES (?, ?, ?)',
        [id, value, index],
      )
    }

    created += 1
  }

  console.log(
    `\n${DRY_RUN ? '[dry run] ' : ''}${created} created, ${skipped} already in the CMS ` +
      `(left untouched), ${uncategorised} without a matching category.`,
  )

  await pool.end()
}

await main()
