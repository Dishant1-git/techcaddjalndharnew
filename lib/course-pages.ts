import { generateContent } from "./course-content"
import {
  AFTER_12TH_GROUPS,
  AI_MENU,
  COURSE_GROUPS,
  TRAINING_GROUPS,
} from "./navigation"

/**
 * Course page content registry.
 *
 * One template renders every course, internship and after-12th page; the slug
 * in the URL selects the entry here. Sections are optional and render only
 * when authored, so pages can be filled in stage by stage without the layout
 * breaking.
 */

export type Segment = "courses" | "internship-training" | "after-12th-courses"

export type Fact = { label: string; value: string }
export type Faq = { q: string; a: string }
export type Review = {
  name: string
  role: string
  city: string
  initials: string
  quote: string
}
export type LearnModule = { title: string; points: string[] }

export type CoursePage = {
  slug: string
  segment: Segment
  /** Small label above the H1. */
  eyebrow: string
  h1: string
  /** <title> and meta description. */
  title: string
  description: string
  keywords: string[]
  /** Lead paragraph in the hero. */
  intro: string
  facts: Fact[]

  // --- Sections, authored in stages ---
  overview?: string[]
  whoCanDo?: { intro?: string; groups?: { title: string; body: string }[] }
  whyProgram?: string[]
  whyTechcadd?: { intro?: string; points?: { title: string; body: string }[] }
  learn?: { intro?: string; modules?: LearnModule[]; tools?: string[] }
  reviews?: Review[]
  faqs?: Faq[]

  /** Slugs of sibling pages shown at the foot of the page. */
  related?: string[]
}

/**
 * Keyword → destination for in-content internal linking.
 *
 * Ordered longest-first at match time so "digital marketing" wins over
 * "marketing". A page never links to itself — the template excludes its own
 * href before rendering.
 */
export const KEYWORD_LINKS: Record<string, string> = {
  "digital marketing": "/courses/digital-marketing",
  "social media marketing": "/courses/social-media-marketing",
  "google ads": "/courses/google-ads",
  "artificial intelligence": "/courses/artificial-intelligence",
  "machine learning": "/courses/machine-learning",
  "deep learning": "/courses/deep-learning",
  "data science": "/courses/data-science",
  "data analytics": "/courses/data-analytics",
  "power bi": "/courses/power-bi",
  tableau: "/courses/tableau",
  python: "/courses/python",
  java: "/courses/java",
  kotlin: "/courses/kotlin",
  "mern stack": "/courses/mern-stack",
  "mean stack": "/courses/mean-stack",
  "web development": "/courses/web-development",
  "web designing": "/courses/web-designing",
  wordpress: "/courses/wordpress",
  shopify: "/courses/shopify",
  seo: "/courses/seo",
  cybersecurity: "/courses/cybersecurity",
  "ethical hacking": "/courses/ethical-hacking",
  "cloud computing": "/courses/cloud-computing",
  linux: "/courses/linux",
  "industrial training": "/internship-training/industrial-training",
  "internship program": "/internship-training/internship-programme",
  "6 months training": "/internship-training/6-months",
  "45 days training": "/internship-training/45-days",
  "placement cell": "/placement-cell",
}

