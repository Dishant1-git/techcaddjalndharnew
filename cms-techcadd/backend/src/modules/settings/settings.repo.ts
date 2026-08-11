import { execute, queryOne, type Row } from '../../db/pool.js'
import type { SettingsPatch } from './settings.schema.js'

/** The settings row's fixed primary key — there is only ever one. */
const SINGLETON_ID = 1

/** mysql2 parses JSON columns already; guard anyway for a legacy row. */
function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return value as T
}

interface Profile {
  name: string
  email: string
}

function toSettings(row: Row, profile: Profile): unknown {
  return {
    siteName: row.site_name,
    tagline: row.tagline ?? undefined,
    logo: row.logo_id ? { id: row.logo_id, url: row.logo_url, alt: row.logo_alt ?? '' } : undefined,
    favicon: row.favicon_id
      ? { id: row.favicon_id, url: row.favicon_url, alt: row.favicon_alt ?? '' }
      : undefined,
    contactEmail: row.contact_email ?? undefined,
    contactPhone: row.contact_phone ?? undefined,
    address: row.address ?? undefined,
    social: parseJson(row.social, {}),
    robotsTxt: row.robots_txt,
    notifications: {
      newEnquiryEmail: false,
      dailyEnquiryDigest: false,
      contentPublished: false,
      ...parseJson(row.notifications, {}),
    },
    integrations: parseJson(row.integrations, {}),
    // Identity comes from the session, not the settings row: storing it would
    // let it drift out of step with the user account it describes.
    profile,
  }
}

const SELECT_SETTINGS = `
  SELECT s.*,
         l.url AS logo_url,    l.alt AS logo_alt,
         f.url AS favicon_url, f.alt AS favicon_alt
    FROM settings s
    LEFT JOIN media l ON l.id = s.logo_id
    LEFT JOIN media f ON f.id = s.favicon_id
   WHERE s.id = ?
   LIMIT 1
`

export async function get(profile: Profile): Promise<unknown> {
  const row = await queryOne<Row>(SELECT_SETTINGS, [SINGLETON_ID])

  // The migration seeds the row, so this only happens if it was deleted by
  // hand. Recreating it beats failing every request on the settings page.
  if (!row) {
    await execute(
      `INSERT INTO settings (id, site_name, robots_txt, social, notifications, integrations, created_at, updated_at)
       VALUES (?, 'TechCADD', 'User-agent: *\\nAllow: /\\n', '{}', '{}', '{}', NOW(3), NOW(3))`,
      [SINGLETON_ID],
    )
    const seeded = await queryOne<Row>(SELECT_SETTINGS, [SINGLETON_ID])
    return toSettings(seeded as Row, profile)
  }

  return toSettings(row, profile)
}

/** Columns where '' means "clear this" — see the note in faculty.repo.ts. */
const NULLABLE = new Set(['tagline', 'contact_email', 'contact_phone', 'address'])

const SCALARS: Record<string, string> = {
  siteName: 'site_name',
  tagline: 'tagline',
  contactEmail: 'contact_email',
  contactPhone: 'contact_phone',
  address: 'address',
  robotsTxt: 'robots_txt',
}

/**
 * Merges rather than replaces the JSON groups.
 *
 * Each settings card saves on its own, so a request that carries only
 * `{ integrations: { analyticsId } }` must not wipe the WhatsApp number
 * stored beside it.
 */
async function mergedJson(
  column: string,
  patch: Record<string, unknown> | undefined,
): Promise<string | undefined> {
  if (patch === undefined) return undefined

  const row = await queryOne<Row>(`SELECT ${column} FROM settings WHERE id = ? LIMIT 1`, [
    SINGLETON_ID,
  ])
  const current = parseJson<Record<string, unknown>>(row?.[column], {})
  return JSON.stringify({ ...current, ...patch })
}

export async function update(patch: SettingsPatch, profile: Profile): Promise<unknown> {
  const assignments: string[] = []
  const params: unknown[] = []

  for (const [key, column] of Object.entries(SCALARS)) {
    const value = patch[key as keyof SettingsPatch]
    if (value === undefined) continue
    assignments.push(`${column} = ?`)
    params.push(value === '' && NULLABLE.has(column) ? null : value)
  }

  if (patch.logo !== undefined) {
    assignments.push('logo_id = ?')
    params.push(patch.logo?.id ?? null)
  }
  if (patch.favicon !== undefined) {
    assignments.push('favicon_id = ?')
    params.push(patch.favicon?.id ?? null)
  }

  for (const [column, value] of [
    ['social', await mergedJson('social', patch.social)],
    ['notifications', await mergedJson('notifications', patch.notifications)],
    ['integrations', await mergedJson('integrations', patch.integrations)],
  ] as const) {
    if (value === undefined) continue
    assignments.push(`${column} = ?`)
    params.push(value)
  }

  if (assignments.length > 0) {
    await execute(
      `UPDATE settings SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
      [...params, SINGLETON_ID],
    )
  }

  return get(profile)
}
