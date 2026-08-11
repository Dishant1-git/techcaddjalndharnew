import { query, type Row } from '../../db/pool.js'

const PER_GROUP = 4

export interface SearchHit {
  id: string
  label: string
  detail?: string
}

export interface SearchGroup {
  key: 'courses' | 'blogs' | 'pages' | 'faculty' | 'enquiries'
  hits: SearchHit[]
}

/**
 * Global search across the five things people look for by name.
 *
 * LIKE with a leading wildcard cannot use an index, but the alternative
 * (FULLTEXT) will not match partial words — typing "rea" should find "React"
 * while the user is still typing, which is the entire point of the box. The
 * per-group limit of four keeps the scan bounded.
 */
export async function search(term: string): Promise<SearchGroup[]> {
  const like = `%${term}%`

  const [courses, blogs, pages, faculty, enquiries] = await Promise.all([
    query<Row>(
      `SELECT id, title AS label, duration AS detail FROM courses
        WHERE title LIKE ? OR slug LIKE ? ORDER BY updated_at DESC LIMIT ?`,
      [like, like, PER_GROUP],
    ),
    query<Row>(
      `SELECT id, title AS label, slug AS detail FROM blogs
        WHERE title LIKE ? OR slug LIKE ? ORDER BY updated_at DESC LIMIT ?`,
      [like, like, PER_GROUP],
    ),
    query<Row>(
      `SELECT id, title AS label, CONCAT('/', slug) AS detail FROM pages
        WHERE title LIKE ? OR slug LIKE ? ORDER BY updated_at DESC LIMIT ?`,
      [like, like, PER_GROUP],
    ),
    query<Row>(
      `SELECT id, name AS label, designation AS detail FROM faculty
        WHERE name LIKE ? OR designation LIKE ? ORDER BY updated_at DESC LIMIT ?`,
      [like, like, PER_GROUP],
    ),
    query<Row>(
      `SELECT id, student_name AS label, course_name AS detail FROM enquiries
        WHERE student_name LIKE ? OR phone LIKE ? OR email LIKE ?
        ORDER BY created_at DESC LIMIT ?`,
      [like, like, like, PER_GROUP],
    ),
  ])

  const toHits = (rows: Row[]): SearchHit[] =>
    rows.map((row) => ({
      id: row.id as string,
      label: row.label as string,
      detail: (row.detail as string | null) ?? undefined,
    }))

  return (
    [
      { key: 'courses', hits: toHits(courses) },
      { key: 'blogs', hits: toHits(blogs) },
      { key: 'pages', hits: toHits(pages) },
      { key: 'faculty', hits: toHits(faculty) },
      { key: 'enquiries', hits: toHits(enquiries) },
    ] as SearchGroup[]
  ).filter((group) => group.hits.length > 0)
}
