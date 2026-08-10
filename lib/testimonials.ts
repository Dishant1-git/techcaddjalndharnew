/**
 * Student and hiring-partner voices for the testimonials band.
 * `from`/`to` are the Tailwind gradient stops for the initials avatar, kept in
 * the same brand range the FAQ card uses.
 */

export type Testimonial = {
  quote: string
  name: string
  role: string
  initials: string
  from: string
  to: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I joined the 6-month MERN batch straight after B.Tech with almost no coding confidence. The live projects are what got me through my interviews.",
    name: "Simranjeet Kaur",
    role: "Frontend Developer, Mohali",
    initials: "SK",
    from: "from-brand-600",
    to: "to-brand-400",
  },
  {
    quote:
      "The Data Science trainers went far beyond the syllabus. Doubt sessions after class were the difference between understanding a model and just running it.",
    name: "Harman Sidhu",
    role: "Data Analyst, Gurugram",
    initials: "HS",
    from: "from-accent-500",
    to: "to-accent-400",
  },
  {
    quote:
      "My 45-day industrial training turned into a job offer. The placement cell prepped my resume and set up three interviews in the same month.",
    name: "Aditya Verma",
    role: "Python Developer, Chandigarh",
    initials: "AV",
    from: "from-ink",
    to: "to-brand-700",
  },
  {
    quote:
      "As a working professional I needed evening batches, and Techcadd let me switch between the campus and the live online class whenever my shifts moved.",
    name: "Neha Bansal",
    role: "Digital Marketing Lead, Ludhiana",
    initials: "NB",
    from: "from-brand-700",
    to: "to-accent-500",
  },
  {
    quote:
      "We hire from the Jalandhar centre every year. Their students arrive knowing Git, deployment and how to read someone else's code — that is rare.",
    name: "Rajiv Malhotra",
    role: "Engineering Manager, hiring partner",
    initials: "RM",
    from: "from-brand-500",
    to: "to-accent-400",
  },
  {
    quote:
      "The ethical hacking lab is properly set up. Working on real machines instead of slides is what made the certification worth it for me.",
    name: "Gurpreet Singh",
    role: "Security Analyst, Bengaluru",
    initials: "GS",
    from: "from-ink",
    to: "to-brand-500",
  },
]

/** Social-proof strip under the heading. */
export const TESTIMONIAL_META = {
  rating: "4.9/5 Rating",
  count: "750+ Reviews",
  community: "15K+ Alumni network",
}