export const COURSE_PAGES: CoursePage[] = [
  {
    slug: "digital-marketing",
    segment: "courses",
    eyebrow: "Digital Marketing",
    h1: "Digital Marketing Course in Jalandhar",
    title:
      "Digital Marketing Course in Jalandhar — Live Projects & Placement | Techcadd",
    description:
      "Job-oriented digital marketing course in Jalandhar with SEO, Google Ads, Meta Ads, analytics and AI tools. Live client campaigns, internship letter and placement support at Techcadd.",
    keywords: [
      "digital marketing course jalandhar",
      "digital marketing course in jalandhar",
      "digital marketing institute in jalandhar",
      "best digital marketing training jalandhar",
      "digital marketing course fees in jalandhar",
      "digital marketing course with placement jalandhar",
      "seo course jalandhar",
      "digital marketing course after 12th jalandhar",
      "digital marketing classes in jalandhar punjab",
    ],
    intro:
      "Learn the skill Jalandhar businesses are actively hiring for — taught on live client accounts, not slide decks.",
    facts: [
      { label: "Duration", value: "3 – 6 Months" },
      { label: "Mode", value: "Classroom & Weekend" },
      { label: "Eligibility", value: "12th Pass Onward" },
      { label: "Includes", value: "Internship Letter" },
    ],

    // --- Stage 1 ---
    overview: [
      "Techcadd's digital marketing course in Jalandhar is built for students who want a skill they can earn from in months, not years. You start with how search engines and social platforms actually decide what to rank and show, then move quickly into running live campaigns on real client accounts with real budgets.",
      "The syllabus covers SEO, Google Ads, Meta Ads, content and email marketing, WordPress and Shopify storefronts, analytics, and AI-assisted marketing workflows — the same stack Jalandhar agencies and Punjab businesses are hiring for right now. Classes run in small batches at our Jalandhar centre with daily lab practice, taught by trainers who still manage client campaigns of their own.",
      "Whether you have just finished 12th, are completing a degree at a local college, or are switching from a non-technical job, the course begins at zero. Every module ends with something you can show an employer: a page that ranks, an ad account that runs, a store that sells. That portfolio, plus an internship letter and Techcadd's placement drives, is what turns a certificate into an offer letter.",
    ],

    // --- Stage 2A ---
    whoCanDo: {
      intro:
        "A digital marketing course suits more people than almost any other IT track, because it does not assume you can already code. What it does assume is that you are willing to write, test, read numbers and try again next week. If that sounds like you, your background matters far less than your consistency. Techcadd runs mixed batches on purpose — in one classroom you will find a B.Com final-year student from a Jalandhar college, a shopkeeper's son taking the family sports-goods business online, and a school teacher retraining after eight years out of work. They finish at different speeds, but they all finish, because every module is judged on something you built rather than something you memorised.",
      groups: [
        {
          title: "Students after 12th",
          body: "Join straight after your board exams, from any stream. Arts and commerce students often do better here than science students, because the work rewards writing, curiosity and patience with numbers rather than mathematics. Most start a weekday batch alongside a BA, BBA or B.Com at a local college.",
        },
        {
          title: "Graduates and final-year students",
          body: "Finishing a BA, BBA, B.Com, BCA or B.Tech? This is the shortest route from degree to salary. Run it alongside your final year and you enter placement season with live campaign results in your portfolio instead of a blank CV — which is what separates shortlisted candidates from ignored ones.",
        },
        {
          title: "Job seekers and career switchers",
          body: "Teachers, bank staff, hotel and retail employees switch into marketing every year. You are not starting from zero — you already understand customers, targets and pressure. The weekend batch exists for exactly this: you keep earning while you retrain, and most switchers are interview-ready in five to six months.",
        },
        {
          title: "Business owners and family firms",
          body: "Jalandhar runs on family businesses — sports goods, hand tools, leather, agri implements, immigration consultancies. Owners and their children take this course to stop paying an agency every month for work they cannot judge. You will leave able to brief, audit and if needed replace an agency on evidence.",
        },
        {
          title: "Freelancers and remote workers",
          body: "This is one of the few skills where a Jalandhar address costs you nothing. Freelancers here bill clients in Delhi, Dubai and Canada. The course covers client handling, proposals and reporting, so you learn to price and defend your work — not just do it.",
        },
        {
          title: "Anyone with no technical background",
          body: "There is no coding requirement at any stage. You need a laptop, basic English reading and about ten hours a week outside class. If you have ever run an Instagram page for a college fest or a family shop, you have already done a rough version of what this course makes rigorous.",
        },
      ],
    },

    // --- Stage 2B ---
    whyProgram: [
      "Jalandhar is not a metro, and that is exactly why this skill pays here. The city runs on export houses, sports goods manufacturers, hand tool units, leather workshops, agri-implement makers, immigration and study-visa consultancies, hospitals, schools and real estate. Almost all of them now sell through search, Instagram and WhatsApp rather than through a salesman on a scooter, and very few have anyone in-house who understands how that actually works. The result is a genuine shortage: businesses with budgets and nobody trustworthy to hand them to. Local firms routinely ask Techcadd for a trained marketer before they ask for a developer, because a marketer shows a return within ninety days.",
      "What separates this programme from a playlist of tutorials is that you spend money. Not your own — Techcadd allocates live ad budgets on real client accounts, and you make the targeting, bidding and creative decisions with a trainer beside you. You will watch a campaign lose money because of a bad audience choice, fix it, and watch the cost per lead fall the following week. That loop, repeated across search, social and ecommerce, is the entire skill. You cannot get it from a course that ends in a quiz, and no employer in Jalandhar or Chandigarh will take your word for it without the account screenshots to prove it.",
      "Be realistic about the money. A fresher who finishes with a working portfolio typically starts between ₹15,000 and ₹25,000 a month at a Jalandhar or Mohali agency, and reaches ₹35,000 to ₹50,000 within about two years if they keep learning. Freelancers handling three to five retainer clients often pass that sooner, because a Jalandhar address costs nothing on a call with a client in Delhi or Dubai. The ceiling is high, but it is earned — nobody pays a beginner well for a certificate alone.",
      "Students reach the Jalandhar centre from Model Town, Urban Estate, Adarsh Nagar, Basti Bawa Khel, Rama Mandi and Guru Nanak Pura, and travel in from Phagwara, Kapurthala, Nakodar, Hoshiarpur and Adampur for the weekend batch. Many are studying at DAV College, Lyallpur Khalsa, HMV, Apeejay or Lovely Professional University at the same time, which is why weekday, evening and weekend timings all exist rather than a single fixed slot.",
      "The alternative is what most people try first: free videos, a cheap online course, and six months of drifting. It fails for a predictable reason — nobody gives a beginner a real ad account, a real client, or an honest review of their work. You end up with knowledge you cannot demonstrate. A structured programme with live projects, a mentor who corrects you, an internship letter and a placement cell that actually calls employers is not a luxury in this city. It is the difference between knowing the subject and being hired to do it.",
    ],

    // --- Stage 3 ---
    whyTechcadd: {
      intro:
        "There are a dozen places to learn this subject in Jalandhar, and the brochure syllabus looks much the same at all of them. What differs is who teaches, whether you ever touch a real account, and whether anyone picks up the phone after you have paid. Techcadd has trained students across Punjab for close to two decades, and the model has not changed because it works: small batches, working practitioners as trainers, client projects as coursework, and a placement cell that treats your offer letter as its own deliverable.",
      points: [
        {
          title: "Trainers who still run campaigns",
          body: "Your trainer is not a full-time lecturer. They manage live client accounts for Techcadd's own services arm, so the examples in class are last month's data rather than a 2019 case study. When Google changes an ad format or Meta breaks attribution, you hear about it the week it happens.",
        },
        {
          title: "Live client accounts, real budgets",
          body: "From the second month you work on real businesses under supervision — a local exporter, a clinic, a school, a D2C store. Real budgets, real leads, real consequences. This is where a portfolio comes from, and it is the first thing interviewers in Jalandhar and Mohali ask to see.",
        },
        {
          title: "Small batches and daily lab time",
          body: "Batches stay small enough that a trainer can look at your screen every single day. Open lab hours run outside class time, and doubt sessions continue until the concept lands rather than until the clock says stop.",
        },
        {
          title: "Internship letter and portfolio",
          body: "Every student finishes with a documented internship on client work plus a portfolio of campaigns, audits and ranked pages. Certificates are easy to print; a portfolio is not, and employers know exactly what that difference means.",
        },
        {
          title: "A placement cell that actually calls",
          body: "Mock interviews, CV reviews and drives with a hiring partner network across Jalandhar, Mohali, Chandigarh and Ludhiana. Support does not end at your first rejection — students come back for the second and third round of drives until they are placed.",
        },
        {
          title: "Two decades, 25,000+ students",
          body: "Techcadd has trained students in Punjab since 2007 and works with hiring partners who have taken candidates from us for years. That history is why a call from our placement cell gets answered, and why local employers already know what our certificate stands for.",
        },
      ],
    },

    // --- Stage 4 ---
    learn: {
      intro:
        "The syllabus is arranged so that every module produces an asset. You do not learn SEO and then hope to apply it — you rank a page. You do not study Google Ads theory — you build, run and optimise a campaign on a live account. By the end you hold a folder of work: audits, ranked URLs, ad accounts, a storefront and a reporting dashboard that between them answer every question an interviewer will ask. Modules run in the order a real project runs. You start by understanding the customer and the funnel, build somewhere for traffic to land, learn to earn traffic for free through search, then learn to buy it through ads, then measure everything and report it in language a business owner accepts. AI tools are woven through the modules rather than bolted on at the end, because that is how the work is actually done now.",
      modules: [
        {
          title: "Digital Marketing Foundations",
          points: [
            "Funnels, buyer journeys and channel selection",
            "Positioning and offer design for local businesses",
            "Competitor research in the Jalandhar market",
            "Goals and KPIs a business owner will accept",
          ],
        },
        {
          title: "Websites & Landing Pages",
          points: [
            "WordPress setup, themes and page builders",
            "Landing page structure that converts",
            "Core Web Vitals, speed and mobile-first fixes",
            "Forms, WhatsApp integration and lead capture",
          ],
        },
        {
          title: "Search Engine Optimisation",
          points: [
            "Keyword research and search intent mapping",
            "On-page: titles, schema and internal linking",
            "Technical: crawling, indexing, sitemaps, robots",
            "Off-page: backlinks, digital PR and outreach",
          ],
        },
        {
          title: "Local SEO for Punjab Businesses",
          points: [
            "Google Business Profile optimisation and posts",
            "Citations, NAP consistency and directories",
            "Review generation and reputation management",
            "Ranking in the map pack for near-me searches",
          ],
        },
        {
          title: "Google Ads",
          points: [
            "Search campaigns, match types and negatives",
            "Display, YouTube and Performance Max",
            "Shopping campaigns for ecommerce sellers",
            "Bidding strategies, budgets and quality score",
          ],
        },
        {
          title: "Meta & Social Media Marketing",
          points: [
            "Instagram and Facebook content strategy",
            "Meta Ads Manager, audiences and retargeting",
            "Creative testing and ad copy that converts",
            "LinkedIn for B2B and export businesses",
          ],
        },
        {
          title: "Content, Email & WhatsApp",
          points: [
            "Blog and content calendars built to rank",
            "Email sequences and marketing automation",
            "WhatsApp Business API and broadcast campaigns",
            "Copywriting for Indian and NRI audiences",
          ],
        },
        {
          title: "Ecommerce & Shopify",
          points: [
            "Store setup, products and collections",
            "Product page SEO and conversion optimisation",
            "Payments, shipping and returns for Indian sellers",
            "Marketplace basics — Amazon and Flipkart listings",
          ],
        },
        {
          title: "Analytics & Reporting",
          points: [
            "GA4 events, conversions and audiences",
            "Google Tag Manager and tracking setup",
            "Search Console diagnostics and fixes",
            "Looker Studio dashboards for clients",
          ],
        },
        {
          title: "AI for Marketers & Career Prep",
          points: [
            "Prompting for research, briefs and ad copy",
            "AI tools for content, images and bulk keyword work",
            "Freelance pricing, proposals and client handling",
            "Portfolio build, CV review and mock interviews",
          ],
        },
      ],
      tools: [
        "Google Analytics 4",
        "Google Search Console",
        "Google Ads",
        "Google Tag Manager",
        "Google Business Profile",
        "Meta Ads Manager",
        "WordPress",
        "Elementor",
        "Shopify",
        "Semrush",
        "Ahrefs",
        "Screaming Frog",
        "Looker Studio",
        "Canva",
        "Mailchimp",
        "WhatsApp Business",
        "ChatGPT",
        "Claude",
      ],
    },

    // --- Stage 5 ---
    reviews: [
      {
        name: "Harpreet Kaur",
        role: "Digital Marketing Executive",
        city: "Jalandhar",
        initials: "HK",
        quote:
          "I did my BA from a college here and had no idea what came next. Six months later I had four live campaigns in my portfolio and an offer from an agency in Mohali before the course even ended.",
      },
      {
        name: "Rohit Sharma",
        role: "SEO Analyst",
        city: "Phagwara",
        initials: "RS",
        quote:
          "The SEO module is the real thing. We ranked an actual client site, not a demo. My interviewer asked for proof and I just opened Search Console on my phone.",
      },
      {
        name: "Simranjeet Singh",
        role: "Freelance Marketer",
        city: "Kapurthala",
        initials: "SS",
        quote:
          "I run ads for three sports goods exporters in Jalandhar now. Techcadd taught me the ads, but honestly the client handling and proposal sessions are what let me charge properly.",
      },
      {
        name: "Anjali Verma",
        role: "Marketing Executive",
        city: "Jalandhar Cantt",
        initials: "AV",
        quote:
          "I switched from a teaching job at 29 and worried I would be the oldest in the room. Half the weekend batch were career switchers. Nobody ever made me feel slow.",
      },
      {
        name: "Gurpreet Dhillon",
        role: "Business Owner",
        city: "Nakodar",
        initials: "GD",
        quote:
          "I joined to stop paying an agency for work I could not judge. I now run Google Ads for our hand tools business myself and the cost per enquiry has roughly halved.",
      },
      {
        name: "Manpreet Kaur",
        role: "Content & Social Media",
        city: "Hoshiarpur",
        initials: "MK",
        quote:
          "The content and Instagram modules were the most practical part. We planned a full month of posts for a real clinic and watched the numbers actually move.",
      },
      {
        name: "Vikas Chopra",
        role: "PPC Executive",
        city: "Ludhiana",
        initials: "VC",
        quote:
          "I travelled from Ludhiana for the weekend batch and it was worth every trip. Real ad spend, real mistakes, real corrections. YouTube does not give you that.",
      },
      {
        name: "Neha Bansal",
        role: "Digital Marketer",
        city: "Jalandhar",
        initials: "NB",
        quote:
          "The placement cell did not stop after my first rejection. They called me for three more drives and prepared me differently each time. That persistence got me placed.",
      },
      {
        name: "Arshdeep Singh",
        role: "Ecommerce Executive",
        city: "Adampur",
        initials: "AS",
        quote:
          "The Shopify and Shopping ads part got me the job. My company sells sports equipment online and I was the only candidate who had actually built and run a store.",
      },
      {
        name: "Pooja Rani",
        role: "SEO Executive",
        city: "Kartarpur",
        initials: "PR",
        quote:
          "I came in knowing nothing beyond Instagram. The open lab hours saved me — you can sit after class and the trainer will still explain until it clicks.",
      },
    ],

    // --- Stage 6 ---
    faqs: [
      {
        q: "What is the duration of the digital marketing course in Jalandhar at Techcadd?",
        a: "The course runs 3 to 6 months depending on the track. The 3-month track covers core SEO, Google Ads, social media and analytics. The 6-month track adds ecommerce, advanced analytics, AI tools and a longer internship on live client accounts. Weekend batches take longer in calendar time but cover the same syllabus.",
      },
      {
        q: "What is the fee for a digital marketing course in Jalandhar?",
        a: "In Jalandhar, basic 2–3 month courses typically cost ₹8,000 to ₹15,000, while comprehensive 4–6 month programmes that include live ad budgets, an internship and placement support run roughly ₹18,000 to ₹40,000. Techcadd counsellors share the current fee sheet and EMI options on request, and a demo class carries no registration charge.",
      },
      {
        q: "Can I do a digital marketing course after 12th?",
        a: "Yes. Students from any stream — arts, commerce or science — can join straight after 12th. There is no coding or mathematics requirement. Many students run the course alongside a BA, BBA or B.Com at a Jalandhar college using the weekend or evening batch.",
      },
      {
        q: "Is placement guaranteed after the course?",
        a: "No honest institute can guarantee a job, and you should be cautious of any in Jalandhar that does. Techcadd guarantees placement support: CV reviews, mock interviews, portfolio preparation and drives with hiring partners across Jalandhar, Mohali, Chandigarh and Ludhiana, repeated until you are placed.",
      },
      {
        q: "What salary can a fresher expect in Jalandhar after this course?",
        a: "A fresher with a working portfolio typically starts between ₹15,000 and ₹25,000 per month at a Jalandhar or Mohali agency, rising to ₹35,000–₹50,000 within about two years. Freelancers handling three to five retainer clients often earn more, since remote client work is not limited by location.",
      },
      {
        q: "Do I need a technical or coding background?",
        a: "No. This is one of the few high-demand skills with no coding prerequisite. You need a laptop, basic English reading and roughly ten hours a week outside class. Students from arts and commerce backgrounds frequently perform as well as engineering graduates.",
      },
      {
        q: "Will I work on real campaigns or only theory?",
        a: "You work on live client accounts with real ad budgets from the second month, supervised by a trainer. Every module ends with a deliverable — a ranked page, a running ad account, a live store, a client dashboard — and those become the portfolio you carry into interviews.",
      },
      {
        q: "Does Techcadd provide an internship and certificate?",
        a: "Yes. Every student receives an industry-recognised certificate on completion plus a documented internship letter based on live client work. Both are verifiable, and the internship satisfies the industrial training requirement at most Punjab universities.",
      },
      {
        q: "Which tools will I learn during the course?",
        a: "You will work with Google Analytics 4, Search Console, Google Ads, Tag Manager, Google Business Profile, Meta Ads Manager, WordPress, Shopify, Semrush, Screaming Frog, Looker Studio, Canva, Mailchimp and AI assistants such as ChatGPT and Claude for research, copy and bulk keyword work.",
      },
      {
        q: "Are weekend batches available for working professionals?",
        a: "Yes. Techcadd runs classroom batches in Jalandhar with weekday, evening and weekend options. The weekend batch exists specifically for working professionals and business owners who cannot attend on weekdays. Book a free demo class to see the lab and meet the trainer before enrolling.",
      },
    ],

    related: [
      "/courses/seo",
      "/courses/social-media-marketing",
      "/courses/google-ads",
      "/courses/wordpress",
      "/courses/shopify",
      "/internship-training/6-months",
    ],
  },
]

