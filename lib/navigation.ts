/**
 * Navigation mirrored from the live TechCadd site (mohali.techcadd.com):
 * Home · About Us · AI · Courses (mega menu) · Internship & Training ·
 * After 12th Courses · Contact Us
 */

export type NavLink = {
  label: string
  href: string
  /** Optional pill beside the label, e.g. "Trending". */
  badge?: string
}

export type CourseGroup = {
  title: string
  /** Short mono index shown above the group title. */
  index: string
  blurb: string
  items: NavLink[]
}

export type NavItem = {
  label: string
  href: string
  /** Any item with groups opens the mega menu. */
  groups?: CourseGroup[]
  /** Footer link of the mega menu. Defaults to browsing all courses. */
  cta?: NavLink
  /** "ai" renders the highlighted pill and opens the AI panel instead. */
  variant?: "ai"
}

export type AiLink = NavLink & {
  /** Flags a course as in-demand — rendered as a badge. */
  hot?: boolean
}

export type AiColumn = {
  title: string
  icon: "spark" | "rocket"
  items: AiLink[]
}

/** Content of the AI panel — its own shape, not a CourseGroup. */
export const AI_MENU = {
  title: "Learn AI Skills.",
  blurb:
    "Build projects with machine learning, data science, automation, and generative AI.",
  columns: [
    {
      title: "AI Fundamentals",
      icon: "spark",
      items: [
        { label: "Generative AI", href: "/courses/generative-ai" },
        {
          label: "Artificial Intelligence (AI)",
          href: "/courses/artificial-intelligence",
        },
        { label: "Prompt Engineering", href: "/courses/prompt-engineering" },
        { label: "ChatGPT & AI Tools", href: "/courses/chatgpt-ai-tools", hot: true },
      ],
    },
    {
      title: "AI Development",
      icon: "rocket",
      items: [
        { label: "Agentic AI", href: "/courses/agentic-ai", hot: true },
        {
          label: "AI-Powered Marketing",
          href: "/courses/ai-powered-marketing",
          hot: true,
        },
        {
          label: "RAG (Retrieval-Augmented Generation)",
          href: "/courses/rag-development",
        },
        { label: "AI-Powered Courses", href: "/courses/ai-powered-courses" },
      ],
    },
  ] satisfies AiColumn[],
  featured: {
    badge: "Featured AI Course",
    title: "Artificial Intelligence Training in Jalandhar",
    href: "/courses/artificial-intelligence",
    /** Placeholder art — swap for a dedicated AI cover when one exists. */
    image: "/assets/images/about/lab-demo.webp",
  },
  cta: {
    text: "Start with AI fundamentals, then move into real projects and career-ready tools.",
    label: "Explore AI",
    href: "/ai",
  },
}

export const COURSE_GROUPS: CourseGroup[] = [
  {
    index: "01",
    title: "Programming",
    blurb: "Core languages and full-stack engineering",
    items: [
      { label: "Python", href: "/courses/python" },
      { label: "Java", href: "/courses/java" },
      { label: "C & C++", href: "/courses/c-cpp" },
      { label: "Kotlin", href: "/courses/kotlin" },
      { label: "Web Designing", href: "/courses/web-designing" },
      { label: "Web Development", href: "/courses/web-development" },
      { label: "MERN Stack", href: "/courses/mern-stack" },
      { label: "MEAN Stack", href: "/courses/mean-stack" },
      { label: "PHP Full Stack", href: "/courses/php-full-stack" },
    ],
  },
  {
    index: "02",
    title: "AI & Data",
    blurb: "Models, analytics and decision intelligence",
    items: [
      { label: "Artificial Intelligence", href: "/courses/artificial-intelligence" },
      { label: "Machine Learning", href: "/courses/machine-learning" },
      { label: "Deep Learning", href: "/courses/deep-learning" },
      { label: "Data Science", href: "/courses/data-science" },
      { label: "Data Analytics", href: "/courses/data-analytics" },
      { label: "Power BI", href: "/courses/power-bi" },
      { label: "Tableau", href: "/courses/tableau" },
    ],
  },
  {
    index: "03",
    title: "Digital Marketing",
    blurb: "Growth, performance and commerce",
    items: [
      { label: "Digital Marketing", href: "/courses/digital-marketing" },
      { label: "Social Media Marketing", href: "/courses/social-media-marketing" },
      { label: "Google Ads", href: "/courses/google-ads" },
      { label: "SEO", href: "/courses/seo" },
      { label: "WordPress", href: "/courses/wordpress" },
      { label: "Shopify", href: "/courses/shopify" },
    ],
  },
  {
    index: "04",
    title: "Cyber & Cloud",
    blurb: "Secure, resilient infrastructure",
    items: [
      { label: "Cybersecurity", href: "/courses/cybersecurity" },
      { label: "Ethical Hacking", href: "/courses/ethical-hacking" },
      { label: "Cloud Computing", href: "/courses/cloud-computing" },
      { label: "Linux", href: "/courses/linux" },
    ],
  },
]

