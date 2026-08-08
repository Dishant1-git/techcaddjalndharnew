/**
 * Navigation mirrored from the live TechCadd site (mohali.techcadd.com):
 * Home · About Us · AI · Courses (mega menu) · Internship & Training ·
 * After 12th Courses · Contact Us
 */

export type NavLink = {
  label: string
  href: string
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
  /** Present only on "Courses", which opens the mega menu. */
  groups?: CourseGroup[]
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

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "AI", href: "/ai" },
  { label: "Courses", href: "/courses", groups: COURSE_GROUPS },
  { label: "Internship & Training", href: "/internship-training" },
  { label: "After 12th", href: "/after-12th-courses" },
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