/**
 * Every course link that exists anywhere in the navigation.
 *
 * Built from the menus rather than hand-listed, so a link added to the nav can
 * never point at a page that does not exist. Slugs without an authored entry
 * above still render — with a hero, facts and siblings — instead of 404ing
 * while their copy is being written.
 */
type CatalogueEntry = {
  segment: Segment
  slug: string
  label: string
  group: string
}

function buildCatalogue(): CatalogueEntry[] {
  const out: CatalogueEntry[] = []

  const add = (href: string, label: string, group: string) => {
    const match = href.match(
      /^\/(courses|internship-training|after-12th-courses)\/([a-z0-9-]+)$/,
    )
    if (!match) return
    const segment = match[1] as Segment
    const slug = match[2]
    if (out.some((e) => e.segment === segment && e.slug === slug)) return
    out.push({ segment, slug, label, group })
  }

  for (const group of [
    ...COURSE_GROUPS,
    ...TRAINING_GROUPS,
    ...AFTER_12TH_GROUPS,
  ]) {
    for (const item of group.items) add(item.href, item.label, group.title)
  }
  for (const column of AI_MENU.columns) {
    for (const item of column.items) add(item.href, item.label, column.title)
  }

  return out
}

export const CATALOGUE = buildCatalogue()

const SEGMENT_COPY: Record<
  Segment,
  { heading: (label: string) => string; intro: string; facts: Fact[] }
