export type Post = {
  title: string
  excerpt: string
  /**
   * Where the post will live. Nothing renders this as a link today — there is
   * no /blog route and these have no bodies — so it currently serves only as a
   * stable key. The cards start linking again once the posts are real.
   */
  href: string
  category: string
  /** ISO date — formatted at render time so the markup stays locale-agnostic. */
  date: string
  readTime: string
  /** Tailwind gradient pair for the cover placeholder. */
  from: string
  to: string
}

/**
 * Homepage blog teasers. Placeholder copy — swap for real posts (and add cover
 * images) once the blog is wired to a CMS.
 */
export const POSTS: Post[] = [
  {
    title: "Which AI course should you actually take after B.Tech?",
    excerpt:
      "Machine learning, deep learning or generative AI — the three tracks overlap far less than the course names suggest. Here's how to pick.",
    href: "/blog/which-ai-course-after-btech",
    category: "AI & Data",
    date: "2026-07-28",
    readTime: "6 min read",
    from: "from-brand-500",
    to: "to-accent-500",
  },
  {
    title: "MERN vs MEAN in 2026: what Jalandhar employers are hiring for",
    excerpt:
      "We pulled the stack requirements from every drive our placement cell ran last quarter. The gap between the two is smaller than you think.",
    href: "/blog/mern-vs-mean-2026",
    category: "Full-Stack",
    date: "2026-07-14",
    readTime: "8 min read",
    from: "from-violet-500",
    to: "to-brand-600",
  },
  {
    title: "How to make your 6-month industrial training actually count",
    excerpt:
      "Most students treat training as a formality for their university file. The ones who get placed treat it as their first job.",
    href: "/blog/make-industrial-training-count",
    category: "Careers",
    date: "2026-06-30",
    readTime: "5 min read",
    from: "from-accent-400",
    to: "to-brand-700",
  },
]
