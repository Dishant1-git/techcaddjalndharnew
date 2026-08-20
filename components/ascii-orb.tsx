"use client"

import { useEffect, useRef } from "react"

/**
 * The rotating ASCII sphere from the Optimus hero: points distributed over a
 * unit sphere, spun in 3D, projected with perspective and drawn as monospace
 * glyphs whose opacity falls off with depth.
 */

/** Duplicated entries are simply more frequent — this roughly matches the
 *  glyph mix in the reference (lots of T / ⊥ / | / parens, a few blocks). */
const GLYPHS = [
  "T", "T", "T", "⊥", "⊥", "⊥", "|", "|", "|",
  "(", ")", "[", "]", "⌐", "¬", "L", "J",
  "-", "_", "=", "+", "/", "\\",
  "▪", "▮", "·", ".", ":", "'", "`",
]

const POINTS = 1700
const FPS = 30
/** Depth bands — one fillStyle change per band instead of per glyph. */
const BANDS = 14
const CAM_Z = 2.75

type Pt = { x: number; y: number; z: number; g: string }

/** Fibonacci lattice — the only distribution that stays evenly spaced as it
 *  rotates, so the silhouette reads as a sphere rather than as banding. */
function sphere(): Pt[] {
  const pts: Pt[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < POINTS; i++) {
    const y = 1 - (i / (POINTS - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    pts.push({
      x: Math.cos(theta) * r,
      y,
      z: Math.sin(theta) * r,
      // Stable per-point glyph, so characters don't flicker between frames.
      g: GLYPHS[(i * 7919) % GLYPHS.length],
    })
  }
  return pts
}

export function AsciiOrb({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pts = sphere()

    /*
      The one thing on the site that must NOT follow the site font. Every cell
      here is placed on a fixed character grid, so a proportional face — Inter,
      which `--font-mono` now resolves to — would leave the columns ragged and
      the sphere would stop reading as a sphere. It asks the platform for a real
      monospace directly rather than going through the theme token, which is
      also why dropping the JetBrains Mono webfont did not affect it.
    */
    const fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace"

    let w = 0
    let h = 0
    let radius = 0
    let baseSize = 12

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      if (!w || !h) return
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      radius = Math.min(w, h) * 0.42
      baseSize = Math.max(8, Math.min(w, h) * 0.021)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Depth buckets, reused every frame to avoid per-frame allocation.
    // Each entry is [screenX, screenY, fontSize, glyph].
    const bands: Array<Array<[number, number, number, string]>> = Array.from(
      { length: BANDS },
      () => [],
    )

    const draw = (t: number) => {
      if (!w || !h) return
      ctx.clearRect(0, 0, w, h)

      const yaw = t * 0.42
      const pitch = 0.34 + Math.sin(t * 0.21) * 0.1
      const cy1 = Math.cos(yaw)
      const sy1 = Math.sin(yaw)
      const cp = Math.cos(pitch)
      const sp = Math.sin(pitch)
      const cx = w / 2
      const cyPix = h / 2

      for (const band of bands) band.length = 0

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]

        // Y-axis spin, then a gentle X-axis tilt.
        const rx = p.x * cy1 - p.z * sy1
        const rz0 = p.x * sy1 + p.z * cy1
        const ry = p.y * cp - rz0 * sp
        const rz = p.y * sp + rz0 * cp

        const persp = CAM_Z / (CAM_Z - rz)
        const sx = cx + rx * radius * persp
        const sy = cyPix + ry * radius * persp

        // Cull generously — the orb is clipped by its container anyway.
        if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) continue

        // depth: 0 at the back of the sphere, 1 at the front.
        const depth = (rz + 1) / 2
        const band = Math.min(BANDS - 1, (depth * BANDS) | 0)
        bands[band].push([sx, sy, baseSize * (0.72 + depth * 0.55) * persp, p.g])
      }

      // Painter's algorithm: back bands first so near glyphs sit on top.
      for (let b = 0; b < BANDS; b++) {
        const items = bands[b]
        if (!items.length) continue

        const depth = (b + 0.5) / BANDS
        const alpha = 0.05 + Math.pow(depth, 1.7) * 0.62

        // Far side stays neutral slate; the near face picks up techcadd blue.
        const mix = Math.pow(depth, 2.2)
        const r = Math.round(148 + (37 - 148) * mix)
        const g = Math.round(163 + (99 - 163) * mix)
        const bl = Math.round(184 + (235 - 184) * mix)

        ctx.fillStyle = `rgba(${r},${g},${bl},${alpha.toFixed(3)})`

        let lastSize = -1
        for (let i = 0; i < items.length; i++) {
          const [x, y, size, glyph] = items[i]
          const rounded = Math.round(size * 2) / 2
          if (rounded !== lastSize) {
            ctx.font = `${rounded}px ${fontFamily}`
            lastSize = rounded
          }
          ctx.fillText(glyph, x, y)
        }
      }
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      draw(0.8)
      return () => ro.disconnect()
    }

    let raf = 0
    let last = 0
    const start = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (now - last < 1000 / FPS) return
      last = now
      draw((now - start) / 1000)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />
  )
}
