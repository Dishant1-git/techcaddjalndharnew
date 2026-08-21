export type GalleryTile = {
  image: string
  /** Used as the tile's alt text and its accessible name. */
  title: string
  /**
   * Where the photograph goes when clicked, if the CMS gave it one.
   *
   * A tile without a link opens the lightbox, which is what every photograph
   * did before. A tile with one navigates instead: an award that opens the
   * certificate, a campus shot that opens the branch page. Making it do both
   * would mean guessing which the visitor meant.
   */
  href?: string
}

/*
  Dummy gallery content.

  TODO: these cycle the three photographs that exist in the repo, because the
  site's CSP is `img-src 'self' data: blob:` — a remote placeholder host such as
  picsum.photos is blocked outright, so filler has to be local. Drop real photos
  into public/assets/images/gallery/ and point the `image` fields at them; the
  wall reads its tile count straight off this array, so adding entries is the
  only change needed.
*/
const TEAM = "/assets/images/about/team.jpg"
const MENTORING = "/assets/images/about/mentoring.webp"
const LAB = "/assets/images/about/lab-demo.webp"

export const GALLERY_TILES: GalleryTile[] = [
  { image: TEAM, title: "Batch group photo at the Jalandhar centre" },
  { image: LAB, title: "AI and robotics lab session" },
  { image: MENTORING, title: "One-to-one mentoring" },
  { image: LAB, title: "Live project review" },
  { image: TEAM, title: "Campus placement drive" },
  { image: MENTORING, title: "Classroom in session" },
  { image: TEAM, title: "Certificate distribution" },
  { image: LAB, title: "Hardware and robotics demo" },
  { image: MENTORING, title: "Trainers with students" },
  { image: LAB, title: "Workshop at a partner college" },
  { image: TEAM, title: "Industrial training cohort" },
  { image: MENTORING, title: "Doubt-clearing session" },
  { image: LAB, title: "Chi-Chi, the AI robotic dog" },
  { image: TEAM, title: "Alumni meet" },
  { image: MENTORING, title: "Project presentation day" },
]
