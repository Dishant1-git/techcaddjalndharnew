/**
 * Reviews for the /reviews page.
 *
 * Deliberately separate from lib/testimonials.ts: those are marketing quotes
 * chosen for the homepage band, these carry the shape a review actually has —
 * a star rating, a date and the place it was left.
 *
 * TODO: placeholder content. Replace with the real Google Business Profile
 * reviews before publishing, and keep `source` honest — a card that shows the
 * Google mark is telling visitors it was left on Google.
 */

export type GoogleReview = {
  name: string
  initials: string
  /** Whole stars, 1–5. */
  rating: number
  /** Display string rather than an ISO date — these are month-precision. */
  date: string
  quote: string
  /** What they trained in, shown as a chip. */
  course: string
  /** Drives the Google badge. Only reviews genuinely left there may use it. */
  source: "google"
}

export const REVIEWS: GoogleReview[] = [
  {
    name: "Simranjeet Kaur",
    initials: "SK",
    rating: 5,
    date: "July 2026",
    quote:
      "I joined the 6-month MERN batch straight after B.Tech with almost no coding confidence. The live projects are what got me through my interviews — I had something real to talk about.",
    course: "MERN Stack",
    source: "google",
  },
  {
    name: "Harman Sidhu",
    initials: "HS",
    rating: 5,
    date: "June 2026",
    quote:
      "The Data Science trainers went well beyond the syllabus. The doubt sessions after class were the difference between understanding a model and just running it.",
    course: "Data Science",
    source: "google",
  },
  {
    name: "Aditya Verma",
    initials: "AV",
    rating: 5,
    date: "June 2026",
    quote:
      "My 45-day industrial training turned into a job offer. The placement cell fixed my resume and set up three interviews in the same month.",
    course: "Industrial Training",
    source: "google",
  },
  {
    name: "Neha Bansal",
    initials: "NB",
    rating: 5,
    date: "May 2026",
    quote:
      "As a working professional I needed evening batches. They let me switch between the campus class and the live online one whenever my shifts moved, without falling behind.",
    course: "Digital Marketing",
    source: "google",
  },
  {
    name: "Gurpreet Singh",
    initials: "GS",
    rating: 5,
    date: "May 2026",
    quote:
      "The ethical hacking lab is properly set up. Working on real machines instead of slides is what made the certification worth it for me.",
    course: "Ethical Hacking",
    source: "google",
  },
  {
    name: "Ravneet Dhillon",
    initials: "RD",
    rating: 4,
    date: "April 2026",
    quote:
      "Strong teaching and genuinely helpful trainers. The Python batch was slightly large for my liking, but the lab time and the doubt sessions made up for it.",
    course: "Python Programming",
    source: "google",
  },
  {
    name: "Mohit Arora",
    initials: "MA",
    rating: 5,
    date: "April 2026",
    quote:
      "I came in after 12th with no idea what to pick. The counselling was honest rather than a sales pitch, and the AI track turned out to be exactly right.",
    course: "Artificial Intelligence",
    source: "google",
  },
  {
    name: "Jaspreet Brar",
    initials: "JB",
    rating: 5,
    date: "March 2026",
    quote:
      "Six months of full stack and I finished with three deployed projects and a GitHub profile that actually looks like a developer's. Placed in Mohali within six weeks.",
    course: "Full Stack Development",
    source: "google",
  },
  {
    name: "Ankita Sharma",
    initials: "AS",
    rating: 5,
    date: "March 2026",
    quote:
      "The Power BI and Tableau modules were taught on real datasets, not toy examples. That is what my interviewers asked about.",
    course: "Data Analytics",
    source: "google",
  },
  {
    name: "Karanveer Sandhu",
    initials: "KS",
    rating: 4,
    date: "February 2026",
    quote:
      "Good cloud computing course and patient trainers. I would have liked more AWS practice time, but everything covered was explained thoroughly.",
    course: "Cloud Computing",
    source: "google",
  },
  {
    name: "Pooja Rani",
    initials: "PR",
    rating: 5,
    date: "February 2026",
    quote:
      "Did the 6-week summer training here on my college's requirement and ended up staying for the full course. The certificate was accepted without any trouble.",
    course: "6 Weeks Training",
    source: "google",
  },
  {
    name: "Rajiv Malhotra",
    initials: "RM",
    rating: 5,
    date: "January 2026",
    quote:
      "We hire from the Jalandhar centre every year. Their students arrive knowing Git, deployment and how to read someone else's code — that is rare at this level.",
    course: "Hiring partner",
    source: "google",
  },
]

/**
 * Headline numbers for the reviews page.
 *
 * TODO: these must match the live Google Business Profile once real reviews are
 * in — a rating shown here that disagrees with the one on Google is worse than
 * showing no number at all.
 */
export const REVIEW_META = {
  rating: "4.9",
  outOf: "5",
  count: "750+",
  placed: "10,000+",
}
