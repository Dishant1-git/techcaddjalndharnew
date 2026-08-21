// Copies CMS content out of the shared database into Jalandhar's own.
//
// Why this exists
// ---------------
// Both this project and the TechCADD Hoshiarpur checkout were configured with
// DB_NAME=techcadd_cms, so they were reading and writing one database. That was
// survivable until Hoshiarpur's 016_remove_unused_modules.sql ran, which drops
// thirteen tables belonging to this CMS on purpose — pages, banners, faculty,
// branches, testimonials, gallery, redirects and their children. Its own header
// says so: "Every table dropped here is from the original Jalandhar CMS."
//
// After that, six modules in this CMS had nothing to read. Restoring the tables
// into the shared database would only postpone it until the next time the other
// project migrates, so the fix is a database of its own.
//
// What it does
// ------------
// Reads from `techcadd_cms`, writes to `techcadd_cms_jal`. The source is only
// ever SELECTed, so the other project keeps working and this is undoable by
// dropping the target database.
//
// Columns are intersected rather than assumed: the two schemas have drifted
// apart, so `SELECT *` would fail on the first table that differs. Anything the
// source no longer has is left at its column default.
//
// INSERT IGNORE, so running it twice is safe — rows already copied are skipped
// on their primary key rather than duplicated.
//
// Usage
// -----
//   cd cms-techcadd/backend
//   node scripts/copy-to-jalandhar-db.mjs
//
// Take a dump first if you want a way back:
//   mysqldump -u root -p techcadd_cms > backup.sql

import mysql from 'mysql2/promise'
import { readFileSync } from 'node:fs'

const FROM = process.env.COPY_FROM ?? 'techcadd_cms'
const TO = process.env.COPY_TO ?? 'techcadd_cms_jal'

/** Reads DB credentials out of .env without pulling in the app's config. */
function env() {
  const out = {}
  try {
    for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
      if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    // Fall through to process.env.
  }
  return { ...out, ...process.env }
}

const config = env()

// Parents before children, so the foreign keys have something to point at.
const ORDER = [
  'users',
  'media',
  'settings',
  'categories',
  'courses',
  'course_syllabus',
  'course_highlights',
  'course_gallery',
  'course_sections',
  'blogs',
  'blog_tags',
  'faqs',
  'reviews',
  'enquiries',
  'enquiry_notes',
]

const db = await mysql.createConnection({
  host: config.DB_HOST ?? 'localhost',
  port: Number(config.DB_PORT ?? 3306),
  user: config.DB_USER ?? 'root',
  password: config.DB_PASSWORD ?? '',
  multipleStatements: false,
})

async function columns(schema, table) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME AS c FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
    [schema, table],
  )
  return rows.map((r) => r.c)
}

console.log(`Copying ${FROM} -> ${TO}\n`)

// Off for the duration: the copy runs parent-first, but a row that points at
// something the other project deleted would still fail, and losing the whole
// copy over one orphan is worse than carrying it across.
await db.query('SET FOREIGN_KEY_CHECKS = 0')

let total = 0

for (const table of ORDER) {
  const src = await columns(FROM, table)
  const dst = await columns(TO, table)

  if (src.length === 0) {
    console.log(`skip  ${table}  (not in ${FROM})`)
    continue
  }
  if (dst.length === 0) {
    console.log(`skip  ${table}  (not in ${TO} — run db:migrate first)`)
    continue
  }

  const shared = src.filter((c) => dst.includes(c))
  const missing = dst.filter((c) => !src.includes(c))
  const list = shared.map((c) => `\`${c}\``).join(', ')

  const [res] = await db.query(
    `INSERT IGNORE INTO \`${TO}\`.\`${table}\` (${list})
     SELECT ${list} FROM \`${FROM}\`.\`${table}\``,
  )

  total += res.affectedRows
  console.log(
    `copy  ${table.padEnd(20)} ${String(res.affectedRows).padStart(5)} rows` +
      (missing.length ? `   (default used for: ${missing.join(', ')})` : ''),
  )
}

/*
  Rows that already existed in the target, and so were skipped above.

  INSERT IGNORE is right for content — a blog copied twice must not become two
  blogs — but it is wrong for the handful of records that migrating and seeding
  create on the way in. `settings` is a singleton keyed id=1, and `db:seed`
  writes an admin user; both were already sitting there, so the source's values
  were dropped silently. That cost the site its contact email and phone number,
  which /public/site reads and the footer prints.

  These are reconciled with an UPDATE instead, matched on whatever identifies
  the same record in both databases.
*/
const RECONCILE = [
  { table: 'settings', key: 'id' },
  { table: 'users', key: 'email' },
]

for (const { table, key } of RECONCILE) {
  const src = await columns(FROM, table)
  const dst = await columns(TO, table)
  if (src.length === 0 || dst.length === 0) continue

  // Never overwrite the match key, and never a surrogate id that other tables
  // already point at in the target.
  const shared = src
    .filter((c) => dst.includes(c))
    .filter((c) => c !== key && c !== 'id')

  if (shared.length === 0) continue

  const assignments = shared.map((c) => 't.`' + c + '` = s.`' + c + '`').join(', ')

  const [res] = await db.query(
    'UPDATE `' + TO + '`.`' + table + '` t ' +
      'JOIN `' + FROM + '`.`' + table + '` s ON s.`' + key + '` = t.`' + key + '` ' +
      'SET ' + assignments,
  )

  console.log(
    `sync  ${table.padEnd(20)} ${String(res.affectedRows).padStart(5)} rows updated (on ${key})`,
  )
}

await db.query('SET FOREIGN_KEY_CHECKS = 1')
await db.end()

console.log(`\n${total} rows copied. ${FROM} was not modified.`)
