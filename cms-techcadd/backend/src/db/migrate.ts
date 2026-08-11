import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

import { config } from '../config.js'

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations')

/**
 * Applies any `.sql` file in `migrations/` that has not run yet, in filename
 * order, recording each in `schema_migrations`. Re-running is safe.
 *
 * Deliberately simple: no down-migrations. Rolling a schema back on a live
 * database is rarely what you actually want — write a new forward migration.
 */
async function migrate(): Promise<void> {
  // Connect without a database first so we can create it if missing.
  const root = await mysql.createConnection({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    multipleStatements: true,
  })

  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.DB_NAME}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await root.end()

  const db = await mysql.createConnection({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    multipleStatements: true,
  })

  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       VARCHAR(255) NOT NULL PRIMARY KEY,
      applied_at DATETIME(3)  NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  const [applied] = await db.query<mysql.RowDataPacket[]>('SELECT name FROM schema_migrations')
  const done = new Set(applied.map((row) => row.name as string))

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort()

  let ran = 0
  for (const file of files) {
    if (done.has(file)) {
      console.log(`  skip  ${file} (already applied)`)
      continue
    }

    const sql = await readFile(join(migrationsDir, file), 'utf8')
    try {
      await db.query(sql)
      await db.query('INSERT INTO schema_migrations (name, applied_at) VALUES (?, NOW(3))', [file])
      console.log(`  apply ${file}`)
      ran += 1
    } catch (error) {
      console.error(`\nMigration failed: ${file}`)
      console.error(error instanceof Error ? error.message : error)
      await db.end()
      process.exit(1)
    }
  }

  await db.end()
  console.log(ran === 0 ? '\nSchema already up to date.' : `\nApplied ${ran} migration(s).`)
}

migrate().catch((error: unknown) => {
  console.error('Migration error:', error instanceof Error ? error.message : error)
  process.exit(1)
})