/**
 * Internship & Training, grouped by duration. The intakes and the "Trending"
 * flags mirror the live Mohali nav; only the grouping is ours, since the
 * source lists all six flat.
 */
export const TRAINING_GROUPS: CourseGroup[] = [
  {
    index: "01",
    title: "Short Term",
    blurb: "Summer, winter and university-mandated batches",
    items: [
      {
        label: "45 Days Training",
        href: "/internship-training/45-days",
        badge: "Trending",
      },
      {
        label: "6 Weeks Training",
        href: "/internship-training/6-weeks",
        badge: "Trending",
      },
    ],
  },
  {
    index: "02",
    title: "Long Term",
    blurb: "Deeper tracks that finish with a live project",
    items: [
      { label: "4 Months Training", href: "/internship-training/4-months" },
      { label: "6 Months Training", href: "/internship-training/6-months" },
    ],
  },
  {
    index: "03",
    title: "Programmes",
    blurb: "Industry placement and internship letters",
    items: [
      {
        label: "Industrial Training",
        href: "/internship-training/industrial-training",
        badge: "Trending",
      },
      {
        label: "Internship Program",
        href: "/internship-training/internship-programme",
      },
      { label: "Placement Cell", href: "/placement-cell" },
    ],
  },
]

/** After 12th — the certificate programmes and skill tracks school-leavers take. */
export const AFTER_12TH_GROUPS: CourseGroup[] = [
  {
    index: "01",
    title: "6 Month Certificates",
    blurb: "One skill, job-ready in half a year",
    items: [
      {
        label: "Digital Marketing & Communication",
        href: "/after-12th-courses/digital-marketing-communication",
      },
      {
        label: "Python Programming",
        href: "/after-12th-courses/python-programming",
      },
      {
        label: "Machine Learning & AI",
        href: "/after-12th-courses/ml-ai",
        badge: "Trending",
      },
      { label: "Cybersecurity", href: "/after-12th-courses/cybersecurity" },
    ],
  },
  {
    index: "02",
    title: "1 Year Certificates",
    blurb: "Full programmes with internship and placement",
    items: [
      {
        label: "Generative AI",
        href: "/after-12th-courses/generative-ai",
        badge: "Trending",
      },
      {
        label: "Cloud Computing & DevOps",
        href: "/after-12th-courses/cloud-computing-devops",
      },
      {
        label: "AI & Data Science",
        href: "/after-12th-courses/ai-data-science",
      },
      {
        label: "Machine Learning & Deep Learning",
        href: "/after-12th-courses/machine-learning-deep-learning",
      },
      {
        label: "Cybersecurity & Ethical Hacking",
        href: "/after-12th-courses/cybersecurity-ethical-hacking",
      },
    ],
  },
  {
    index: "03",
    title: "Civil / Mechanical",
    blurb: "Design and drafting for engineering streams",
    items: [
      { label: "AutoCAD", href: "/courses/autocad" },
      { label: "SolidWorks", href: "/courses/solidworks" },
      { label: "3ds Max", href: "/courses/3ds-max" },
      { label: "Revit", href: "/courses/revit" },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "AI", href: "/ai", variant: "ai" },
  { label: "Courses", href: "/courses", groups: COURSE_GROUPS },
  {
    label: "Internship & Training",
    href: "/internship-training",
    groups: TRAINING_GROUPS,
    cta: { label: "See all training formats", href: "/internship-training" },
  },
  {
    label: "After 12th",
    href: "/after-12th-courses",
    groups: AFTER_12TH_GROUPS,
    cta: { label: "Browse After 12th courses", href: "/after-12th-courses" },
  },
  { label: "Contact Us", href: "/contact" },
]

export const QUICK_LINKS: NavLink[] = [
  { label: "Student Login", href: "/student-login" },
  { label: "Placement Cell", href: "/placement-cell" },
  { label: "Certificate Verification", href: "/certificate-verification" },
  { label: "Franchise", href: "/franchise" },
]

export const CONTACT = {
  phone: "+91 98881 22255",
  phoneHref: "tel:+919888122255",
  email: "info@techcadd.com",
  emailHref: "mailto:info@techcadd.com",
}
