/**
 * Intrinsic width and height, read from the file header.
 *
 * Written by hand rather than pulled from a package: the obvious choice,
 * `image-size`, carries unfixed high-severity advisories where crafted ICNS,
 * JXL and HEIF files send its parsers into infinite loops. An upload endpoint
 * is exactly the place an attacker controls those bytes.
 *
 * Only the formats the CMS accepts are handled, every read is bounds-checked,
 * and the one loop that exists (JPEG segment walking) is explicitly capped.
 * Anything unrecognised returns no dimensions, which is not an error — the
 * consumers treat them as optional.
 */
export interface Dimensions {
  width?: number
  height?: number
}

const NONE: Dimensions = {}

function png(buffer: Buffer): Dimensions {
  // 8-byte signature, then an IHDR chunk whose width/height sit at 16..24.
  if (buffer.length < 24) return NONE
  if (buffer.toString('ascii', 12, 16) !== 'IHDR') return NONE
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

function gif(buffer: Buffer): Dimensions {
  if (buffer.length < 10) return NONE
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) }
}

function webp(buffer: Buffer): Dimensions {
  if (buffer.length < 30) return NONE
  const format = buffer.toString('ascii', 12, 16)

  // Lossy: dimensions are 14 bits each, after a 3-byte start code.
  if (format === 'VP8 ') {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff }
  }

  // Lossless: 14 bits each, packed across four bytes.
  if (format === 'VP8L') {
    const bits = buffer.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }

  // Extended: 24-bit little-endian, stored as value - 1.
  if (format === 'VP8X') {
    const width = buffer.readUIntLE(24, 3) + 1
    const height = buffer.readUIntLE(27, 3) + 1
    return { width, height }
  }

  return NONE
}

/** Frame markers that carry the dimensions. DHT (c4), DAC (cc) and the RSTn range do not. */
function isStartOfFrame(marker: number): boolean {
  return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
}

function jpeg(buffer: Buffer): Dimensions {
  let offset = 2 // past the SOI marker

  // A malformed file could otherwise walk forever; real JPEGs reach the frame
  // header in a handful of segments.
  for (let segments = 0; segments < 128; segments++) {
    if (offset + 4 > buffer.length) return NONE
    if (buffer[offset] !== 0xff) return NONE

    const marker = buffer[offset + 1] ?? 0
    if (isStartOfFrame(marker)) {
      // marker(2) length(2) precision(1) height(2) width(2)
      if (offset + 9 > buffer.length) return NONE
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) }
    }

    const length = buffer.readUInt16BE(offset + 2)
    // A segment length below 2 would not advance the offset — that is the
    // infinite loop the advisories are about.
    if (length < 2) return NONE
    offset += 2 + length
  }

  return NONE
}

export function readDimensions(buffer: Buffer): Dimensions {
  try {
    if (buffer.length >= 8 && buffer.readUInt32BE(0) === 0x89504e47) return png(buffer)
    if (buffer.length >= 3 && buffer.toString('ascii', 0, 3) === 'GIF') return gif(buffer)
    if (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return webp(buffer)
    }
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) return jpeg(buffer)
  } catch {
    // A truncated or malformed file should cost the upload its dimensions,
    // not fail the request.
    return NONE
  }

  return NONE
}
