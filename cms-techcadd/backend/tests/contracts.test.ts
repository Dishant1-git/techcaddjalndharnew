import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { client, pool, resetTables, startServer, stopServer, type Client } from './helpers.js'

/**
 * The rules that hold across every module.
 *
 * Each of these started as a real bug found by driving the CMS against MySQL,
 * and each one was invisible from a single module's tests — they are properties
 * of the request contract, so they belong in one place.
 */
let api: Client

beforeAll(async () => {
  await startServer()
  api = client()
  await api.signIn()
})

afterAll(stopServer)

beforeEach(async () => {
  await resetTables('testimonials', 'gallery_albums', 'courses', 'categories')
  await pool.query("DELETE FROM media WHERE folder = 'contract-test'")
})

async function seedMedia(): Promise<string> {
  const [rows] = await pool.query<any[]>(
    `INSERT INTO media (id, filename, url, mime_type, size, alt, folder, created_at, updated_at)
     VALUES (UUID(), 'probe.png', '/uploads/probe.png', 'image/png', 10, 'probe', 'contract-test', NOW(3), NOW(3))`,
  )
  void rows
  const [found] = await pool.query<any[]>(
    "SELECT id FROM media WHERE folder = 'contract-test' ORDER BY created_at DESC LIMIT 1",
  )
  return found[0].id as string
}

describe('absent means leave alone, empty means clear', () => {
  it('clears an optional relation when sent as an empty string', async () => {
    const category = await api.post('/categories', { name: 'Probe', slug: 'probe' })
    const course = await api.post('/courses', {
      title: 'Probe course',
      slug: 'probe-course',
      categoryId: category.body.id,
      shortDescription: 'x',
      duration: '4 weeks',
      fee: 100,
      level: 'beginner',
      mode: 'offline',
    })
    expect(course.body.categoryId).toBe(category.body.id)

    const cleared = await api.patch(`/courses/${course.body.id}`, {
      title: 'Probe course',
      slug: 'probe-course',
      categoryId: '',
      shortDescription: 'x',
      duration: '4 weeks',
      fee: 100,
      level: 'beginner',
      mode: 'offline',
    })
    expect(cleared.status).toBe(200)
    expect(cleared.body.categoryId).toBeUndefined()
  })

  it('accepts an empty foreign key on create rather than rejecting it', async () => {
    // A placeholder <option> submits '', which is not a valid id but is a
    // perfectly valid "none".
    const created = await api.post('/courses', {
      title: 'No category',
      slug: 'no-category',
      categoryId: '',
      shortDescription: 'x',
      duration: '1 week',
      fee: 0,
      level: 'beginner',
      mode: 'online',
    })
    expect(created.status).toBe(201)
    expect(created.body.categoryId).toBeUndefined()
  })

  it('does not turn an empty string into NULL for a NOT NULL column', async () => {
    // Blanket '' -> NULL once broke saving a trainer with blank qualifications.
    const album = await api.post('/gallery', { title: 'A', slug: 'album-a', description: 'text' })
    const blanked = await api.patch(`/gallery/${album.body.id}`, { title: 'A', description: '' })
    expect(blanked.status).toBe(200)
  })
})

describe('image slots', () => {
  it('removes an image when sent as null', async () => {
    const mediaId = await seedMedia()
    const album = await api.post('/gallery', {
      title: 'Cover probe',
      slug: 'cover-probe',
      cover: { id: mediaId },
    })
    expect(album.body.cover?.id).toBe(mediaId)

    const cleared = await api.patch(`/gallery/${album.body.id}`, { cover: null })
    expect(cleared.status).toBe(200)
    expect(cleared.body.cover).toBeUndefined()
  })

  it('leaves an image alone when the key is absent', async () => {
    const mediaId = await seedMedia()
    const album = await api.post('/gallery', {
      title: 'Keep probe',
      slug: 'keep-probe',
      cover: { id: mediaId },
    })

    const renamed = await api.patch(`/gallery/${album.body.id}`, { title: 'Renamed' })
    expect(renamed.body.cover?.id).toBe(mediaId)
  })
})

describe('partial updates', () => {
  it('does not apply create-time defaults to a patch', async () => {
    // `.partial()` does not strip `.default()`, so a drag-reorder sending only
    // `{ order }` would silently reset status to draft.
    const category = await api.post('/categories', {
      name: 'Ordered',
      slug: 'ordered',
      status: 'published',
    })

    const reordered = await api.patch(`/categories/${category.body.id}`, { order: 5 })
    expect(reordered.body.order).toBe(5)
    expect(reordered.body.status).toBe('published')
  })
})

describe('error contract', () => {
  it('reports an unknown foreign key as a field error, not a server fault', async () => {
    const res = await api.post('/courses', {
      title: 'Ghost',
      slug: 'ghost',
      categoryId: '00000000-0000-0000-0000-000000000000',
      shortDescription: 'x',
      duration: '1 week',
      fee: 0,
      level: 'beginner',
      mode: 'online',
    })

    expect(res.status).toBe(422)
    expect(res.body.fieldErrors?.categoryId).toBeTruthy()
  })

  it('keys validation errors by form field name', async () => {
    const res = await api.post('/categories', { name: '', slug: 'Not A Slug' })
    expect(res.status).toBe(422)
    expect(Object.keys(res.body.fieldErrors)).toContain('slug')
  })
})

describe('client-generated ids', () => {
  it('accepts a prefixed id that would not fit the column', async () => {
    // Forms mint ids locally for React keys: `img_<uuid>` is 41 characters
    // against CHAR(36). The server must not store it verbatim.
    const mediaId = await seedMedia()
    const album = await api.post('/gallery', {
      title: 'Id probe',
      slug: 'id-probe',
      images: [{ id: `img_${crypto.randomUUID()}`, media: { id: mediaId }, order: 0 }],
    })

    expect(album.status).toBe(201)
    expect(album.body.images).toHaveLength(1)
    expect(album.body.images[0].id).toMatch(/^[0-9a-f-]{36}$/)
  })
})

describe('authentication', () => {
  it('refuses every module without a session', async () => {
    const anonymous = client()
    for (const path of ['/courses', '/categories', '/media', '/users', '/settings']) {
      expect((await anonymous.get(path)).status, path).toBe(401)
    }
  })
})
