import { COURSE_SPECS, GENERIC_SPEC, type CourseSpec } from "./course-specs"
import { SITE } from "./site"
import { COMMON_AUDIENCE } from "./course-pages"
import type {
  CoursePage,
  Faq,
  LearnModule,
  Outcome,
  Project,
  Review,
  Segment,
} from "./course-pages"

/**
 * Builds full page content from a course spec.
 *
 * The brand sections (Why Techcadd, the placement argument) are genuinely the
 * same on every page because they describe the institute, not the course —
 * writing fifty variations of one truth would be worse, not better. Everything
 * that *is* course-specific — syllabus, tools, careers, salary, FAQs, reviews —
 * comes from the spec, so no two pages read as copies.
 */

const LOCAL_AREAS =
  "Model Town, Urban Estate, Adarsh Nagar, Basti Bawa Khel and Rama Mandi, with weekend students travelling in from Phagwara, Kapurthala, Nakodar, Hoshiarpur and Adampur"

/**
 * How the overview's last sentence names the length of the programme.
 *
 * Segment-specific because the durations genuinely differ: a blanket "choose
 * 3, 6 or 9 months" contradicted the hero on /internship-training/6-months and
 * on the after-12th pages, whose facts row says 6 months to a year.
 */
const OVERVIEW_CLOSE: Record<Segment, string> = {
  courses:
    "Every module ends in a portfolio deliverable you can show in an interview.",
  "internship-training":
    "Every stage ends in a portfolio deliverable, and you finish with a documented internship letter.",
  "after-12th-courses":
    "You start from zero with no prior background, and every stage ends in a portfolio deliverable.",
}

/** Deterministic pick so a page renders identically on server and client. */
function hash(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h)
}

function rotate<T>(pool: T[], seed: string, count: number): T[] {
  const start = hash(seed) % pool.length
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => pool[(start + i) % pool.length])
}

const REVIEW_POOL: Omit<Review, "quote">[] = [
  { name: "Harpreet Kaur", role: "Software Trainee", city: "Jalandhar", initials: "HK" },
  { name: "Rohit Sharma", role: "Junior Analyst", city: "Phagwara", initials: "RS" },
  { name: "Simranjeet Singh", role: "Freelancer", city: "Kapurthala", initials: "SS" },
  { name: "Anjali Verma", role: "Career Switcher", city: "Jalandhar Cantt", initials: "AV" },
  { name: "Gurpreet Dhillon", role: "Working Professional", city: "Nakodar", initials: "GD" },
  { name: "Manpreet Kaur", role: "Final-Year Student", city: "Hoshiarpur", initials: "MK" },
  { name: "Vikas Chopra", role: "Weekend Batch", city: "Ludhiana", initials: "VC" },
  { name: "Neha Bansal", role: "Placed Fresher", city: "Jalandhar", initials: "NB" },
  { name: "Arshdeep Singh", role: "Trainee Engineer", city: "Adampur", initials: "AS" },
  { name: "Pooja Rani", role: "Graduate", city: "Kartarpur", initials: "PR" },
  { name: "Karan Mehta", role: "B.Tech Student", city: "Jalandhar", initials: "KM" },
  { name: "Sandeep Kaur", role: "Placed Fresher", city: "Phillaur", initials: "SK" },
]

const QUOTE_TEMPLATES = [
  (c: string) => `I joined the ${c} batch with almost no background and finished with a project I could actually show. The trainers correct your work daily rather than just moving to the next slide.`,
  (c: string) => `What made ${c} click for me was the lab time. You can sit after class and someone will still explain it until you get it.`,
  (c: string) => `The ${c} course got me interview-ready faster than I expected. My interviewer asked to see my project and that was the whole conversation.`,
  (c: string) => `I travelled in for the weekend ${c} batch and it was worth every trip. Small batch, real work, no time wasted on theory nobody uses.`,
  (c: string) => `Techcadd's placement cell kept calling me for drives until I was placed. That persistence mattered more than the certificate for ${c}.`,
  (c: string) => `I was switching careers and worried I would be behind. Half the ${c} batch were doing the same thing, and nobody made me feel slow.`,
]

function buildReviews(courseName: string, seed: string): Review[] {
  const people = rotate(REVIEW_POOL, seed, 6)
  const quotes = rotate(QUOTE_TEMPLATES, seed + "q", 6)
  return people.map((person, i) => ({ ...person, quote: quotes[i](courseName) }))
}

