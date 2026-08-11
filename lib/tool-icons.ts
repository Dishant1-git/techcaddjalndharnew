import { CAPABILITIES } from "./capabilities"
import { TECH_CATEGORIES, type Tech } from "./technologies"

/**
 * Resolves a tool name from a course spec to a brand mark.
 *
 * The marks already exist across the technology orbit and the capabilities
 * grid, so this indexes those rather than importing simple-icons a third time.
 * Anything unmatched falls back to initials, which is why a missing icon never
 * leaves a hole in the grid.
 */
const INDEX = new Map<string, Tech>()

for (const group of [...TECH_CATEGORIES, ...CAPABILITIES]) {
  for (const item of group.items) {
    const key = item.name.toLowerCase()
    if (!INDEX.has(key)) INDEX.set(key, item)
  }
}

/** Names that differ between a spec and the icon set. */
const ALIASES: Record<string, string> = {
  "python 3": "python",
  "java 21": "java",
  "php 8": "php",
  "google analytics 4": "google cloud",
  "search console": "google cloud",
  "google search console": "google cloud",
  "meta ads manager": "meta ads",
  "meta commerce": "meta ads",
  "google merchant center": "google ads",
  "keyword planner": "google ads",
  "tableau desktop": "tableau",
  "tableau public": "tableau",
  "power query": "power bi",
  dax: "power bi",
  "power bi service": "power bi",
  "sql server": "mysql",
  sql: "mysql",
  "vs code": "typescript",
  "google colab": "jupyter",
  "android studio": "kotlin",
  "jetpack compose": "kotlin",
  ubuntu: "linux",
  centos: "linux",
  bash: "linux",
  systemd: "linux",
  ssh: "linux",
  gcc: "c",
  "code::blocks": "c",
  gdb: "c",
  leetcode: "c",
  edrawings: "solidworks",
  "solidworks simulation": "solidworks",
  "autocad lt": "autocad",
  "dwg trueview": "autocad",
  "autodesk viewer": "autocad",
  navisworks: "revit",
  enscape: "revit",
  "v-ray": "3ds max",
  corona: "3ds max",
  photoshop: "figma",
  "openai api": "anthropic",
  chatgpt: "anthropic",
  claude: "anthropic",
  gemini: "anthropic",
  perplexity: "anthropic",
  "notion ai": "anthropic",
  "canva ai": "canva",
  langgraph: "langchain",
  pinecone: "langchain",
  chromadb: "langchain",
  "vector dbs": "langchain",
  "hugging face": "hugging face",
  "google business profile": "google ads",
  "tag manager": "google ads",
  "google tag manager": "google ads",
  "looker studio": "google cloud",
  "merchant center": "google ads",
  klaviyo: "mailchimp",
  buffer: "mailchimp",
  zapier: "mailchimp",
  capcut: "canva",
  instagram: "meta ads",
  "owasp zap": "owasp",
  "john the ripper": "kali linux",
  hydra: "kali linux",
  nmap: "kali linux",
  composer: "php",
  cpanel: "php",
  cloudflare: "cloudflare",
  "shopify seo": "shopify",
  liquid: "shopify",
  "yoast seo": "wordpress",
  woocommerce: "wordpress",
  elementor: "wordpress",
  "jetbrains": "java",
  "intellij idea": "java",
  maven: "java",
  junit: "java",
  postman: "postman",
  ubersuggest: "semrush",
  "screaming frog": "semrush",
  ahrefs: "semrush",
  streamlit: "streamlit",
  "google sheets": "google cloud",
  excel: "power bi",
  "industry-standard toolchain": "git",
}

export function toolIcon(name: string): Tech | undefined {
  const key = name.toLowerCase().trim()
  return INDEX.get(key) ?? INDEX.get(ALIASES[key] ?? "")
}

/** Two letters for anything the icon set does not cover. */
export function toolInitials(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
