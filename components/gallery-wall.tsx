"use client"

import { useState } from "react"
import DriftWall from "./drift-wall"
import { GalleryLightbox } from "./gallery-lightbox"
import type { GalleryTile } from "@/lib/gallery"

/**
 * The drifting wall plus the carousel it opens.
 *
 * Exists so the gallery page can stay a Server Component: this is the only
 * piece that needs state, and it is just the index of the open image.
 */
export function GalleryWall({ tiles }: { tiles: GalleryTile[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null)

  return (
    <>
      <DriftWall
        items={tiles}
        /*
          Ten columns rather than five. At 200px plus a 14px gap, and with the
          plane's own 1.18 scale, that spans roughly 2525px — enough to reach
          both edges on anything up to an ultrawide. Fewer columns leave the
          wall floating in the middle of the section with bare margins.
        */
        columns={10}
        tileWidth={200}
        tileHeight={130}
        gap={14}
        /*
          Flat and square-on: no pitch, no yaw, no roll, and no depth, so the
          grid reads as a vertical wall rather than a receding 3D plane.
          `parallax={0}` matters just as much — left on, the wall would tilt
          again the moment the pointer moved across it.
        */
        tilt={0}
        turn={0}
        roll={0}
        depth={0}
        parallax={0}
        perspective={1200}
        speed={38}
        direction="up"
        variance={0.45}
        lift={64}
        /*
          No resting dim and a transparent tint — the photographs show at their
          own brightness instead of sitting behind a navy wash. Hover still
          lifts a tile and restores full saturation.
        */
        dim={1}
        overlayColor="transparent"
        /* Replaces the component's elliptical mask, which is what left the top
           of the box and both side margins empty. */
        className="drift-wall--bleed"
        /* The wall repeats each tile down its column, so the clicked copy only
           matters as a starting position — the carousel carries all of them. */
        onSelect={(_item, index) => setOpenAt(index)}
      />

      <GalleryLightbox
        tiles={tiles}
        index={openAt}
        onClose={() => setOpenAt(null)}
        onIndexChange={setOpenAt}
      />
    </>
  )
}