> = {
  courses: {
    heading: (label) => `${label} Course in Jalandhar`,
    intro:
      "Job-oriented training at Techcadd Jalandhar — small batches, daily lab practice and live projects, taught by engineers who still ship client work.",
    facts: [
      { label: "Duration", value: "3 – 6 Months" },
      { label: "Mode", value: "Classroom & Weekend" },
      { label: "Eligibility", value: "12th Pass Onward" },
      { label: "Includes", value: "Internship Letter" },
    ],
  },
  "internship-training": {
    heading: (label) => `${label} in Jalandhar`,
    intro:
      "University-recognised industrial training at Techcadd Jalandhar, finishing with a live project, an internship letter and placement drives.",
    facts: [
      { label: "Mode", value: "Classroom" },
      { label: "Project", value: "Live Client Work" },
      { label: "Certificate", value: "Industry Recognised" },
      { label: "Includes", value: "Internship Letter" },
    ],
  },
  "after-12th-courses": {
    heading: (label) => `${label} Course After 12th in Jalandhar`,
    intro:
      "A career track you can start straight after school — from fundamentals to a portfolio employers in Punjab actually ask to see.",
    facts: [
      { label: "Duration", value: "6 Months – 1 Year" },
      { label: "Mode", value: "Classroom" },
      { label: "Eligibility", value: "12th Pass" },
      { label: "Includes", value: "Placement Support" },
    ],
  },
}

