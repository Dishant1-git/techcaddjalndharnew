import { pool, query } from './pool.js'

/**
 * Prints what is currently in the database — row counts, then a peek at the
 * tables you actually look at day to day. Read-only.
 *
 *   npm run db:inspect
 */
const TABLES = [
  'users',
  'courses',
  'categories',
  'branches',
  'media',
  'sessions',
  'course_syllabus',
  'course_highlights',
  'course_branches',
  'course_gallery',
  'password_resets',
] as const

async function inspect(): Promise<void> {
  console.log('\nRow counts')
  console.log('----------')
  for (const table of TABLES) {
    const rows = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM \`${table}\``)
    console.log(`  ${table.padEnd(20)} ${rows[0]?.n ?? 0}`)
  }

  const users = await query<{ name: string; email: string; role: string; active: number }>(
    'SELECT name, email, role, active FROM users ORDER BY created_at',
  )
  console.log('\nUsers')
  console.log('-----')
  for (const user of users) {
    console.log(`  ${user.email}  (${user.role})${user.active ? '' : '  [deactivated]'}`)
  }

  const courses = await query<{ title: string; slug: string; fee: string; status: string }>(
    'SELECT title, slug, fee, status FROM courses ORDER BY updated_at DESC LIMIT 10',
  )
  console.log('\nCourses (latest 10)')
  console.log('-------------------')
  if (courses.length === 0) console.log('  (none yet)')
  for (const course of courses) {
    console.log(`  ${course.title}  /${course.slug}  ₹${course.fee}  [${course.status}]`)
  }

  const sessions = await query<{ email: string; expires_at: string }>(
    `SELECT u.email, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.expires_at > NOW(3)`,
  )
  console.log('\nActive sessions')
  console.log('---------------')
  if (sessions.length === 0) console.log('  (none — nobody signed in)')
  for (const session of sessions) {
    console.log(`  ${session.email}  expires ${session.expires_at}`)
  }

  console.log('')
}

inspect()
  .catch((error: unknown) => {
    console.error('Inspect failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