/**
 * Internship & Training runs one fixed duration per page — 45-days and
 * 6-months are different pages, not a choice on the same one — so there is
 * nothing to compare against. What each page needs instead is its own
 * modules laid out along the calendar it actually promises: weeks for a
 * short course, months for a long one.
 */
const TRAINING_TIMELINES: Record<string, string[]> = {
  "45-days": ["Weeks 1 – 2", "Weeks 3 – 4", "Weeks 5 – 6"],
  "6-weeks": ["Weeks 1 – 2", "Weeks 3 – 4", "Weeks 5 – 6"],
  "industrial-training": ["Weeks 1 – 2", "Weeks 3 – 4", "Weeks 5 – 6"],
  "4-months": ["Month 1", "Month 2", "Month 3", "Month 4"],
  "6-months": ["Months 1 – 2", "Months 3 – 4", "Months 5 – 6"],
  "internship-programme": [
    "Phase 1 — Foundations",
    "Phase 2 — Live Client Work",
    "Phase 3 — Evaluation & Handover",
  ],
}

/** After 12th: the five "1 Year Certificate" slugs get a longer timeline than the "6 Month Certificate" ones. */
const AFTER_12TH_ONE_YEAR = new Set([
  "generative-ai",
  "cloud-computing-devops",
  "ai-data-science",
  "machine-learning-deep-learning",
  "cybersecurity-ethical-hacking",
])

/** The duration named in the first FAQ, kept in step with the timeline above it. */
const DURATION_LABEL: Record<string, string> = {
  "internship-training/45-days": "45 days",
  "internship-training/6-weeks": "6 weeks",
  "internship-training/industrial-training": "6 weeks",
  "internship-training/4-months": "4 months",
  "internship-training/6-months": "6 months",
  "internship-training/internship-programme":
    "a flexible internship period agreed with the team you join",
}

/** The week/month/phase timeline a page's modules should follow, or null for the plain "courses" structure. */
function timelineFor(page: CoursePage): string[] | null {
  if (page.segment === "internship-training") {
    return TRAINING_TIMELINES[page.slug] ?? ["Weeks 1 – 2", "Weeks 3 – 4", "Final Weeks"]
  }
  if (page.segment === "after-12th-courses") {
    return AFTER_12TH_ONE_YEAR.has(page.slug)
      ? ["Months 1 – 3", "Months 4 – 6", "Months 7 – 9", "Months 10 – 12"]
      : ["Months 1 – 2", "Months 3 – 4", "Months 5 – 6"]
  }
  return null
}

/** One line naming the duration, for the first FAQ. */
function durationPhraseFor(page: CoursePage, path: string): string {
  if (page.segment === "courses") return "3 to 6 months depending on the track you choose"
  return (
    DURATION_LABEL[path] ?? (page.segment === "after-12th-courses" ? "6 months" : "one fixed duration")
  )
}

/**
 * Spreads the spec's topics across a real timeline instead of the generic
 * Foundations / Core Skills / Applied Work split — a 4-month internship page
 * and a 45-day one should not read as the same four modules with the dates
 * changed underneath them.
 */
function buildTimelineModules(spec: CourseSpec, periods: string[]): LearnModule[] {
  const topics = spec.topics.filter(Boolean)
  const size = Math.max(1, Math.ceil(topics.length / periods.length))

  return periods.map((label, i) => {
    const isLast = i === periods.length - 1
    const slice = topics.slice(i * size, i * size + size)
    const base = slice.length ? slice : ["Guided practice, review and doubt-clearing sessions"]
    return {
      title: label,
      points: isLast ? [...base, "Live project work and placement preparation"] : base,
    }
  })
}

/** Four deliverables, phrased from the course's own topics. */
function buildProjects(spec: CourseSpec, name: string): Project[] {
  const t = spec.topics

  return [
    {
      title: `${name} Fundamentals Build`,
      body: `Your first working piece, applying ${t[0]?.toLowerCase()} and ${t[1]?.toLowerCase()} end to end rather than as isolated exercises.`,
      tags: [spec.tools[0], spec.tools[1]].filter(Boolean),
    },
    {
      title: "Real-World Data Challenge",
      body: `Work with messy, real inputs — ${t[3]?.toLowerCase()} and ${t[4]?.toLowerCase()} — and defend the choices you made to a trainer.`,
      tags: [spec.tools[2], spec.tools[3]].filter(Boolean),
    },
    {
      title: "Live Client Brief",
      body: `A genuine requirement from Techcadd's delivery pipeline, scoped, built and shipped under supervision. This is the one interviewers ask about.`,
      tags: ["Live work", "Supervised"],
    },
    {
      title: "Portfolio Capstone",
      body: `A ${name.toLowerCase()} project you specify yourself, covering ${t[6]?.toLowerCase() ?? "advanced topics"} and deployment, and present as your final piece.`,
      tags: [spec.tools[4] ?? "Deployment", "Presentation"].filter(Boolean),
    },
  ]
}

