import {
  siApachemaven, siBuffer, siClaude, siComposer, siCpanel, siElevenlabs,
  siFastapi, siGooglecolab, siGooglegemini, siGooglesheets, siGoogletagmanager,
  siGradio, siInstagram, siIntellijidea, siJunit5, siKaggle, siMilvus,
  siMistralai, siMlflow, siN8n, siNotion, siOllama, siPerplexity, siQdrant,
  siReplicate, siSpacy, siZapier,
} from "simple-icons"
import { CAPABILITIES } from "./capabilities"
import { TECH_CATEGORIES, type Tech } from "./technologies"

/**
 * Resolves a tool name from a course spec to a brand mark.
 *
 * Most marks already exist across the technology orbit and the capabilities
 * grid, so this indexes those rather than importing simple-icons for them a
 * third time. EXTRA below covers the tools that appear in course specs but on
 * neither of those two display surfaces. Anything still unmatched falls back to
 * initials, which is why a missing icon never leaves a hole in the grid.
 */
const INDEX = new Map<string, Tech>()

type Icon = { path: string; hex: string }
const ico = (icon: Icon, name: string): Tech => ({
  name,
  path: icon.path,
  hex: icon.hex,
})

/**
 * Hand-built chip for marks simple-icons does not distribute — several of the
 * best-known AI brands among them, since simple-icons drops logos whose owners
 * restrict reuse. Initials in the brand colour are the honest substitute; a
 * lookalike from another vendor is not, which is what the aliases below used to
 * do.
 */
const mono = (name: string, mono: string, hex: string): Tech => ({
  name,
  mono,
  hex,
})

const EXTRA: Tech[] = [
  // --- LLMs and AI apps ---
  ico(siClaude, "Claude"),
  ico(siGooglegemini, "Gemini"),
  ico(siPerplexity, "Perplexity"),
  ico(siMistralai, "Mistral"),
  ico(siOllama, "Ollama"),
  ico(siGradio, "Gradio"),
  ico(siReplicate, "Replicate"),
  ico(siElevenlabs, "ElevenLabs"),
  ico(siNotion, "Notion"),
  /* OpenAI's mark is not in simple-icons; 10A37F is its own brand green. */
  mono("ChatGPT", "GPT", "10A37F"),

  // --- Vector stores ---
  ico(siQdrant, "Qdrant"),
  ico(siMilvus, "Milvus"),
  /* Neither ships a mark. The hexes are neutral stand-ins, not brand colours. */
  mono("Pinecone", "Pc", "1B1F3B"),
  mono("ChromaDB", "Ch", "3B3663"),

  // --- Python tooling ---
  ico(siFastapi, "FastAPI"),
  ico(siGooglecolab, "Google Colab"),
  ico(siKaggle, "Kaggle"),
  ico(siSpacy, "spaCy"),
  ico(siMlflow, "MLflow"),

  // --- Java tooling ---
  ico(siIntellijidea, "IntelliJ IDEA"),
  ico(siApachemaven, "Maven"),
  ico(siJunit5, "JUnit"),

  // --- Web and marketing ---
  ico(siComposer, "Composer"),
  ico(siCpanel, "cPanel"),
  ico(siGoogletagmanager, "Tag Manager"),
  ico(siGooglesheets, "Google Sheets"),
  ico(siInstagram, "Instagram"),
  ico(siBuffer, "Buffer"),
  ico(siZapier, "Zapier"),
  ico(siN8n, "n8n"),
  mono("Canva", "Cv", "00C4CC"),
  mono("Photoshop", "Ps", "31A8FF"),
  mono("VS Code", "VS", "007ACC"),
  mono("Excel", "Xl", "217346"),
]

for (const group of [...TECH_CATEGORIES, ...CAPABILITIES]) {
  for (const item of group.items) {
    const key = item.name.toLowerCase()
    if (!INDEX.has(key)) INDEX.set(key, item)
  }
}

for (const item of EXTRA) {
  const key = item.name.toLowerCase()
  if (!INDEX.has(key)) INDEX.set(key, item)
}

/**
 * Names that differ between a spec and the icon set.
 *
 * An alias must point at the *same* product under another name — "python 3" to
 * Python, "google colab" to Colab. It must never point at a different vendor
 * for want of a mark: ChatGPT, Claude, Gemini and Perplexity all pointed at
 * Anthropic here, and Pinecone and ChromaDB at LangChain, so four AI brands
 * rendered under a competitor's logo. Where no mark exists, EXTRA carries a
 * lettered chip instead.
 */
const ALIASES: Record<string, string> = {
  "python 3": "python",
  "java 21": "java",
  "php 8": "php",
  "google analytics 4": "analytics",
  "google search console": "search console",
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
  "openai api": "chatgpt",
  "chatgpt api": "chatgpt",
  "claude api": "claude",
  "google gemini": "gemini",
  "notion ai": "notion",
  "canva ai": "canva",
  langgraph: "langchain",
  /* Genuinely generic — no single product to point at, and LangChain is the
     course's own route to one. */
  "vector dbs": "langchain",
  /* Same vendor, no mark of their own in the set. */
  "google business profile": "google ads",
  "google tag manager": "tag manager",
  "looker studio": "google cloud",
  "merchant center": "google ads",
  "owasp zap": "owasp",
  cloudflare: "cloudflare",
  "shopify seo": "shopify",
  liquid: "shopify",
  "yoast seo": "wordpress",
  woocommerce: "wordpress",
  elementor: "wordpress",
  jetbrains: "intellij idea",
  /* Both are SEO crawlers with no mark in the set. Semrush is the one this
     course teaches them alongside, not a claim that they are the same tool. */
  ubersuggest: "semrush",
  "screaming frog": "semrush",
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
