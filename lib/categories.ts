export type CourseCategory = {
  id: string
  label: string
  blurb: string
  href: string
  /**
   * Cover photo, e.g. "/assets/images/categories/ai.jpg". Left undefined until
   * real art exists — the card falls back to its gradient treatment.
   */
  image?: string
  /** Tailwind gradient pair used for the fallback cover. */
  from: string
  to: string
}

export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: "ai",
    label: "Artificial Intelligence",
    blurb: "Models, agents and RAG systems built for production.",
    href: "/courses/artificial-intelligence",
    from: "from-brand-500",
    to: "to-brand-900",
  },
  {
    id: "full-stack",
    label: "Full-Stack Development",
    blurb: "MERN, MEAN and PHP stacks, schema to deploy.",
    href: "/courses/mern-stack",
    from: "from-violet-500",
    to: "to-brand-800",
  },
  {
    id: "data",
    label: "Data Science",
    blurb: "Analytics, dashboards and decision intelligence.",
    href: "/courses/data-science",
    from: "from-accent-400",
    to: "to-brand-800",
  },
  {
    id: "security",
    label: "Cybersecurity",
    blurb: "Ethical hacking, hardening and incident response.",
    href: "/courses/cybersecurity",
    from: "from-emerald-400",
    to: "to-brand-900",
  },
  {
    id: "marketing",
    label: "Digital Marketing",
    blurb: "Search, paid media and storefronts that convert.",
    href: "/courses/digital-marketing",
    from: "from-rose-400",
    to: "to-brand-800",
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    blurb: "Containers, pipelines and infrastructure you can hand over.",
    href: "/courses/cloud-computing",
    from: "from-sky-400",
    to: "to-brand-900",
  },
]
