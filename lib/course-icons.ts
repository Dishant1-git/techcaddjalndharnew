import { toolIcon, toolInitials } from "./tool-icons"

/**
 * Brand mark for a course card.
 *
 * Course labels are not tool names — "Machine Learning" and "Ethical Hacking"
 * are subjects, not products — so this maps each to the mark a student would
 * recognise it by, then falls back to the existing tool resolver for the many
 * that *are* named after their tool (Python, AutoCAD, Shopify).
 *
 * Resolved on the server and passed down as plain data. Calling this from the
 * client would pull the whole simple-icons index into the browser bundle for
 * the sake of about thirty paths.
 */

export type CourseMark = {
  /** SVG path data when a brand mark exists. */
  path?: string
  /** Brand colour without the leading '#'. Brand blue when nothing matched. */
  hex: string
  /** Shown when there is no path — the brand's own monogram, or initials. */
  mono: string
}

/** The site's brand blue, for subjects with no mark of their own. */
const FALLBACK_HEX = "2563eb"

/**
 * Course label → the tool that best represents it.
 *
 * A miss here is harmless: the label falls through to the tool resolver, and
 * failing that renders as initials, so no card is ever left with a hole.
 */
const COURSE_ALIASES: Record<string, string> = {
  // Programming
  "c & c++": "c++",
  "c and c++": "c++",
  "web designing": "html5",
  "web development": "react",
  "mern stack": "react",
  "mean stack": "angular",
  "php full stack": "php",
  "full stack development": "react",

  // AI and data
  "artificial intelligence": "tensorflow",
  "machine learning": "scikit-learn",
  "deep learning": "pytorch",
  "data science": "pandas",
  "data analytics": "power bi",
  "generative ai": "anthropic",
  "prompt engineering": "anthropic",
  "chatgpt & ai tools": "anthropic",
  "agentic ai": "langchain",
  "rag (retrieval-augmented generation)": "langchain",
  "rag development": "langchain",
  "ai-powered courses": "anthropic",
  "ai-powered marketing": "google ads",
  "ml & ai": "tensorflow",
  "machine learning & ai": "tensorflow",

  // Marketing
  "digital marketing": "google ads",
  "digital marketing & communication": "google ads",
  "social media marketing": "meta ads",
  seo: "semrush",

  // Cyber and cloud
  cybersecurity: "kali linux",
  "cyber security": "kali linux",
  "ethical hacking": "kali linux",
  "cloud computing": "google cloud",

  // Training formats have no tool of their own; the mark would be arbitrary,
  // so they are left to fall through to initials deliberately.
}

export function courseMark(label: string): CourseMark {
  const key = label.toLowerCase().trim()
  const tech = toolIcon(COURSE_ALIASES[key] ?? key) ?? toolIcon(key)

  return {
    path: tech?.path,
    hex: tech?.hex ?? FALLBACK_HEX,
    mono: tech?.mono ?? toolInitials(label),
  }
}
