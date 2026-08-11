import { describe, expect, it } from 'vitest'
import { deflateSync } from 'node:zlib'

import { readDimensions } from '../src/modules/media/dimensions.js'

/** A real PNG, so the header the reader parses is the one a browser writes. */
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

function jpeg(width: number, height: number): Buffer {
  const sof = Buffer.alloc(11)
  sof.writeUInt16BE(0xffc0, 0)
  sof.writeUInt16BE(11, 2)
  sof[4] = 8
  sof.writeUInt16BE(height, 5)
  sof.writeUInt16BE(width, 7)
  sof[9] = 1
  return Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    Buffer.from([0xff, 0xe0, 0x00, 0x04, 0x00, 0x00]),
    sof,
    Buffer.from([0xff, 0xd9]),
  ])
}

function gif(width: number, height: number): Buffer {
  const header = Buffer.alloc(13)
  header.write('GIF87a', 0, 'ascii')
  header.writeUInt16LE(width, 6)
  header.writeUInt16LE(height, 8)
  return header
}

describe('readDimensions', () => {
  it('reads a PNG', () => {
    expect(readDimensions(png(120, 80))).toEqual({ width: 120, height: 80 })
  })

  it('reads a JPEG past its APP0 segment', () => {
    expect(readDimensions(jpeg(640, 480))).toEqual({ width: 640, height: 480 })
  })

  it('reads a GIF', () => {
    expect(readDimensions(gif(32, 24))).toEqual({ width: 32, height: 24 })
  })

  it('returns nothing for a format it does not handle', () => {
    expect(readDimensions(Buffer.from('%PDF-1.4'))).toEqual({})
  })

  it('returns nothing rather than throwing on a truncated file', () => {
    expect(readDimensions(png(10, 10).subarray(0, 12))).toEqual({})
  })

  it('returns nothing for an empty buffer', () => {
    expect(readDimensions(Buffer.alloc(0))).toEqual({})
  })

  /**
   * The reason this module exists.
   *
   * A segment claiming a length below 2 never advances the offset, which is the
   * infinite loop behind the advisories against `image-size`. It must terminate.
   */
  it('terminates on a JPEG whose segment length would not advance', () => {
    const malicious = Buffer.concat([
      Buffer.from([0xff, 0xd8]),
      Buffer.from([0xff, 0xe0, 0x00, 0x00]), // length 0
      Buffer.alloc(64),
    ])
    expect(readDimensions(malicious)).toEqual({})
  })

  it('terminates on a run of segments that never reaches a frame header', () => {
    const filler = Buffer.concat(
      Array.from({ length: 400 }, () => Buffer.from([0xff, 0xe0, 0x00, 0x02])),
    )
    const noFrame = Buffer.concat([Buffer.from([0xff, 0xd8]), filler])
    expect(readDimensions(noFrame)).toEqual({})
  })
})
