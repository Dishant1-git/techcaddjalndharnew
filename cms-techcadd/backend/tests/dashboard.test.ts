import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { client, resetTables, startServer, stopServer, type Client } from './helpers.js'

let api: Client

beforeAll(async () => {
  await startServer()
  api = client()
  await api.signIn()
})

afterAll(stopServer)

beforeEach(async () => {
  await resetTables('enquiries', 'courses', 'categories')
})

describe('dashboard summary', () => {
  it('answers every panel in one request', async () => {
    const res = await api.get('/dashboard/summary')

    expect(res.status).toBe(200)
    for (const key of [
      'totals',
      'today',
      'enquiryTrend',
      'contentOverview',
      'recentActivity',
      'recentEnquiries',
      'recentCourses',
    ]) {
      expect(res.body, key).toHaveProperty(key)
    }
  })

  it('returns seven trend points including days with nothing', async () => {
    await api.post('/enquiries', { studentName: 'Trend', phone: '9000000000' })

    const { body } = await api.get('/dashboard/summary')
    // Grouped in SQL, then padded — a day with no enquiries still needs a bar.
    expect(body.enquiryTrend).toHaveLength(7)
    expect(body.enquiryTrend.at(-1).date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(body.enquiryTrend.reduce((sum: number, p: any) => sum + p.value, 0)).toBe(1)
  })

  it('counts today separately from the total', async () => {
    await api.post('/enquiries', { studentName: 'Today', phone: '9000000001' })

    const { body } = await api.get('/dashboard/summary')
    expect(body.totals.enquiries).toBe(1)
    expect(body.today.newEnquiries).toBe(1)
  })

  it('adds up content by status across tables', async () => {
    await api.post('/courses', {
      title: 'Live', slug: 'live', shortDescription: 'x', duration: '1w',
      fee: 0, level: 'beginner', mode: 'online', status: 'published',
    })
    await api.post('/courses', {
      title: 'Hidden', slug: 'hidden', shortDescription: 'x', duration: '1w',
      fee: 0, level: 'beginner', mode: 'online', status: 'draft',
    })

    const { body } = await api.get('/dashboard/summary')
    expect(body.contentOverview.published).toBeGreaterThanOrEqual(1)
    expect(body.contentOverview.draft).toBeGreaterThanOrEqual(1)
    expect(body.contentOverview.total).toBe(
      body.contentOverview.published + body.contentOverview.draft + body.contentOverview.review,
    )
  })

  it('returns recent rows in the same shape the list endpoints do', async () => {
    await api.post('/courses', {
      title: 'Shape', slug: 'shape', shortDescription: 'x', duration: '1w',
      fee: 500, level: 'beginner', mode: 'online',
    })

    const summary = await api.get('/dashboard/summary')
    const listed = await api.get('/courses?pageSize=6&sort=updatedAt&dir=desc')

    // The dashboard components render full entities, so a trimmed shape here
    // would mean two competing definitions of a course.
    expect(summary.body.recentCourses[0]).toEqual(listed.body.items[0])
  })

  it('needs a session', async () => {
    expect((await client().get('/dashboard/summary')).status).toBe(401)
  })
})

describe('global search', () => {
  beforeEach(async () => {
    await api.post('/courses', {
      title: 'React Fundamentals', slug: 'react-fundamentals', shortDescription: 'x',
      duration: '6w', fee: 100, level: 'beginner', mode: 'online',
    })
  })

  it('finds a partial word', async () => {
    // Why LIKE rather than FULLTEXT: the box has to match while the user is
    // still typing.
    const res = await api.get('/search?q=rea')
    const courses = res.body.groups.find((g: any) => g.key === 'courses')
    expect(courses?.hits?.[0]?.label).toBe('React Fundamentals')
  })

  it('groups hits by what they are', async () => {
    await api.post('/enquiries', { studentName: 'React Fan', phone: '9000000002' })

    const res = await api.get('/search?q=react')
    expect(res.body.groups.map((g: any) => g.key).sort()).toEqual(['courses', 'enquiries'])
  })

  it('omits groups with nothing in them', async () => {
    const res = await api.get('/search?q=react')
    expect(res.body.groups.every((g: any) => g.hits.length > 0)).toBe(true)
  })

  it('ignores a term too short to narrow anything', async () => {
    const res = await api.get('/search?q=r')
    expect(res.body.groups).toEqual([])
  })

  it('needs a session', async () => {
    expect((await client().get('/search?q=react')).status).toBe(401)
  })
})
