/**
 * Navigation mirrored from the live Techcadd site (mohali.techcadd.com):
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

/** A picture-led entry in the right half of the featured dropdown. */
export type FeaturedCard = {
  title: string
  href: string
  image: string
  /** Tinted pill under the title. */
  tag: string
  /** Small caps line beside the tag — a date, a section, a count. */
  meta: string
}

export type NavItem = {
  label: string
  href: string
  /** Any item with groups opens the mega menu. */
  groups?: CourseGroup[]
  /** A flat list opens the compact dropdown instead — too few links to warrant
   *  the full-width mega menu. */
  links?: NavLink[]
  /** Pairs with `links` to open the wide two-part panel instead of the compact
   *  dropdown: the links become the category column, these become the cards. */
  featured?: FeaturedCard[]
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
    href: "/courses/artificial-intelligence",
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

/**
 * About Us — the institute's own story.
 *
 */
export const ABOUT_LINKS: NavLink[] = [
  { label: "About Techcadd", href: "/about" },
  { label: "Mission and Vision", href: "/about/mission-vision" },
  { label: "Our Founder", href: "/about/founder" },
]

/*
  TODO: the three photographs below are the only ones in the repo, so they are
  reused across both menus. Swap in art of the actual destination when it
  exists — only these `image` fields need to change.
*/
/*
  Titles and order deliberately mirror ABOUT_LINKS above: the cards are the
  picture-led version of the same destinations, not a second set of places to
  go. Keep the two lists in step — a card whose title does not appear in the
  column beside it reads as a different link.

  The tag and meta carry what the shared title cannot, so neither simply
  restates the words directly above it.
*/
export const ABOUT_FEATURED: FeaturedCard[] = [
  {
    title: "About Techcadd",
    href: "/about",
    image: "/assets/images/about/team.jpg",
    tag: "Story",
    meta: "Since 2016",
  },
  {
    title: "Mission and Vision",
    href: "/about/mission-vision",
    image: "/assets/images/about/mentoring.webp",
    tag: "Purpose",
    meta: "Our direction",
  },
  {
    title: "Our Founder",
    href: "/about/founder",
    image: "/assets/images/about/lab-demo.webp",
    tag: "Profile",
    meta: "Gourav Gupta",
  },
]

/**
 * Resources — everything around the courses rather than a course itself.
 *
 * These point at homepage sections because that is where the content actually
 * lives; there are no standalone /blogs, /faq or /reviews pages yet. Gallery
 * and College Partnerships are omitted for the same reason as Our Founder.
 */
export const RESOURCE_LINKS: NavLink[] = [
  { label: "Blogs", href: "/#blogs" },
  { label: "FAQ", href: "/#faq" },
  { label: "Reviews", href: "/#testimonials" },
]

/*
  Same rule as ABOUT_FEATURED — titles, order and hrefs mirror RESOURCE_LINKS
  exactly, so the three cards are now Blogs, FAQ and Reviews. Gallery was
  dropped with its link (/gallery does not exist) and Reviews took the third
  slot, which keeps the `sm:grid-cols-3` row full.
*/
export const RESOURCE_FEATURED: FeaturedCard[] = [
  {
    title: "Blogs",
    href: "/#blogs",
    image: "/assets/images/about/lab-demo.webp",
    tag: "Articles",
    meta: "Latest",
  },
  {
    title: "FAQ",
    href: "/#faq",
    image: "/assets/images/about/mentoring.webp",
    tag: "Answers",
    meta: "Admissions",
  },
  {
    title: "Reviews",
    href: "/#testimonials",
    image: "/assets/images/about/team.jpg",
    tag: "Students",
    meta: "In their words",
  },
]

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",
    links: ABOUT_LINKS,
    featured: ABOUT_FEATURED,
  },
  /* The pill is a dropdown trigger, but it still has to go somewhere when
     clicked or followed by a keyboard. /ai was never built; the AI course page
     is the real destination its menu is pointing at anyway. */
  { label: "AI", href: "/courses/artificial-intelligence", variant: "ai" },
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
  {
    label: "Resources",
    href: "/#blogs",
    links: RESOURCE_LINKS,
    featured: RESOURCE_FEATURED,
  },
  { label: "Contact Us", href: "/contact" },
]

/**
 * The footer's Support column, and the strip at the foot of the mobile menu.
 *
 * Previously Student Login, Placement Cell, Certificate Verification and
 * Franchise — four routes that were never built, so every one of them 404'd
 * from all 59 pages. Each is now pointed at content that exists. Restore the
 * originals as their pages are built; the portal ones in particular need real
 * systems behind them, not just a route.
 */
export const QUICK_LINKS: NavLink[] = [
  { label: "Placement Support", href: "/#why-us" },
  { label: "Student Reviews", href: "/#testimonials" },
  { label: "FAQs", href: "/#faq" },
  { label: "Enquire Now", href: "/contact" },
]

/**
 * Anchor id for a course-group heading, e.g. "AI & Data" → "ai-data".
 *
 * Shared deliberately: the footer links to /courses#<slug> and the index page
 * stamps the id. When each computed its own, the two drifted and the links
 * silently scrolled nowhere — a broken link no status code ever reports.
 */
export function groupSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")
}

export const CONTACT = {
  phone: "+91 98881 22255",
  phoneHref: "tel:+919888122255",
  email: "info@techcadd.com",
  emailHref: "mailto:info@techcadd.com",
}