/** A page for a catalogued slug that has no authored content yet. */
function stubPage(entry: CatalogueEntry): CoursePage {
  const copy = SEGMENT_COPY[entry.segment]
  const h1 = copy.heading(entry.label)

  return {
    slug: entry.slug,
    segment: entry.segment,
    eyebrow: entry.label,
    h1,
    title: `${h1} | Techcadd`,
    description: `${h1} at Techcadd — live projects, industry trainers, internship letter and placement support. Enquire about batches, fees and duration.`,
    keywords: [
      `${entry.label.toLowerCase()} course jalandhar`,
      `${entry.label.toLowerCase()} training in jalandhar`,
      `${entry.label.toLowerCase()} institute jalandhar`,
    ],
    intro: copy.intro,
    facts: copy.facts,
    related: CATALOGUE.filter(
      (e) =>
        e.group === entry.group &&
        !(e.segment === entry.segment && e.slug === entry.slug),
    )
      .slice(0, 6)
      .map((e) => `/${e.segment}/${e.slug}`),
  }
}

export function getCoursePage(segment: Segment, slug: string) {
  // Hand-authored pages always win over generated content.
  const authored = COURSE_PAGES.find(
    (p) => p.segment === segment && p.slug === slug,
  )
  if (authored) return authored

  const entry = CATALOGUE.find((e) => e.segment === segment && e.slug === slug)
  if (!entry) return undefined

  return generateContent(stubPage(entry), `${segment}/${slug}`)
}

export function pagesInSegment(segment: Segment): CoursePage[] {
  return CATALOGUE.filter((e) => e.segment === segment).map(
    (e) => getCoursePage(e.segment, e.slug)!,
  )
}

/** Catalogue for a segment, grouped as the navigation groups it. */
export function groupedSegment(segment: Segment) {
  const groups = new Map<string, CatalogueEntry[]>()
  for (const entry of CATALOGUE) {
    if (entry.segment !== segment) continue
    groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry])
  }
  return [...groups.entries()]
}

export function hrefFor(page: CoursePage) {
  return `/${page.segment}/${page.slug}`
}
