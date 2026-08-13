import { generateContent } from "./course-content"
import { COURSE_SPECS } from "./course-specs"
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

/** A duration a student can enrol for; the syllabus changes with it. */
export type ModuleTrack = {
  months: 3 | 6 | 9
  label: string
  summary: string
  modules: LearnModule[]
}

/**
 * One module in a single numbered ladder.
 *
 * `from` is the shortest track that reaches it. The tracks are nested — the
 * 6-month programme continues where the 3-month one ended, the 9-month where
 * the 6-month ended — so this one number decides the tick in all three
 * columns: a module is included in every duration at or above `from`. Storing
 * a range per module instead would let the three columns contradict each
 * other, which is precisely what a comparison table must never do.
 */
export type SyllabusModule = {
  /** Position in the ladder, 1-based; rendered as 01, 02, … */
  n: number
  title: string
  body: string
  from: 3 | 6 | 9
}

export type SyllabusStage = {
  months: 3 | 6 | 9
  /** The level this stage certifies, e.g. "Practitioner". */
  label: string
  /** Which modules it spans, e.g. "Modules 1 – 10". */
  range: string
  summary: string
}

/** A duration comparison: the same ladder read across three enrolment lengths. */
export type Syllabus = {
  intro?: string
  stages: SyllabusStage[]
  modules: SyllabusModule[]
  /** Closing note under the table. */
  note?: string
}

export type Project = { title: string; body: string; tags: string[] }