/** Career questions, answered in the same accordion the FAQs use. */
function buildOutcomes(spec: CourseSpec, name: string): Outcome[] {
  return [
    {
      q: `What job roles open up after ${name}?`,
      a: `Graduates move into ${spec.careers.join(", ")} and similar roles. ${spec.demand}`,
    },
    {
      q: "What can I earn, and how fast does it grow?",
      a: `A fresher with a working portfolio starts around ${spec.salary} a month in the Jalandhar and Mohali market. With two years of delivery experience that typically doubles, and specialists who keep learning move well beyond it.`,
    },
    {
      q: "Can I freelance or work remotely with this skill?",
      a: `Yes. A Jalandhar address costs you nothing on a remote brief — students bill clients in Delhi, Dubai and Canada. The course covers client handling, proposals and reporting so you can price and defend your work, not just do it.`,
    },
    {
      q: "Which industries hire for this in Punjab?",
      a: `Beyond IT companies, the export houses, sports goods and hand tool manufacturers, immigration consultancies, hospitals, schools and real estate firms across Jalandhar all now hire for these skills directly.`,
    },
    {
      q: "Can I continue to higher studies or a specialisation later?",
      a: `The certificate and portfolio stand on their own, and they stack. Most students move on to an adjacent Techcadd track — the tools overlap, so the second course is faster than the first.`,
    },
  ]
}

function buildModules(spec: CourseSpec): LearnModule[] {
  const groups = ["Foundations", "Core Skills", "Applied Work"]
  const modules: LearnModule[] = []

  // Eight topics split into groups of three, then a shared closing module.
  for (let i = 0; i < 3; i++) {
    const points = spec.topics.slice(i * 3, i * 3 + 3).filter(Boolean)
    if (points.length) modules.push({ title: groups[i], points })
  }

  modules.push({
    title: "Live Project & Placement Prep",
    points: [
      "A live client project you keep in your portfolio",
      "Documented internship on real work",
      "CV review, mock interviews and aptitude drills",
      "Placement drives with our hiring partner network",
    ],
  })

  return modules
}

function buildFaqs(
  name: string,
  h1: string,
  spec: CourseSpec,
  segment: Segment,
  durationPhrase: string,
): Faq[] {
  const after12 = segment === "after-12th-courses"

  return [
    {
      q: `What is the duration of the ${name} course in Jalandhar?`,
      a: `Techcadd runs ${name} over ${durationPhrase}. Weekday, evening and weekend batches cover the same syllabus, and 1-on-1 training is available if you would rather set your own pace — every class runs for 2 hours, whichever format you choose.`,
    },
    {
      q: `What is the fee for the ${name} course in Jalandhar?`,
      a: `In Jalandhar, shorter 2–3 month courses typically cost ₹8,000 to ₹15,000, while comprehensive 4–6 month programmes with live projects, an internship and placement support run roughly ₹18,000 to ₹40,000. Techcadd counsellors share the current fee sheet and EMI options on request, and a demo class is free.`,
    },
    {
      q: after12
        ? `Can I join this course straight after 12th?`
        : `Who can join the ${name} course?`,
      a: after12
        ? `Yes. This programme is designed for students joining directly after 12th, from any stream. There is no prior technical requirement — you start from fundamentals and build up to live project work.`
        : `Students after 12th, graduates and final-year students, working professionals switching careers, and business owners all join this course. You start from fundamentals, so a technical background helps but is not required.`,
    },
    {
      q: `What jobs can I get after the ${name} course?`,
      a: `Graduates typically move into roles such as ${spec.careers.slice(0, 3).join(", ")} or ${spec.careers[3] ?? "freelance work"}. ${spec.demand}`,
    },
    {
      q: `What salary can a fresher expect after this course in Jalandhar?`,
      a: `A fresher with a working portfolio typically starts around ${spec.salary} per month in the Jalandhar and Mohali market, rising substantially within two years of experience. Freelancers handling multiple clients often earn more, since remote work is not limited by location.`,
    },
    {
      q: `Is placement guaranteed after the ${name} course?`,
      a: `No institute can honestly guarantee a job, and you should be cautious of any in Jalandhar that does. Techcadd guarantees placement support — CV reviews, mock interviews, portfolio preparation and repeated drives with hiring partners across Jalandhar, Mohali, Chandigarh and Ludhiana.`,
    },
    {
      q: `Which tools and software will I learn?`,
      a: `You will work hands-on with ${spec.tools.slice(0, 6).join(", ")} and the supporting toolchain used on live projects. All practice happens in the lab on licensed software, not on demo screenshots.`,
    },
    {
      q: `Will I get a certificate and internship letter?`,
      a: `Yes. Every student receives an industry-recognised certificate on completion plus a documented internship letter based on live client work. The internship satisfies the industrial training requirement at most Punjab universities.`,
    },
    {
      q: `Do you work on real projects or only theory?`,
      a: `Every module ends with something you built. ${h1} finishes with a live project drawn from Techcadd's own client delivery work, supervised by a trainer, which becomes the portfolio you take to interviews.`,
    },
    {
      q: `Are weekend and evening batches available?`,
      a: `Yes. Techcadd Jalandhar runs weekday, evening and weekend batches in parallel so working professionals and college students can both attend, and 1-on-1 training is available for a fully personal schedule. Every class — batch or 1-on-1 — runs for 2 hours; book a free demo class to see the lab and meet the trainer before enrolling.`,
    },
  ]
}

