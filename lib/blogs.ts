export type Post = {
  title: string
  excerpt: string
  /** Where the post lives, and a stable key for the card. */
  href: string
  /**
   * Whether there is an article behind the card.
   *
   * Posts written in the CMS have a body and a page; the teasers below do not,
   * so a card built from one must not link — it would be a 404 on every click.
   */
  hasArticle?: boolean
  category: string
  /** ISO date — formatted at render time so the markup stays locale-agnostic. */
  date: string
  readTime: string
  /**
   * Cover photograph, used by the /blogs index cards.
   *
   * TODO: these are the three photographs in the repo, cycled — no post has art
   * of its own yet. Swap in real covers and this field is the only thing that
   * changes.
   */
  image: string
  /** Tailwind gradient pair for the homepage teaser's cover placeholder. */
  from: string
  to: string
}

/** Stable across server and client — `toLocaleDateString` is not. */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

/** Shared by the homepage teasers and the /blogs index, so one post can never
 *  show two different dates depending on where it is rendered. */
export function formatPostDate(iso: string) {
  const [year, month, day] = iso.split("-")
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`
}

const TEAM = "/assets/images/about/team.jpg"
const MENTORING = "/assets/images/about/mentoring.webp"
const LAB = "/assets/images/about/lab-demo.webp"

/**
 * Placeholder copy — swap for real posts once the blog is wired to a CMS.
 *
 * Newest first: /blogs renders the list in order, and the homepage takes the
 * top three, so the ordering here is what "latest" means on both.
 */
export const POSTS: Post[] = [
  {
    title: "Which AI course should you actually take after B.Tech?",
    excerpt:
      "Machine learning, deep learning or generative AI — the three tracks overlap far less than the course names suggest. Here's how to pick.",
    href: "/blogs/which-ai-course-after-btech",
    category: "AI & Data",
    date: "2026-07-28",
    readTime: "6 min read",
    image: LAB,
    from: "from-brand-500",
    to: "to-accent-500",
  },
  {
    title: "MERN vs MEAN in 2026: what Jalandhar employers are hiring for",
    excerpt:
      "We pulled the stack requirements from every drive our placement cell ran last quarter. The gap between the two is smaller than you think.",
    href: "/blogs/mern-vs-mean-2026",
    category: "Full-Stack",
    date: "2026-07-14",
    readTime: "8 min read",
    image: MENTORING,
    from: "from-violet-500",
    to: "to-brand-600",
  },
  {
    title: "How to make your 6-month industrial training actually count",
    excerpt:
      "Most students treat training as a formality for their university file. The ones who get placed treat it as their first job.",
    href: "/blogs/make-industrial-training-count",
    category: "Careers",
    date: "2026-06-30",
    readTime: "5 min read",
    image: TEAM,
    from: "from-accent-400",
    to: "to-brand-700",
  },
  {
    title: "A realistic first portfolio for a data analytics fresher",
    excerpt:
      "Three projects, one dashboard and a README that explains your decisions. That beats a certificate wall in every interview we have sat in on.",
    href: "/blogs/data-analytics-first-portfolio",
    category: "AI & Data",
    date: "2026-06-16",
    readTime: "7 min read",
    image: MENTORING,
    from: "from-brand-600",
    to: "to-accent-400",
  },
  {
    title: "Python or Java first? A straight answer for beginners",
    excerpt:
      "Both are taught here and both lead somewhere. The right one depends on whether you want to see output quickly or learn the rules properly.",
    href: "/blogs/python-or-java-first",
    category: "Programming",
    date: "2026-05-29",
    readTime: "5 min read",
    image: LAB,
    from: "from-brand-700",
    to: "to-brand-400",
  },
  {
    title: "What a cyber security fresher is actually asked in interviews",
    excerpt:
      "Less about exotic exploits than about networking fundamentals, logs and how carefully you explain what you did and why.",
    href: "/blogs/cyber-security-interview-questions",
    category: "Cyber & Cloud",
    date: "2026-05-12",
    readTime: "9 min read",
    image: TEAM,
    from: "from-violet-600",
    to: "to-brand-500",
  },
  {
    title: "Digital marketing in 2026: the skills that survived AI",
    excerpt:
      "Copy generation got cheap; judgement did not. The roles being filled now are the ones that can read a number and change a plan.",
    href: "/blogs/digital-marketing-skills-2026",
    category: "Marketing",
    date: "2026-04-27",
    readTime: "6 min read",
    image: MENTORING,
    from: "from-accent-500",
    to: "to-brand-600",
  },
  {
    title: "From AutoCAD to a design job: the path nobody explains",
    excerpt:
      "Drafting software is the entry ticket, not the destination. Here is what mechanical and civil students should learn next.",
    href: "/blogs/autocad-to-design-job",
    category: "CAD/CAM",
    date: "2026-04-08",
    readTime: "7 min read",
    image: LAB,
    from: "from-brand-400",
    to: "to-accent-500",
  },
  {
    title: "Six weeks or six months? Choosing a training length honestly",
    excerpt:
      "A short batch proves you can learn. A long one proves you can ship. Which you need depends on how far off your placement season is.",
    href: "/blogs/six-weeks-or-six-months",
    category: "Careers",
    date: "2026-03-24",
    readTime: "4 min read",
    image: TEAM,
    from: "from-brand-500",
    to: "to-violet-600",
  },
]