/** Career-outcome questions, rendered in the same accordion as the FAQs. */
export type Outcome = { q: string; a: string }

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
  /** YouTube URL for the walkthrough popup. */
  video?: { url: string; title: string }
  /** 3 / 6 / 9-month syllabus variants, shown as a sticky stack. */
  tracks?: ModuleTrack[]
  /**
   * A numbered ladder shown as a duration comparison table. Takes precedence
   * over `tracks` where both exist — a course whose stages genuinely nest is
   * clearer as one table than as three separate stacks.
   */
  syllabus?: Syllabus
  projects?: Project[]
  outcomes?: Outcome[]
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
  /* No "placement cell" entry: /placement-cell does not exist, and this map is
     applied to body copy across every page, so one dead target here became a
     404 on all of them. Re-add it with the page. */
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
      { label: "Duration", value: "3 / 6 / 9 Months" },
      { label: "Mode", value: "Classroom & Weekend" },
      { label: "Eligibility", value: "12th Pass Onward" },
      { label: "Includes", value: "Internship Letter" },
    ],

    // --- Stage 1 ---
    overview: [
      "Techcadd's Digital Marketing Course in Jalandhar takes you from buyer psychology to AI-powered campaigns across SEO, Meta Ads and Google Ads. You build a real website, rank real keywords and run client budgets under trainer supervision. Choose 3, 6 or 9 months — every stage ends in a portfolio deliverable.",
    ],

    // --- Stage 2A ---
    whoCanDo: {
      intro:
        "The Digital Marketing course is open at Module 01 to people with zero marketing background — funnel maths, buyer psychology and design fundamentals are taught from the ground up before any live account work begins. The batch at Techcadd Jalandhar is deliberately mixed, and what decides your outcome is consistency through the modules, not your starting point.",
      groups: [
        {
          title: "Students after 12th",
          body: "Join from Commerce, Arts or Science with no assumed knowledge. Most run the 3-month Practitioner track alongside a first year of college, using the weekday or weekend batch.",
        },
        {
          title: "Graduates and final-year students",
          body: "If you're finishing a BA, BBA, B.Com, BCA or MBA, this is the shortest route from degree to a Digital Marketing Executive offer. Enter placement season with a live website, a ranked listing and a real Meta campaign in hand instead of a blank CV.",
        },
        {
          title: "Working professionals and career switchers",
          body: "The weekend and evening batches exist for people already earning. Career switchers typically become interview-ready for Digital Marketing Executive or SEO Executive roles within three to six months, without leaving their current job.",
        },
        {
          title: "Business owners and freelancers",
          body: "Owners take this course to stop outsourcing spend they cannot judge and start running their own Meta and Google accounts. Freelancers and agency founders take the 9-month Expert track specifically for the client-commercial skills — audits, proposals, quotations and GST invoicing — that let them bill clients beyond Punjab.",
        },
      ],
    },

    // --- Stage 2B ---
    whyProgram: [
      "Digital marketing sits under nearly every business's growth line today, and Jalandhar's export houses, hospitals, real estate firms, immigration consultancies, schools and D2C brands are hiring for it directly rather than routing everything through a Chandigarh or Delhi agency. That gap between local demand and locally trained talent is the argument for this course.",
      "What separates it from a stack of YouTube tutorials is supervised work on live accounts. From Module 02 onward at Techcadd, every session is production work — a real website goes live, a real Meta Pixel fires, a real ranking is tracked with dates. That loop of building, being corrected and shipping again is the actual skill an interviewer is testing for, and no employer in Jalandhar or Mohali will take your word for it without work they can open and inspect.",
      "Be realistic about the numbers too. A fresher who finishes the Practitioner stage with a working portfolio typically starts as a Digital Marketing Executive or SEO Executive locally, moving into Performance Marketing Executive or SEO Specialist roles after the Professional stage, and Growth Manager, Digital Growth Architect or Agency Founder territory after the full Expert track. The ceiling in this field is high specifically because so few people can back a claim with a tracked conversion.",
      "The alternative most people try first is free content, a cheap online certificate, six months of drifting between platforms, and no evidence they can defend in an interview. A structured programme with live client budgets, a mentor who corrects your work weekly, a documented internship and a placement cell that calls employers is the difference between having watched digital marketing and being hired to do it.",
    ],

    /**
     * One ladder of 34 modules, read across three enrolment lengths.
     *
     * Numbering runs 01–34 without restarting, because the stages nest: the
     * 6-month track continues from Module 11, the 9-month from Module 23. That
     * is the fact the table exists to make obvious — extending later repeats
     * nothing.
     */
    syllabus: {
      intro:
        "Modules are numbered 01 to 34 in a single sequence, and progression is capability-gated: you advance when a deliverable passes review, not when the calendar says so. Every module is specified the same way — topics, tool stack, the commercial problem the skill solves, and a graded artefact that goes into your portfolio.",
      stages: [
        {
          months: 3,
          label: "Practitioner",
          range: "Modules 1 – 10",
          summary:
            "Plan, build and run your first live campaign — starting from no marketing background.",
        },
        {
          months: 6,
          label: "Professional",
          range: "Modules 11 – 22",
          summary:
            "Run a business's entire acquisition, with AI in the workflow and numbers you can defend.",
        },
        {
          months: 9,
          label: "Expert",
          range: "Modules 23 – 34",
          summary:
            "Own the growth system a business runs on, not just one channel.",
        },
      ],
      modules: [
        {
          n: 1,
          from: 3,
          title: "Marketing Foundations, Funnels & Campaign Maths",
          body: "Buyer psychology, funnel architecture (TOFU/MOFU/BOFU) and the metric chain — CPM, CPC, CPL, CAC, ROAS, break-even ROAS.",
        },
        {
          n: 2,
          from: 3,
          title: "Brand Positioning & Competitive Intelligence",
          body: "Positioning statements, brand archetypes, and a structured competitor ad-spy method using the Meta Ad Library and Google Ads Transparency Center.",
        },
        {
          n: 3,
          from: 3,
          title: "Ad Creative Production (Photoshop & Canva)",
          body: "Visual hierarchy, static and carousel ad design, and creative production in Adobe Photoshop and Canva Pro to live platform specifications.",
        },
        {
          n: 4,
          from: 3,
          title: "Website Building with WordPress & Gutenberg",
          body: "Domains, hosting, WordPress installation and the Gutenberg block editor, with enquiry forms and Core Web Vitals basics.",
        },
        {
          n: 5,
          from: 3,
          title: "Keyword Research & Search Intent",
          body: "Classifying search intent, keyword scoring and clustering, and building a keyword-to-URL matrix in Semrush, Ahrefs and Google Keyword Planner.",
        },
        {
          n: 6,
          from: 3,
          title: "On-Page SEO & Content Optimisation",
          body: "Title tags, meta descriptions, E-E-A-T signals and Rank Math configuration for on-page ranking factors.",
        },
        {
          n: 7,
          from: 3,
          title: "Local SEO & Google Business Profile",
          body: "Map-pack ranking factors, citation building, review generation and geo-grid rank tracking.",
        },
        {
          n: 8,
          from: 3,
          title: "Organic Social Media Operations",
          body: "Content pillars, caption frameworks and publishing workflows across Instagram, Facebook, LinkedIn and YouTube.",
        },
        {
          n: 9,
          from: 3,
          title: "Meta Ads Manager & Conversion Tracking",
          body: "Business Manager setup, Meta Pixel and Conversions API, audience building and campaign structure.",
        },
        {
          n: 10,
          from: 3,
          title: "Practitioner Capstone — Live Campaign & Client Report",
          body: "A live campaign built on a real account, presented with a Looker Studio dashboard and a written client report to a mock client panel.",
        },
        {
          n: 11,
          from: 6,
          title: "Generative AI for Marketing — Prompting & Assistants",
          body: "Prompt frameworks for ChatGPT, Claude, Gemini and Perplexity, and building a brand-trained custom AI assistant.",
        },
        {
          n: 12,
          from: 6,
          title: "Conversion Copywriting & AI Content Systems",
          body: "Direct-response copy frameworks — AIDA, PAS, FAB — and AI-assisted drafting across ads, landing pages and email sequences.",
        },
        {
          n: 13,
          from: 6,
          title: "Video Production & Short-Form Editing",
          body: "Scriptwriting, retention-curve design and editing in Adobe Premiere Pro and CapCut for Reels, Shorts and YouTube.",
        },
        {
          n: 14,
          from: 6,
          title: "Elementor Pro — Conversion Landing Pages",
          body: "Building dedicated, split-tested landing pages without a developer, using Elementor Pro's theme builder and pro widgets.",
        },
        {
          n: 15,
          from: 6,
          title: "WooCommerce Store Engineering & Plugin Stack",
          body: "Product catalogues, Indian payment gateways, GST tax classes and the professional WordPress plugin stack for stores.",
        },
        {
          n: 16,
          from: 6,
          title: "Technical SEO, Schema & Site Health",
          body: "Crawl audits in Screaming Frog, Core Web Vitals remediation and JSON-LD schema implementation.",
        },
        {
          n: 17,
          from: 6,
          title: "Off-Page SEO, Digital PR & Link Acquisition",
          body: "Link prospecting, outreach templates and digital PR to move a site from page two to page one.",
        },
        {
          n: 18,
          from: 6,
          title: "Analytics Infrastructure — GTM, GA4 & Conversions API",
          body: "Google Tag Manager, GA4 event architecture, attribution models and Meta Conversions API deployment.",
        },
        {
          n: 19,
          from: 6,
          title: "Google Search & Display Advertising",
          body: "Account architecture, Quality Score, Responsive Search Ads and bidding strategies across Search and Display.",
        },
        {
          n: 20,
          from: 6,
          title: "Shopping, Performance Max & YouTube Advertising",
          body: "Google Merchant Center feeds, Shopping and Performance Max campaigns, and YouTube ad formats.",
        },
        {
          n: 21,
          from: 6,
          title: "Meta Ads at Scale — Creative Testing & Scaling",
          body: "Creative testing matrices, fatigue detection and vertical/horizontal budget scaling while holding cost per acquisition steady.",
        },
        {
          n: 22,
          from: 6,
          title: "Professional Capstone — Omnichannel Campaign & Reporting",
          body: "A full account audit across website, SEO, paid and social, a monthly reporting pack, and a case study defended to a mock client panel.",
        },
        {
          n: 23,
          from: 9,
          title: "AI Video Generation & Synthetic Creative",
          body: "Text-to-video and AI avatars using Sora, Google Veo, Runway, Kling and HeyGen, with multilingual AI voice via ElevenLabs.",
        },
        {
          n: 24,
          from: 9,
          title: "Niche Instagram Channel Launch & Positioning",
          body: "Validating a niche, building a content-pillar system, and launching an owned audience channel from zero.",
        },
        {
          n: 25,
          from: 9,
          title: "Mobile Cinematography & the 15-Day Reel Sprint",
          body: "Smartphone camera control, lighting and audio capture, followed by fifteen consecutive days of shoot, edit and publish.",
        },
        {
          n: 26,
          from: 9,
          title: "Vibe-Coded Web Design with Lovable",
          body: "Building deployed web products — landing pages and lead-capture apps with a database — using Lovable and Supabase.",
        },
        {
          n: 27,
          from: 9,
          title: "Shopify Store Development & D2C Operations",
          body: "Store setup, Indian payments, conversion apps and Shopify SEO for direct-to-consumer brands.",
        },
        {
          n: 28,
          from: 9,
          title: "Site Migration, Performance & Maintenance Operations",
          body: "Zero-loss site migrations, performance engineering and pricing a website maintenance retainer.",
        },
        {
          n: 29,
          from: 9,
          title: "AI Integration — Chatbots, WhatsApp & CRM",
          body: "Training a brand chatbot, WhatsApp Business API deployment and CRM routing for inbound leads.",
        },
        {
          n: 30,
          from: 9,
          title: "LinkedIn Ads & B2B Demand Generation",
          body: "Campaign Manager setup, account-based targeting and B2B lead-quality scoring.",
        },
        {
          n: 31,
          from: 9,
          title: "Multi-Platform & Marketplace Advertising",
          body: "Advertising on X, Pinterest, Reddit, Amazon and Flipkart, plus unified cross-channel reporting.",
        },
        {
          n: 32,
          from: 9,
          title: "GEO & AEO — Visibility Inside AI Search",
          body: "Structuring content so brands get cited inside ChatGPT Search, Perplexity, Google AI Overviews and Gemini.",
        },
        {
          n: 33,
          from: 9,
          title: "Marketing Automation & Predictive Analytics",
          body: "Building automation pipelines in Zapier, Make and n8n, and predictive work like churn signals and LTV forecasting.",
        },
        {
          n: 34,
          from: 9,
          title: "Agency Operating System, Client Commercials & Architect Capstone",
          body: "A complete client kit — audit, proposal, quotation and GST invoice — plus a live growth system presented as an agency pitch deck.",
        },
      ],
      note: "Nested, not parallel. The six-month programme contains everything in the three-month programme and continues from Module 11; the nine-month programme contains both and continues from Module 23. Choosing a shorter programme costs you scope, never depth — and you can extend later without repeating a single module.",
    },

    // --- Stage 3 ---
    whyTechcadd: {
      intro:
        "There are several places to learn digital marketing in Jalandhar and the brochure syllabus looks similar at most of them. What differs is whether you ever touch a live account, whether the trainer still does client work, and whether the placement cell keeps calling after your batch ends. Techcadd has trained students across Punjab since 2007 on the same model: small batches, practitioner trainers, live client work as coursework.",
      points: [
        {
          title: "Trainers who still do the work",
          body: "Your trainer runs live client accounts for Techcadd's own services arm, so the Meta and Google Ads examples in class are from this quarter, not a five-year-old case study.",
        },
        {
          title: "Live budgets, real consequences",
          body: "You spend real advertising budgets and publish to real domains under supervision. A tracked conversion and a before-and-after ranking record are what an interviewer asks to see first.",
        },
        {
          title: "Small batches, daily lab time",
          body: "Batches stay small enough that a trainer reviews your dashboard daily. Lab hours run outside class and doubt sessions continue until a concept lands.",
        },
        {
          title: "Internship letter and certificate",
          body: "Every student finishes with an industry-recognised certificate and a documented internship on real client work, accepted for university industrial training requirements.",
        },
        {
          title: "A placement cell that persists",
          body: "Mock interviews, CV reviews and drives with hiring partners across Jalandhar, Mohali, Chandigarh and Ludhiana — repeated after a rejection, not abandoned.",
        },
        {
          title: "Since 2007, 25,000+ students",
          body: "Nearly two decades of hiring relationships in Punjab is why local employers know exactly what a Techcadd certificate in digital marketing means.",
        },
      ],
    },

    // --- Stage 4 ---
    learn: {
      /* No `modules` here on purpose: the comparison table above already
         lists all thirty-four, and repeating them as an accordion would make
         a reader scroll the same syllabus twice. */
      intro:
        "The syllabus runs as a single ladder, not three separate courses — the 6-month Professional track continues exactly where the 3-month Practitioner track ends, and the 9-month Expert track continues where the Professional track ends, so choosing a shorter duration costs you scope, never depth. You begin with buyer psychology and funnel maths, move into a live website, ranked keywords and a running Meta ad account by the end of Stage 1, then layer in generative AI, technical SEO, the full Google Ads suite and WooCommerce by the end of Stage 2. Stage 3 is where you stop running channels and start designing growth systems — AI video production, niche audience building, Shopify and vibe-coded web products, automation, GEO/AEO visibility and the commercial mechanics of running an agency. Every module is specified the same way and ends in a graded, portfolio-ready deliverable: a funnel blueprint, a ranked site, a live Meta campaign, a technical SEO audit, an AI-generated video ad set, a completed client kit. Evidence — a tracked conversion, a before-and-after ranking record, a documented cost per acquisition — is what interviewers in Jalandhar and Mohali actually ask to see, so every fortnight of the course is built around producing one.",
      tools: [
        "Google Ads",
        "Meta Ads Manager",
        "Google Analytics 4",
        "Google Tag Manager",
        "Google Search Console",
        "Google Business Profile",
        "Google Merchant Center",
        "Rank Math",
        "Semrush",
        "Ahrefs",
        "Screaming Frog",
        "WordPress",
        "Elementor",
        "WooCommerce",
        "Shopify",
        "Canva",
        "Adobe Photoshop",
        "Adobe Premiere Pro",
        "CapCut",
        "ChatGPT",
        "Claude",
        "Gemini",
        "Midjourney",
        "Runway",
        "HeyGen",
        "Looker Studio",
        "Microsoft Clarity",
        "Zapier",
        "n8n",
        "WhatsApp Business",
        "HubSpot",
        "LinkedIn Campaign Manager",
      ],
    },

    // --- Stage 4B: career outcomes, rendered in the FAQ accordion ---
    outcomes: [
      {
        q: "What job roles open up after Digital Marketing?",
        a: "Graduates move through Digital Marketing Executive, SEO Executive and Social Media Executive roles early, into Performance Marketing Executive, SEO Specialist and Digital Marketing Manager at mid-level, and toward Growth Manager, Digital Growth Architect or Agency Founder with the full 9-month track. Local demand across Jalandhar and Mohali's export, healthcare, education and D2C sectors is currently ahead of trained supply.",
      },
      {
        q: "What can I earn, and how fast does it grow?",
        a: "Entry-level Digital Marketing Executives in the Jalandhar and Mohali market typically start in a modest but realistic bracket and move up quickly once they can show a portfolio of ranked pages and profitable ad accounts. Performance and specialist roles command noticeably more, and pay scales fastest for people who can prove cost-per-acquisition improvements with dates and numbers, not just a certificate.",
      },
      {
        q: "Can I freelance or work remotely with this skill?",
        a: "Yes. A Jalandhar address is no barrier on a remote brief — the 9-month track specifically covers client acquisition, proposals, pricing models, GST invoicing and contracts so you can price and defend freelance or agency work for clients anywhere.",
      },
      {
        q: "Which industries hire for this in Punjab?",
        a: "Beyond marketing agencies, Jalandhar's export houses, sports goods and hand-tool manufacturers, immigration consultancies, hospitals, clinics, schools, coaching institutes and real estate firms all now run in-house digital marketing rather than outsourcing it entirely.",
      },
      {
        q: "Can I continue to higher studies or a specialisation later?",
        a: "Yes. The 34-module ladder is designed to be picked up again — a 3-month graduate can return and continue from Module 11 without repeating any module, and the certificate and portfolio from each stage stand on their own for university industrial training requirements.",
      },
    ],

    projects: [
      {
        title: "Funnel & Break-Even Model",
        body: "Your first working deliverable: a funnel blueprint for a real business plus a break-even calculator that turns budget, CPC and conversion rate into CAC and ROAS.",
        tags: ["Google Sheets", "Miro"],
      },
      {
        title: "Live Website & Ranked Listing",
        body: "A five-page WordPress site on a real domain with working enquiry capture, alongside a fifty-keyword optimisation matrix and an optimised Google Business Profile with geo-grid proof.",
        tags: ["WordPress", "Rank Math"],
      },
      {
        title: "Live Meta Ad Campaign",
        body: "A real advertising budget spent with verified Pixel events, a documented optimisation log and cost-per-lead tracked before and after.",
        tags: ["Meta Ads Manager", "GA4"],
      },
      {
        title: "Client Kit / Growth System Capstone",
        body: "Depending on your track: a Practitioner client report, a Professional omnichannel audit, or — at 9 months — a complete agency kit of audit, proposal, quotation and GST invoice for a real business, defended to a mock client panel.",
        tags: ["Looker Studio", "Zoho Books"],
      },
    ],

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
    /* Every answer opens with a direct, standalone sentence so it can be
       lifted whole by an AI answer engine or read aloud by voice search, then
       adds one supporting sentence with a concrete local detail.

       Fees and salary bands deliberately carry no figure: the page must not
       display a number a counsellor cannot honour. */
    faqs: [
      {
        q: "What is the duration of the Digital Marketing course in Jalandhar?",
        a: "Techcadd runs the Digital Marketing course over 3, 6 or 9 months, structured as one continuous 34-module programme rather than three separate courses. Weekday, evening and weekend batches cover the same syllabus, and each stage picks up exactly where the previous one ended — no module is repeated if you extend later.",
      },
      {
        q: "What is the fee for the Digital Marketing course in Jalandhar?",
        a: "Techcadd's Digital Marketing course fee depends on the track — the 3-month Practitioner stage costs less than the 6-month Professional or 9-month Expert stages, which include live paid-media budgets, AI tools and a larger deliverable set. Counsellors share the current fee sheet and EMI options on request, and a demo class is free.",
      },
      {
        q: "Who can join the Digital Marketing course?",
        a: "Students after 12th, graduates, working professionals switching careers, and business owners or freelancers can all join — the course starts at Module 01 with no marketing or design background assumed. A basic comfort with computers is helpful but not required.",
      },
      {
        q: "What jobs can I get after the Digital Marketing course?",
        a: "Graduates typically move into roles such as Digital Marketing Executive, SEO Executive, Social Media Executive or Performance Marketing Executive, depending on the track completed. The 9-month Expert track additionally prepares students for Growth Manager, Digital Growth Architect or Agency Founder roles.",
      },
      {
        q: "What salary can a fresher expect after this course in Jalandhar?",
        a: "A fresher completing the Practitioner stage with a working portfolio typically starts as a Digital Marketing Executive in the Jalandhar and Mohali market, with pay rising as the portfolio grows to include paid-media results and technical SEO work. Freelancers and specialists in Performance Marketing or SEO generally earn more, since remote client work is not limited by location.",
      },
      {
        q: "Is placement guaranteed after the Digital Marketing course?",
        a: "No institute can honestly guarantee a job, and any Jalandhar institute claiming otherwise should be treated with caution. Techcadd guarantees placement support — CV reviews, mock interviews, portfolio preparation and repeated drives with hiring partners across Jalandhar, Mohali, Chandigarh and Ludhiana.",
      },
      {
        q: "Which tools and software will I learn?",
        a: "Students work hands-on with Google Ads, Meta Ads Manager, GA4, Google Tag Manager, Semrush, Ahrefs, WordPress, Elementor Pro, WooCommerce, Shopify, Canva Pro, Photoshop, Premiere Pro, ChatGPT, Claude and Looker Studio, among others. All practice happens on live student accounts, not demo screenshots.",
      },
      {
        q: "Will I get a certificate and internship letter?",
        a: "Yes. Every student receives an industry-recognised certificate on completion plus a documented internship letter based on live client work, which satisfies the industrial training requirement at most Punjab universities.",
      },
      {
        q: "Do you work on real campaigns or only theory?",
        a: "Every module ends in a graded deliverable built on a real account — a live website, a ranked keyword set, a running Meta or Google Ads campaign with real spend. The course finishes with a capstone built on a live client brief, supervised by a trainer.",
      },
      {
        q: "Are weekend and evening batches available?",
        a: "Yes. Techcadd Jalandhar runs weekday, evening and weekend batches in parallel so working professionals and college students can both attend without changing their existing schedule. A free demo class lets you see the lab and meet the trainer before enrolling.",
      },
      {
        q: "What is the difference between the 3, 6 and 9-month Digital Marketing courses?",
        a: "The 3-month Practitioner track covers foundations, a website, SEO basics and a first Meta ad campaign; the 6-month Professional track adds generative AI, technical SEO, WooCommerce and the full Google Ads suite; the 9-month Expert track adds AI video production, Shopify, automation, GEO/AEO visibility work and agency-level client commercials. Each stage is nested inside the next, so nothing is repeated if a student extends their programme.",
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

/**
 * Every course name a form may legitimately submit.
 *
 * The course-page form renders its field read-only, but that is presentation
 * only — anyone can POST whatever they like. Checking the value against this
 * set is what actually stops the enquiries table filling with junk course
 * names, and it keeps the popup's dropdown honest too.
 */
export const COURSE_LABELS: ReadonlySet<string> = new Set(
  CATALOGUE.map((entry) => entry.label),
)

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
    related: relatedFor(entry),
  }
}

