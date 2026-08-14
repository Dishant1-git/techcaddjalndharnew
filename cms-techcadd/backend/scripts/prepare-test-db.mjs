import 'dotenv/config'
import mysql from 'mysql2/promise'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Creates and migrates the throwaway database the tests run against.
 *
 * The suite truncates tables, so it must never point at the database the CMS
 * is being developed against. `npm test` runs this first and then sets
 * DB_NAME, and tests/helpers.ts refuses to start unless the name ends in
 * `_test` — belt and braces, because the failure mode is silent data loss.
 */
const source = process.env.DB_NAME
if (!source) {
  console.error('DB_NAME is not set. Copy .env.example to .env first.')
  process.exit(1)
}

const target = process.env.TEST_DB_NAME ?? `${source}_test`
if (!/_test$/.test(target)) {
  console.error(`TEST_DB_NAME must end in "_test" (got "${target}").`)
  process.exit(1)
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
})

// Dropped and rebuilt each run, so a half-finished migration or a stray row
// from a killed run cannot affect the next one.
await connection.query(`DROP DATABASE IF EXISTS \`${target}\``)
await connection.query(
  `CREATE DATABASE \`${target}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
)
await connection.query(`USE \`${target}\``)

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'db', 'migrations')
const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort()

for (const file of files) {
  await connection.query(await readFile(join(migrationsDir, file), 'utf8'))
}

// The tests sign in as the seeded administrator, so the row has to exist.
const argon2 = (await import('argon2')).default
const { randomUUID } = await import('node:crypto')

const email = process.env.TEST_ADMIN_EMAIL ?? 'admin@techcadd.com'
const password = process.env.TEST_ADMIN_PASSWORD ?? 'ChangeMe123'

await connection.query(
  `INSERT INTO users (id, name, email, password_hash, role, active, created_at, updated_at)
   VALUES (?, 'techcadd-team', ?, ?, 'admin', 1, NOW(3), NOW(3))`,
  [randomUUID(), email, await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2 })],
)

await connection.end()
console.log(`test database ready: ${target} (${files.length} migrations)`)
