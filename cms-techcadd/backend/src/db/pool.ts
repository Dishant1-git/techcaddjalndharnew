import mysql from 'mysql2/promise'
import type { ExecuteValues, QueryValues, ResultSetHeader, RowDataPacket } from 'mysql2'

import { config } from '../config.js'

/**
 * One shared pool for the process. Creating a connection per request is the
 * usual cause of "too many connections" under load.
 */
export const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Return DATETIME as a string rather than a JS Date. The API serialises ISO
  // strings, and letting the driver build Dates re-interprets them in the
  // server's local timezone, which silently shifts every timestamp.
  dateStrings: true,
  charset: 'utf8mb4_unicode_ci',
  namedPlaceholders: true,
})

/** Rows typed loosely at the driver edge; each repository narrows them. */
export type Row = Record<string, unknown>

/**
 * Bound parameters, as callers naturally write them.
 *
 * mysql2's own `QueryValues` rejects `unknown` and readonly arrays, so the
 * conversion happens once here rather than forcing every call site to satisfy
 * the driver's type. This is the only cast in the data layer, and it sits
 * exactly at the driver boundary.
 */
export type QueryParams = readonly unknown[] | Record<string, unknown>

const toQueryValues = (params: QueryParams): QueryValues => params as QueryValues
const toExecuteValues = (params: QueryParams): ExecuteValues => params as ExecuteValues

export async function query<T = Row>(sql: string, params?: QueryParams): Promise<T[]> {
  const [rows] =
    params === undefined
      ? await pool.query<RowDataPacket[]>(sql)
      : await pool.query<RowDataPacket[]>(sql, toQueryValues(params))
  return rows as T[]
}

export async function queryOne<T = Row>(sql: string, params?: QueryParams): Promise<T | undefined> {
  const rows = await query<T>(sql, params)
  return rows[0]
}

export async function execute(sql: string, params?: QueryParams): Promise<void> {
  if (params === undefined) await pool.execute<ResultSetHeader>(sql)
  else await pool.execute<ResultSetHeader>(sql, toExecuteValues(params))
}

/**
 * Runs `work` inside a transaction, rolling back on any error. Anything that
 * writes a parent plus its children — a course and its syllabus, an album and
 * its images — must go through this. A half-written record is worse than a
 * rejected one.
 */
export async function transaction<T>(
  work: (connection: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await work(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function verifyConnection(): Promise<void> {
  const connection = await pool.getConnection()
  try {
    await connection.ping()
  } finally {
    connection.release()
  }
}