/**
 * The six most closely related courses.
 *
 * This used to be "the first six entries in the same nav menu group", which is
 * catalogue order — so Python listed Java, C & C++ and Kotlin purely because
 * they sit near it in the menu, while Machine Learning and Data Science, which
 * share most of their toolchain with it, never appeared.
 *
 * Now scored on what the courses actually have in common:
 *
 *   +3  a shared career outcome — the strongest signal, since it means the two
 *       courses compete for or complement the same job
 *   +2  a shared tool
 *   +4  the same menu group, which still carries real editorial meaning
 *
 * Ties break on label so the order is stable: these pages are prerendered, and
 * a comparator that leaves ties unresolved can reorder between builds.
 *
 * Same segment only. A course page offering an internship format as a "related
 * course" is answering a different question than the reader asked.
 */
function relatedFor(entry: CatalogueEntry): string[] {
  const lower = (s: string) => s.toLowerCase()
  const self = COURSE_SPECS[`${entry.segment}/${entry.slug}`]
  const selfTools = new Set((self?.tools ?? []).map(lower))
  const selfCareers = new Set((self?.careers ?? []).map(lower))

  return CATALOGUE.filter(
    (e) =>
      e.segment === entry.segment &&
      !(e.segment === entry.segment && e.slug === entry.slug),
  )
    .map((e) => {
      const spec = COURSE_SPECS[`${e.segment}/${e.slug}`]
      let score = e.group === entry.group ? 4 : 0
      for (const tool of spec?.tools ?? []) {
        if (selfTools.has(lower(tool))) score += 2
      }
      for (const career of spec?.careers ?? []) {
        if (selfCareers.has(lower(career))) score += 3
      }
      return { entry: e, score }
    })
    .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label))
    .slice(0, 6)
    .map((x) => `/${x.entry.segment}/${x.entry.slug}`)
}

