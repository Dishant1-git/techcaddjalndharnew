/**
 * Where each capability logo sends the reader.
 *
 * The capabilities panel is the densest set of recognisable names on the site,
 * and every one of them was inert. Linking them turns the grid into an entry
 * point for the course pages: someone who came looking for "PyTorch" lands on
 * Deep Learning rather than bouncing.
 *
 * Two tiers, so no icon is ever a dead end:
 *
 *   1. TECH_COURSE — a specific course where one genuinely teaches that tool.
 *   2. CAPABILITY_COURSE — the group's own course, used for everything else.
 *      Docker under Cybersecurity should not go to Cloud Computing, so the
 *      fallback is per group rather than per tool.
 *
 * Every href here must be a real route: these render on the homepage, so one
 * dead entry is a 404 on the most-visited page on the site.
 */

/** The course a whole capability group stands for. */
export const CAPABILITY_COURSE: Record<string, string> = {
  "ai-ml": "/courses/artificial-intelligence",
  "full-stack": "/courses/web-development",
  data: "/courses/data-science",
  cloud: "/courses/cloud-computing",
  security: "/courses/cybersecurity",
  marketing: "/courses/digital-marketing",
}

/**
 * Tool → the course that actually teaches it, keyed by lowercased name.
 *
 * Only listed where the match is real. A database engine has no course of its
 * own, so PostgreSQL and MySQL fall through to Data Science rather than being
 * pointed somewhere approximate.
 */
const TECH_COURSE: Record<string, string> = {
  // AI & Machine Learning
  tensorflow: "/courses/deep-learning",
  pytorch: "/courses/deep-learning",
  keras: "/courses/deep-learning",
  "scikit-learn": "/courses/machine-learning",
  "hugging face": "/courses/generative-ai",
  langchain: "/courses/rag-development",
  anthropic: "/courses/chatgpt-ai-tools",
  pandas: "/courses/data-science",
  numpy: "/courses/data-science",
  jupyter: "/courses/data-science",

  // Full-Stack Engineering
  react: "/courses/mern-stack",
  "next.js": "/courses/mern-stack",
  angular: "/courses/mean-stack",
  "node.js": "/courses/mern-stack",
  express: "/courses/mern-stack",
  django: "/courses/python",
  laravel: "/courses/php-full-stack",
  typescript: "/courses/mean-stack",
  "tailwind css": "/courses/web-designing",
  html5: "/courses/web-designing",
  sass: "/courses/web-designing",
  css: "/courses/web-designing",

  // Data & Analytics
  mongodb: "/courses/mern-stack",
  "power bi": "/courses/power-bi",
  plotly: "/courses/data-analytics",

  // Cloud & DevOps
  linux: "/courses/linux",

  // Cybersecurity
  "kali linux": "/courses/ethical-hacking",
  metasploit: "/courses/ethical-hacking",
  wireshark: "/courses/ethical-hacking",
  owasp: "/courses/ethical-hacking",
  "burp suite": "/courses/ethical-hacking",
  nmap: "/courses/ethical-hacking",
  python: "/courses/python",

  // Digital Marketing
  wordpress: "/courses/wordpress",
  shopify: "/courses/shopify",
  "google ads": "/courses/google-ads",
  analytics: "/courses/digital-marketing",
  "search console": "/courses/seo",
  semrush: "/courses/seo",
  mailchimp: "/courses/digital-marketing",
  "meta ads": "/courses/social-media-marketing",
  figma: "/courses/web-designing",
}

/** The course a given logo should link to. Never returns an unroutable path. */
export function capabilityHref(techName: string, capabilityId: string): string {
  return (
    TECH_COURSE[techName.toLowerCase()] ??
    CAPABILITY_COURSE[capabilityId] ??
    "/courses"
  )
}
