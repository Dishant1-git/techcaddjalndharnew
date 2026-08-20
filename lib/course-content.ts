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
 * The brand sections (Why techcadd, the placement argument) are genuinely the
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
  (c: string) => `Joined the ${c} batch with almost no background and came out with a project I could actually show people. They check your work every day here, they don't just move on to the next slide.`,
  (c: string) => `The lab time is what made ${c} click for me. You can stay back after class and somebody will still sit and explain it until you get it.`,
  (c: string) => `${c} got me interview-ready quicker than I expected. My interviewer asked to see the project and honestly that was the entire conversation.`,
  (c: string) => `I came in from out of town every weekend for the ${c} batch and it was worth the travel. Small batch, real work, not much time wasted.`,
  (c: string) => `The placement cell kept calling me for drives until I got placed. For ${c}, that mattered to me more than the certificate did.`,
  (c: string) => `I was changing careers and worried I would be the slowest one there. Half the ${c} batch were doing exactly the same thing.`,
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
      body: `Your first working piece. Two blocks used together in one build rather than as separate exercises: ${t[0]}; ${t[1]}.`,
      tags: [spec.tools[0], spec.tools[1]].filter(Boolean),
    },
    {
      title: "Real-World Data Challenge",
      body: `Messy, real inputs. The work covers ${t[3]}, then ${t[4]}. A trainer will ask why you made the calls you did.`,
      tags: [spec.tools[2], spec.tools[3]].filter(Boolean),
    },
    {
      title: "Live Client Brief",
      body: `A genuine requirement out of techcadd's delivery pipeline: scoped, built and shipped under supervision. In interviews, this is the one they ask about.`,
      tags: ["Live work", "Supervised"],
    },
    {
      title: "Portfolio Capstone",
      body: `A ${name} project of your own choosing. You take it through ${t[6] ?? "the advanced topics"}, then deploy it, then present it as your final piece.`,
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
      a: `A fresher with a working portfolio starts around ${spec.salary} a month in the Jalandhar and Mohali market. Two years of delivery experience usually doubles that, and specialists who keep learning go well past it.`,
    },
    {
      q: "Can I freelance or work remotely with this skill?",
      a: `Yes. A Jalandhar address costs you nothing on a remote brief, and our students currently bill clients in Delhi, Dubai and Canada. Client handling, proposals and reporting are on the syllabus for that reason: you need to be able to price the work and defend it, not only do it.`,
    },
    {
      q: "Which industries hire for this in Punjab?",
      a: `IT companies are the obvious answer, but around Jalandhar the export houses, sports goods and hand tool manufacturers, immigration consultancies, hospitals, schools and property firms now hire for these skills directly.`,
    },
    {
      q: "Can I continue to higher studies or a specialisation later?",
      a: `The certificate and the portfolio hold up on their own, and they also stack. A lot of students come back for an adjacent techcadd track, and because the tools overlap the second course goes faster than the first.`,
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
      a: `techcadd runs ${name} over ${durationPhrase}. Weekday, evening and weekend batches all cover the same syllabus, and 1-on-1 training is there if you would rather set your own pace. Whichever format you pick, a class is 2 hours.`,
    },
    {
      q: `What is the fee for the ${name} course in Jalandhar?`,
      a: `Across Jalandhar, a shorter 2–3 month course usually falls between ₹8,000 and ₹15,000. A full 4–6 month programme with live projects, an internship and placement support is closer to ₹18,000–₹40,000. Ask a counsellor for the current fee sheet and the EMI options. The demo class costs nothing.`,
    },
    {
      q: after12
        ? `Can I join this course straight after 12th?`
        : `Who can join the ${name} course?`,
      a: after12
        ? `Yes. The programme is written for students coming straight out of 12th, from any stream. Nothing technical is assumed beforehand: you begin at fundamentals and work up to live project work.`
        : `The batch usually mixes school leavers, graduates and final-year students, working professionals changing tracks, and business owners. Everyone starts at fundamentals, so a technical background helps but is not needed.`,
    },
    {
      q: `What jobs can I get after the ${name} course?`,
      a: `Graduates typically move into roles such as ${spec.careers.slice(0, 3).join(", ")} or ${spec.careers[3] ?? "freelance work"}. ${spec.demand}`,
    },
    {
      q: `What salary can a fresher expect after this course in Jalandhar?`,
      a: `A fresher with a working portfolio usually starts around ${spec.salary} per month in the Jalandhar and Mohali market, and that rises sharply inside two years. Freelancers running several clients often do better, since remote work does not care where you live.`,
    },
    {
      q: `Is placement guaranteed after the ${name} course?`,
      a: `No institute can honestly guarantee a job, and any in Jalandhar that says otherwise is worth a second look. What techcadd does commit to is placement support: CV reviews, mock interviews, portfolio preparation and repeated drives with hiring partners across Jalandhar, Mohali, Chandigarh and Ludhiana.`,
    },
    {
      q: `Which tools and software will I learn?`,
      a: `You work hands-on with ${spec.tools.slice(0, 6).join(", ")} and the supporting toolchain that goes with live projects. All of it happens in the lab on licensed software, on your own machine, not through demo screenshots.`,
    },
    {
      q: `Will I get a certificate and internship letter?`,
      a: `Yes. Everyone finishes with an industry-recognised certificate and a documented internship letter based on live client work. Most Punjab universities accept that internship against their industrial training requirement.`,
    },
    {
      q: `Do you work on real projects or only theory?`,
      a: `Every module ends with something you have built. ${h1} closes on a live project pulled from techcadd's own client delivery work and supervised by a trainer, and that project is what you carry into interviews.`,
    },
    {
      q: `Are weekend and evening batches available?`,
      a: `Yes. techcadd Jalandhar runs weekday, evening and weekend batches side by side, so a working professional and a college student can both find a slot. 1-on-1 training covers anyone whose schedule fits neither. Every class runs 2 hours. Book a free demo first if you want to see the lab and meet the trainer before paying.`,
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
    description: `${page.h1} at techcadd — ${spec.tagline}. Live projects, industry trainers, internship letter and placement support. ${spec.careers.slice(0, 2).join(" and ")} roles start around ${spec.salary}.`,
    intro: `Learn ${spec.tagline}, taught on live client work at techcadd Jalandhar.`,

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
      `techcadd's ${page.h1} runs from ${spec.topics[0]} through to ${spec.topics[spec.topics.length - 1]}, on ${spec.tools.slice(0, 3).join(", ")}. The practice work comes from live client briefs, with a trainer checking it. ${OVERVIEW_CLOSE[page.segment]}`,
    ],

    whoCanDo: {
      intro: `The ${name} course takes people in from six different starting points, and we keep the batch mixed on purpose. Where you begin matters much less than whether you turn up regularly and finish what each module asks you to build.`,
      groups: [
        {
          title: "Students after 12th",
          body: `Any stream is fine. Nothing is assumed, so you begin at fundamentals. Most students here run the course alongside a degree at a Jalandhar college, on either the weekday or the weekend batch.`,
        },
        {
          title: "Graduates and final-year students",
          body: `Finishing a BA, BBA, B.Com, BCA or B.Tech, this is the shortest route from degree to salary. You reach placement season with project work in hand rather than a blank CV.`,
        },
        {
          title: "Working professionals",
          body: `The weekend batch is there for people already earning. Career switchers are usually interview-ready for ${spec.careers[0]} roles inside five to six months, without leaving the job they have.`,
        },
        {
          title: "Business owners and freelancers",
          body: `Owners join to stop outsourcing work they have no way of judging. Freelancers join to bill clients outside Punjab, since remote work in this field does not care where you sit.`,
        },
        ...COMMON_AUDIENCE,
      ],
    },

    /* Sits directly under "the case for it" below, so its two lines have to
       say something that paragraph hasn't already — the supervision claim and
       the salary figure both appear there too, just not in this phrasing. */
    casePitch: {
      headline: `Where ${name} Is Actually Being Hired For Right Now`,
      bullets: [
        "Live client work from week one, with a trainer looking over what you build.",
        `${spec.careers[0]} roles in Punjab start around ${spec.salary} a month for a fresher with a working portfolio.`,
      ],
    },

    whyProgram: [
      `${spec.demand} That is the argument for the course in one line: the demand is local, the budgets exist, and there are not enough trained people in Punjab to hand the work to.`,
      `Tutorials will teach you the syntax. What they cannot give you is somebody senior looking at your decisions. From the second half of the course you are on live client projects with a trainer beside you, so a bad call gets caught the same week you make it. That is the part employers in Jalandhar and Mohali are testing for, and they will want to open the work and see it for themselves.`,
      `On money, the honest figure: a fresher with a working portfolio starts around ${spec.salary} a month locally, and the number climbs quickly with delivery experience. Roles include ${spec.careers.join(", ")}. The ceiling is high. Nobody reaches it on a certificate alone.`,
      `Most people try the cheap route first. A few free videos, a discounted online course, six months of drifting, and nothing at the end they can actually show anyone. The reason a structured programme costs more is that it comes with live projects, someone correcting you, an internship letter and a placement cell that keeps ringing employers on your behalf.`,
      /* Moved down from the overview when that was cut to one paragraph — the
         local-area names are worth keeping on the page for search, just not in
         the first block a reader meets. */
      `Students reach the Jalandhar centre from ${LOCAL_AREAS}. School leavers, college students and people moving across from non-technical jobs all start at the same place, from zero. That is also why the timings are split into weekday, evening, weekend and 1-on-1 slots instead of one fixed batch. Every class runs two hours.`,
    ],

    whyTechcadd: {
      intro: `Plenty of institutes in Jalandhar teach this, and on paper the syllabus looks much the same everywhere. The differences show up elsewhere: who is standing at the front, whether you ever touch a real requirement, and whether anybody answers your call once the fee is paid. techcadd has run on the same model across Punjab since 2007 — small batches, practitioners teaching, client work as coursework.`,
      points: [
        {
          title: "Trainers who still do the work",
          body: "Your trainer is not a full-time lecturer. They deliver client projects for techcadd's services arm, so the examples in class come from this quarter and not from a case study written five years ago.",
        },
        {
          title: "Live projects, real consequences",
          body: "You build against genuine client requirements under supervision. That is where a portfolio comes from, and it is the first thing any interviewer asks to see.",
        },
        {
          title: "Small batches and open lab hours",
          body: "Batches stay small enough for a trainer to look at every screen each day. Lab time carries on outside class hours, and doubt sessions run until the concept lands.",
        },
        {
          title: "Internship letter and certificate",
          body: "Every student finishes with an industry-recognised certificate and a documented internship on real work, accepted for university industrial training requirements.",
        },
        {
          title: "A placement cell that persists",
          body: "Mock interviews, CV reviews and drives with hiring partners across Jalandhar, Mohali, Chandigarh and Ludhiana. A rejection puts you in the next drive rather than off the list.",
        },
        {
          title: "Since 2007, 25,000+ students",
          body: "Nearly two decades of hiring relationships in Punjab is why a call from our placement cell gets answered, and why local employers already know what our certificate means.",
        },
      ],
    },

    learn: {
      intro: timeline
        ? `The programme is laid out against the ${page.segment === "internship-training" ? "weeks and months" : "months"} you will actually be here, not as a generic module list. The early time goes on ${spec.topics.slice(0, 3).join(", ").toLowerCase()}. The middle stretch moves into ${spec.topics.slice(3, 6).join(", ").toLowerCase()}. The last stretch is live client work, a documented internship letter and placement preparation.`
        : `Every module is meant to leave you with something built, not a set of notes. You cover ${spec.topics.slice(0, 5).join(", ").toLowerCase()}, and finish on a live project using ${spec.tools.slice(0, 3).join(", ")}. The order follows the way a real project runs: foundations, then core skills, then supervised applied work, then the portfolio and interview preparation that turn all of it into an offer.`,
      modules: timeline ? buildTimelineModules(spec, timeline) : buildModules(spec),
      tools: spec.tools,
    },

    video: {
      url: SITE.promoVideo,
      title: `Inside the ${name} course at techcadd Jalandhar`,
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
