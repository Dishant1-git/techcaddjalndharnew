import { pool, query, type Row } from './pool.js'

/**
 * Prints what is currently in the database. Read-only.
 *
 *   npm run db:inspect              row counts for every table
 *   npm run db:inspect courses      the rows in one table
 *   npm run db:inspect courses 50   ...with a different limit
 *
 * Tables are discovered from information_schema rather than listed here, so
 * this cannot fall behind the migrations the way a hand-written list does.
 */

const DEFAULT_LIMIT = 20

/** Long text and JSON make a terminal table unreadable; show enough to identify a row. */
function summarise(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (value instanceof Date) return value.toISOString()

  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return text.length > 40 ? `${text.slice(0, 37)}…` : text
}

async function tableNames(): Promise<string[]> {
  const rows = await query<{ name: string }>(
    `SELECT TABLE_NAME AS name FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME`,
  )
  return rows.map((row) => row.name)
}

async function counts(): Promise<void> {
  const names = await tableNames()

  console.log(`\n${names.length} tables in \`${process.env.DB_NAME}\`\n`)
  console.log('  rows  table')
  console.log('  ----  -----')

  let total = 0
  for (const name of names) {
    const rows = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM \`${name}\``)
    const n = Number(rows[0]?.n ?? 0)
    total += n
    // Dim the empty ones so the tables with content stand out.
    const line = `  ${String(n).padStart(4)}  ${name}`
    console.log(n === 0 ? `\x1b[2m${line}\x1b[0m` : line)
  }

  console.log(`\n  ${total} rows in total`)
  console.log('\nRun `npm run db:inspect <table>` to see the rows in one of them.\n')
}

async function dump(table: string, limit: number): Promise<void> {
  const names = await tableNames()
  if (!names.includes(table)) {
    console.error(`\nNo table called "${table}".\n`)
    console.error(`Available: ${names.join(', ')}\n`)
    process.exitCode = 1
    return
  }

  const countRows = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM \`${table}\``)
  const total = Number(countRows[0]?.n ?? 0)
  // The name came from information_schema, so it cannot be injected here.
  const rows = await query<Row>(`SELECT * FROM \`${table}\` LIMIT ${Number(limit)}`)

  console.log(`\n${table} — ${total} row${total === 1 ? '' : 's'}\n`)

  if (rows.length === 0) {
    console.log('  (empty)\n')
    return
  }

  // console.table gives aligned columns for free; the values are shortened
  // first so one long body column cannot push everything off screen.
  console.table(
    rows.map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key, summarise(value)])),
    ),
  )

  if (total > rows.length) {
    console.log(`  showing ${rows.length} of ${total} — pass a limit to see more\n`)
  }
}

const [table, limit] = process.argv.slice(2)

try {
  if (table) await dump(table, Number(limit) || DEFAULT_LIMIT)
  else await counts()
} finally {
  await pool.end()
}
