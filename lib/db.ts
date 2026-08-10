import mysql from "mysql2/promise"
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise"

/**
 * The single MySQL connection point for the site.
 *
 * Nothing here knows what a table is — callers own their SQL. Keeping the
 * pool in one file means credentials are read once, connection limits are
 * tuned once, and a route that needs the database is a two-line import.
 */

/** Fails loudly at first use rather than silently connecting to nothing. */
function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in the environment.`)
  return value
}

function createPool(): Pool {
  return mysql.createPool({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),

    // A serverless/route handler holds a connection for milliseconds, so a
    // small pool serves far more traffic than the number suggests.
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE ?? 10),
    queueLimit: 0,
    enableKeepAlive: true,

    // Managed hosts (PlanetScale, Aiven, Azure) require TLS; a plain cPanel
    // or local MySQL does not. Opt in with DB_SSL=true.
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  })
}

/**
 * Next.js reloads modules on every edit in development, which would leak a
 * fresh pool per reload. Parking it on globalThis keeps exactly one.
 */
const globalForDb = globalThis as typeof globalThis & { __dbPool?: Pool }

export function getPool(): Pool {
  globalForDb.__dbPool ??= createPool()
  return globalForDb.__dbPool
}

/** What a `?` placeholder may be bound to. */
export type SqlValue = string | number | boolean | Date | Buffer | null

/** SELECT helper — returns the rows, typed by the caller. */
export async function query<T extends RowDataPacket>(
  sql: string,
  values: SqlValue[] = [],
): Promise<T[]> {
  const [rows] = await getPool().execute<T[]>(sql, values)
  return rows
}

/** INSERT/UPDATE/DELETE helper — returns insertId and affectedRows. */
export async function execute(
  sql: string,
  values: SqlValue[] = [],
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, values)
  return result
}

/** True when the database is reachable — used by the health check route. */
export async function ping(): Promise<boolean> {
  const connection = await getPool().getConnection()
  try {
    await connection.ping()
    return true
  } finally {
    connection.release()
  }
}
