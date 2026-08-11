import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { deflateSync } from 'node:zlib'

import { client, resetTables, startServer, stopServer, type Client } from './helpers.js'

const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR ?? 'uploads')

function png(width: number, height: number): Buffer {
  const table: number[] = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    let crc = 0xffffffff
    for (const byte of body) crc = (table[(crc ^ byte) & 0xff] as number) ^ (crc >>> 8)
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE((crc ^ 0xffffffff) >>> 0)
    return Buffer.concat([length, body, crcBuf])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const raw = Buffer.concat(
    Array.from({ length: height }, () =>
      Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3)]),
    ),
  )

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

let api: Client

function upload(files: [string, string, Buffer][], folder?: string) {
  const form = new FormData()
  for (const [name, type, bytes] of files) {
    form.append('files', new Blob([bytes], { type }), name)
  }
  if (folder) form.append('folder', folder)
  return api.post('/media', form)
}

beforeAll(async () => {
  await startServer()
  api = client()
  await api.signIn()
})

afterAll(async () => {
  // Delete through the API so the bytes go with the rows — otherwise the last
  // test in the file leaves a file behind in the upload directory.
  const remaining = await api.get('/media?pageSize=200')
  if (remaining.body?.items?.length) {
    await api.delete('/media', { ids: remaining.body.items.map((m: any) => m.id) })
  }
  await stopServer()
})

beforeEach(async () => {
  // Rows first: deleting through the API removes the files too.
  const existing = await api.get('/media?pageSize=200')
  if (existing.body?.items?.length) {
    await api.delete('/media', { ids: existing.body.items.map((m: any) => m.id) })
  }
  await resetTables('media')
})

describe('upload', () => {
  it('stores a file and reads its dimensions', async () => {
    const bytes = png(120, 80)
    const res = await upload([['photo one.png', 'image/png', bytes]], 'courses')

    expect(res.status).toBe(201)
    expect(Array.isArray(res.body)).toBe(true)

    const [file] = res.body
    expect(file.filename).toBe('photo one.png')
    expect(file.size).toBe(bytes.length)
    expect(file.width).toBe(120)
    expect(file.height).toBe(80)
    expect(file.folder).toBe('courses')

    const onDisk = await stat(join(UPLOAD_DIR, file.url.split('/').pop()))
    expect(onDisk.size).toBe(bytes.length)
  })

  it('never uses the supplied filename on disk', async () => {
    // The name is attacker-controlled, so it decides nothing about the path.
    const res = await upload([['../../escaped.png', 'image/png', png(4, 4)]])
    const stored = res.body[0].url.split('/').pop()

    expect(stored).toMatch(/^[0-9a-f-]{36}\.png$/)
    await expect(stat(resolve(UPLOAD_DIR, '../../escaped.png'))).rejects.toThrow()
  })

  it('refuses a type that is not on the list', async () => {
    const res = await upload([['evil.js', 'application/javascript', Buffer.from('alert(1)')]])
    expect(res.status).toBe(400)
  })

  it('refuses a file over the size limit', async () => {
    const res = await upload([['big.png', 'image/png', Buffer.alloc(11 * 1024 * 1024)]])
    expect(res.status).toBe(400)
  })

  it('accepts a file it cannot measure rather than failing the upload', async () => {
    const res = await upload([['brochure.pdf', 'application/pdf', Buffer.from('%PDF-1.4')]])
    expect(res.status).toBe(201)
    expect(res.body[0].width).toBeUndefined()
  })
})

describe('metadata', () => {
  it('allows alt text and folder to be edited', async () => {
    const [file] = (await upload([['a.png', 'image/png', png(4, 4)]])).body

    const patched = await api.patch(`/media/${file.id}`, {
      alt: 'Students in the lab',
      folder: 'branches',
    })
    expect(patched.body.alt).toBe('Students in the lab')
    expect(patched.body.folder).toBe('branches')
  })

  it('ignores attempts to rewrite facts about the stored file', async () => {
    const bytes = png(4, 4)
    const [file] = (await upload([['a.png', 'image/png', bytes]])).body

    const tampered = await api.patch(`/media/${file.id}`, {
      size: 1,
      url: '/uploads/somewhere-else.png',
    })
    expect(tampered.body.size).toBe(bytes.length)
    expect(tampered.body.url).toBe(file.url)
  })
})

describe('delete', () => {
  it('removes the bytes along with the row', async () => {
    const [file] = (await upload([['gone.png', 'image/png', png(4, 4)]])).body
    const stored = join(UPLOAD_DIR, file.url.split('/').pop())

    expect((await stat(stored)).size).toBeGreaterThan(0)
    expect((await api.delete('/media', { ids: [file.id] })).status).toBe(204)
    await expect(stat(stored)).rejects.toThrow()
  })

  it('leaves other files alone', async () => {
    const [keep] = (await upload([['keep.png', 'image/png', png(4, 4)]])).body
    const [drop] = (await upload([['drop.png', 'image/png', png(4, 4)]])).body

    await api.delete('/media', { ids: [drop.id] })

    const names = await readdir(UPLOAD_DIR)
    expect(names).toContain(keep.url.split('/').pop())
    expect(names).not.toContain(drop.url.split('/').pop())
  })
})