/**
 * Label and one-line description for a related-course card.
 *
 * The card used to title itself by de-slugging its own href, which produced
 * "mern stack" and "c cpp". The catalogue already holds the real label.
 */
export function courseCard(href: string): {
  href: string
  label: string
  group: string
  tagline: string
} | null {
  const match = href.match(
    /^\/(courses|internship-training|after-12th-courses)\/([a-z0-9-]+)$/,
  )
  if (!match) return null

  const found = CATALOGUE.find(
    (e) => e.segment === match[1] && e.slug === match[2],
  )
  if (!found) return null

  const spec = COURSE_SPECS[`${found.segment}/${found.slug}`]
  return {
    href,
    label: found.label,
    group: found.group,
    // Sentence-cased: the taglines are written to follow "X is …".
    tagline: spec
      ? spec.tagline.charAt(0).toUpperCase() + spec.tagline.slice(1)
      : "Live projects, industry trainers and placement support.",
  }
}

/** Drops keys the author left out, so they fall through to generated content. */
function defined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>
}

export function getCoursePage(segment: Segment, slug: string) {
  const entry = CATALOGUE.find((e) => e.segment === segment && e.slug === slug)
  if (!entry) return undefined

  const generated = generateContent(stubPage(entry), `${segment}/${slug}`)

  // Generated content is the floor, hand-authored copy the override. Layering
  // this way means a page authored before a section existed still gets that
  // section rather than silently missing it.
  const authored = COURSE_PAGES.find(
    (p) => p.segment === segment && p.slug === slug,
  )

  return authored ? { ...generated, ...defined(authored) } : generated
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

/**
 * Every course name a visitor may pick, grouped for a <select>'s optgroups.
 *
 * The enquiry API validates `course` against COURSE_LABELS and rejects
 * anything else, so a contact form cannot offer a free-text field here — the
 * submission would simply bounce. Building the options from the same catalogue
 * that builds COURSE_LABELS means the two can never disagree.
 *
 * Labels rather than slugs, because the label is what is stored on the
 * enquiry and what a counsellor reads.
 */
export function courseOptions(): { group: string; labels: string[] }[] {
  const groups = new Map<string, string[]>()
  for (const entry of CATALOGUE) {
    groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry.label])
  }
  return [...groups.entries()].map(([group, labels]) => ({ group, labels }))
}