/** Fills every optional section of a page from its spec. */
export function generateContent(
  page: CoursePage,
  path: string,
  /**
   * Defaults to the checked-in specs, so every existing caller is unchanged.
   * The website passes the CMS's merged set instead, which is what lets a
   * course's copy be edited without a deploy.
   */
  specs: Record<string, CourseSpec> = COURSE_SPECS,
): CoursePage {
  const spec = specs[path] ?? GENERIC_SPEC
  const name = page.eyebrow
  const seed = path
  const timeline = timelineFor(page)
  const durationPhrase = durationPhraseFor(page, path)

  return {
    ...page,
    keywords: [
      `${name.toLowerCase()} course jalandhar`,
      `${name.toLowerCase()} course in jalandhar`,
      `${name.toLowerCase()} training institute jalandhar`,
      `best ${name.toLowerCase()} course in jalandhar`,
      `${name.toLowerCase()} course with placement jalandhar`,
      `${name.toLowerCase()} classes in jalandhar punjab`,
    ],
    description: `${page.h1} at Techcadd — ${spec.tagline}. Live projects, industry trainers, internship letter and placement support. ${spec.careers.slice(0, 2).join(" and ")} roles start around ${spec.salary}.`,
    intro: `Learn ${spec.tagline} — taught on live client work at Techcadd Jalandhar, not from slides.`,

    /**
     * Deliberately one short paragraph.
     *
     * The overview is the first thing under the hero and its whole job is to
     * answer "what is this and how long does it take" before the reader has to
     * decide whether to keep scrolling. Everything that used to live here —
     * demand, the toolchain, who joins from where — is still on the page, in
     * the sections built for it.
     */
    /* Topics keep their own capitalisation. Lowercasing the first letter to
       fit them mid-sentence turned "Search Console and rank tracking" into
       "search Console" and "APIs with Flask" into "aPIs" — the strings are
       product names as often as they are prose. */
    overview: [
      `Techcadd's ${page.h1} takes you from ${spec.topics[0]} to ${spec.topics[spec.topics.length - 1]}, taught on ${spec.tools.slice(0, 3).join(", ")}. You work on live client briefs under trainer supervision, not slideware. ${OVERVIEW_CLOSE[page.segment]}`,
    ],

    whoCanDo: {
      intro: `The ${name} course is built for people at six different starting points, and the batch is deliberately mixed. What matters far more than your background is turning up consistently and finishing what each module asks you to build.`,
      groups: [
        {
          title: "Students after 12th",
          body: `Join from any stream. You start from fundamentals with no assumed knowledge, and most students run the course alongside a degree at a Jalandhar college using the weekday or weekend batch.`,
        },
        {
          title: "Graduates and final-year students",
          body: `If you are finishing a BA, BBA, B.Com, BCA or B.Tech, this is the shortest route from degree to salary. Enter placement season with project work in hand instead of a blank CV.`,
        },
        {
          title: "Working professionals",
          body: `The weekend batch exists for people already earning. Career switchers typically become interview-ready for ${spec.careers[0]} roles within five to six months without leaving their current job.`,
        },
        {
          title: "Business owners and freelancers",
          body: `Owners take this course to stop outsourcing work they cannot judge. Freelancers take it to bill clients beyond Punjab — location does not limit remote work in this field.`,
        },
        ...COMMON_AUDIENCE,
      ],
    },

    whyProgram: [
      `${spec.demand} That gap is the whole argument for this course: there is local demand, there are budgets, and there are very few trained people to hand the work to.`,
      `What separates this from a playlist of tutorials is supervision on real work. From the second half of the course you build on live client projects with a trainer beside you, make decisions that have consequences, and correct them the following week. That loop is the skill. No employer in Jalandhar or Mohali will take your word for it without work they can inspect.`,
      `Be realistic about the money. A fresher who finishes with a working portfolio typically starts around ${spec.salary} a month locally, and moves up quickly with experience. Roles include ${spec.careers.join(", ")}. The ceiling is high, but it is earned — nobody pays a beginner well for a certificate alone.`,
      `The alternative is what most people try first: free videos, a cheap online course, six months of drifting, and knowledge you cannot demonstrate. A structured programme with live projects, a mentor who corrects you, an internship letter and a placement cell that actually calls employers is the difference between knowing the subject and being hired to do it.`,
      /* Moved down from the overview when that was cut to one paragraph — the
         local-area names are worth keeping on the page for search, just not in
         the first block a reader meets. */
      `Students reach the Jalandhar centre from ${LOCAL_AREAS}. Whether you have just finished 12th, are completing a degree at a local college, or are switching from a non-technical job, the course starts at zero — which is why weekday, evening, weekend and 1-on-1 timings all exist rather than a single fixed slot, with every class running two hours.`,
    ],

    whyTechcadd: {
      intro: `There are many places to learn this in Jalandhar and the brochure syllabus looks similar at all of them. What differs is who teaches, whether you ever touch real work, and whether anyone picks up the phone after you have paid. Techcadd has trained students across Punjab since 2007 on the same model: small batches, working practitioners as trainers, client projects as coursework.`,
      points: [
        {
          title: "Trainers who still do the work",
          body: "Your trainer is not a full-time lecturer. They deliver client projects for Techcadd's services arm, so examples in class are current rather than a case study from five years ago.",
        },
        {
          title: "Live projects, real consequences",
          body: "You work on genuine client requirements under supervision. This is where a portfolio comes from, and it is the first thing an interviewer asks to see.",
        },
        {
          title: "Small batches and open lab hours",
          body: "Batches stay small enough that a trainer sees your screen daily. Lab time runs outside class hours and doubt sessions continue until the concept lands.",
        },
        {
          title: "Internship letter and certificate",
          body: "Every student finishes with an industry-recognised certificate and a documented internship on real work, accepted for university industrial training requirements.",
        },
        {
          title: "A placement cell that persists",
          body: "Mock interviews, CV reviews and drives with hiring partners across Jalandhar, Mohali, Chandigarh and Ludhiana — repeated after a rejection, not abandoned.",
        },
        {
          title: "Since 2007, 25,000+ students",
          body: "Nearly two decades of hiring relationships in Punjab is why a call from our placement cell gets answered and why local employers know what our certificate means.",
        },
      ],
    },

    learn: {
      intro: timeline
        ? `The programme is broken down by the ${page.segment === "internship-training" ? "weeks and months" : "months"} you actually spend on it rather than a generic module list. Early time goes on ${spec.topics.slice(0, 3).join(", ").toLowerCase()}, the middle stretch moves into ${spec.topics.slice(3, 6).join(", ").toLowerCase()}, and the final stretch is live client work, a documented internship letter and placement preparation.`
        : `The syllabus is arranged so every module produces an asset rather than a set of notes. You will cover ${spec.topics.slice(0, 5).join(", ").toLowerCase()}, and finish with a live project built on ${spec.tools.slice(0, 3).join(", ")}. Modules run in the order a real project runs — foundations first, then the core skills, then applied work under supervision, then the portfolio and interview preparation that turn all of it into an offer letter.`,
      modules: timeline ? buildTimelineModules(spec, timeline) : buildModules(spec),
      tools: spec.tools,
    },

    video: {
      url: SITE.promoVideo,
      title: `Inside the ${name} course at Techcadd Jalandhar`,
    },
    /* No generated `tracks` — a duration-comparison stack only makes sense
       where a student is genuinely choosing between enrolment lengths on the
       same page (Digital Marketing, Shopify), and those are hand-authored
       with a real `syllabus`. Every other page now shows one clean modules
       list, matching /courses/social-media-marketing. */
    projects: buildProjects(spec, name),
    outcomes: buildOutcomes(spec, name),
    reviews: buildReviews(name, seed),
    faqs: buildFaqs(name, page.h1, spec, page.segment, durationPhrase),
  }
}
