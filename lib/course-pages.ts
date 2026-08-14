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
      { label: "Mode", value: "Classroom, Weekend & 1-on-1" },
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
        a: "Yes. Techcadd Jalandhar runs weekday, evening and weekend batches in parallel so working professionals and college students can both attend without changing their existing schedule. 1-on-1 training is also available if you would rather set your own pace. Every class — batch or 1-on-1 — runs for 2 hours, and a free demo class lets you see the lab and meet the trainer before enrolling.",
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

  {
    slug: "wordpress",
    segment: "courses",
    eyebrow: "WordPress",
    h1: "WordPress Development Course in Jalandhar",
    title:
      "WordPress Development Course in Jalandhar — Live Client Build | Techcadd",
    description:
      "14-week WordPress Development Course in Jalandhar — build in Gutenberg and Elementor Pro, launch a WooCommerce store with Indian payments, then rank it with SEO, AEO and GEO. Live client build, internship letter and placement support at Techcadd.",
    keywords: [
      "wordpress course jalandhar",
      "wordpress development course in jalandhar",
      "wordpress training institute jalandhar",
      "woocommerce course jalandhar",
      "elementor training jalandhar",
      "wordpress course with placement jalandhar",
      "wordpress course fees in jalandhar",
      "website designing course jalandhar",
    ],
    intro:
      "Build it, rank it, sell from it — a 14-week production course in WordPress, WooCommerce, Elementor and search visibility, including AEO and GEO for AI answers.",
    facts: [
      { label: "Duration", value: "14 Weeks · 3 Months" },
      { label: "Mode", value: "Classroom, Weekend & 1-on-1" },
      { label: "Eligibility", value: "12th Pass Onward" },
      { label: "Includes", value: "Live Client Build" },
    ],

    overview: [
      "Techcadd's WordPress Development Course in Jalandhar is a 14-week, 14-module programme that takes you from an empty domain to a client-grade website you rank, sell from and hand over. You build in Gutenberg and Elementor Pro, engineer a WooCommerce store that takes real Indian payments, then rank the same site with keyword research, on-page work and a properly configured SEO plugin stack — finishing with AEO and GEO work so the pages can be cited inside AI search.",
      "Every module ends in a graded deliverable built on a live domain you own, not a localhost demo that disappears at the end of the batch. The final week is a client-grade build handed over with documentation, a quotation and a GST invoice.",
    ],

    whoCanDo: {
      intro:
        "WordPress starts at Module 01 with domains, hosting and DNS, so no coding or design background is assumed. The batch mixes students, graduates, working professionals and business owners — what decides the outcome is consistency through the fourteen modules, not where you start.",
      groups: [
        {
          title: "Students after 12th",
          body: "No coding or design background is needed — Module 01 starts at domains, DNS and hosting and assumes nothing before it. Most students build their first paid site for a local shop or clinic during the course.",
        },
        {
          title: "Graduates and final-year students",
          body: "Web and WordPress roles in Jalandhar and Mohali hire on portfolio, not marks. By the final week you have a live URL, a working enquiry form, a WooCommerce store that has taken a test order and a ranking record with dates.",
        },
        {
          title: "Working professionals",
          body: "Weekend and evening batches let you build sites for clients on the side while keeping your job. Professionals in education, real estate and healthcare often start by rebuilding their own company's website.",
        },
        {
          title: "Business owners and freelancers",
          body: "Shop owners, coaching-centre operators and clinic owners across Jalandhar are paying agencies monthly for a site they cannot edit themselves. This course teaches you to build, rank and maintain it in-house — including WooCommerce with Indian payments, GST tax classes and courier integration.",
        },
      ],
    },

    whyProgram: [
      "Every business that opens needs a website, and most of Jalandhar's businesses sit within a twenty-kilometre radius of you. The sports goods and leather cluster, the coaching-institute belt around Model Town, clinics, showrooms, gyms and real-estate offices all buy the same two things — a five-page site with an enquiry form, or a WooCommerce store that takes payments. Both are taught here.",
      "The money is in what happens after launch. A one-off site is sold once; hosting, maintenance, security, backups, SEO and content are sold every month against a documented checklist, and a dedicated module covers scoping and pricing exactly that retainer. Students who finish this course leave with two revenue models, not one.",
      "Supervised live work beats free tutorials because of the review, not the content. What a tutorial cannot give you is someone checking whether your permalinks were set before publishing, whether your build loads six web fonts, or whether your migration lost indexed pages. Every module here ends in a graded deliverable a trainer reviews before you move on.",
      "You are being trained for a job that changed recently. Block themes replaced classic ones, Core Web Vitals became a measured ranking input, and a growing share of search now ends inside an AI answer that cites only a handful of pages. Assembling a theme is no longer a skill anyone pays for — structuring a site so it loads, ranks, gets cited, converts and can be maintained still is, and this programme is built around exactly that shift.",
    ],

    whyTechcadd: {
      intro:
        "There are several places to learn WordPress in Jalandhar and the brochure syllabus looks similar at most of them. What differs is whether you ever touch a live domain, whether the trainer still does client work, and whether the placement cell keeps calling after your batch ends.",
      points: [
        {
          title: "Trainers who do live client work",
          body: "Your trainer builds and maintains sites for paying clients, so the course covers unglamorous things like failed checkouts, plugin conflicts and migrations that lose rankings — not a five-year-old case study.",
        },
        {
          title: "Fourteen graded deliverables, not fourteen lectures",
          body: "Every module ends in an artefact a trainer reviews before you move on — a live URL, a tracked form, a test order, a crawl report, a Core Web Vitals score. You do not advance on attendance.",
        },
        {
          title: "You work on a live domain you own",
          body: "Real hosting, real SSL, a real payment gateway and real search data from Week 1. Nothing in this course happens on a localhost demo that disappears at the end of the batch.",
        },
        {
          title: "Small batches",
          body: "Deliverable-based review only works if the trainer can actually review it, so batch sizes stay small enough for individual feedback on each submission.",
        },
        {
          title: "Internship letter and certificate",
          body: "Students completing the capstone receive a course certificate and an internship letter covering the live client-grade build.",
        },
        {
          title: "Since 2007, trained across Punjab",
          body: "Techcadd has run skill-training programmes across Jalandhar, Ludhiana, Mukerian, Hoshiarpur, Phagwara, Bathinda, Amritsar, Patiala and Mohali since 2007.",
        },
      ],
    },

    learn: {
      intro:
        "The course moves in one line from an empty domain to a site someone pays for. You begin with the plumbing — DNS, hosting, cPanel and staging — then install WordPress and learn to publish properly in Gutenberg before touching any page builder. From there you build a design system with block themes, then learn Elementor Pro's theme builder so a fifty-page site costs the same effort as a five-page one. Month 2 turns the site into a business — landing pages that capture enquiries, tracking that proves they arrived, a WooCommerce catalogue, and Indian payments, GST and shipping configured to actually complete an order. Month 3 makes the site findable and durable — keyword research drives the architecture, on-page work and a properly configured SEO plugin stack fix what is published, technical SEO and Core Web Vitals fix what is underneath, AEO and GEO structure the pages so AI answers can cite them, and security, backups and migration keep the whole thing alive. The final week is a client-grade build handed over with documentation, a quotation and a GST invoice.",
      modules: [
        {
          title: "Web Foundations, Domains & Hosting Operations",
          points: [
            "DNS, nameservers, A/CNAME/MX/TXT records and propagation",
            "cPanel operations — file manager, FTP, phpMyAdmin, staging and scheduled backups",
            "SSL, forced HTTPS and local development with LocalWP",
          ],
        },
        {
          title: "WordPress Core, Gutenberg & Content Architecture",
          points: [
            "Installation, permalinks, user roles and the Gutenberg block editor",
            "Patterns, synced patterns and reusable sections",
            "The essential plugin stack for forms, security, backup and SEO",
          ],
        },
        {
          title: "Block Themes, Full Site Editing & Design Systems",
          points: [
            "The Site Editor — templates, template parts, headers and footers",
            "Global styles, theme.json, colour palettes and type scales",
            "Child themes, custom CSS placement and accessibility basics",
          ],
        },
        {
          title: "Elementor Pro — Theme Builder & Dynamic Sites",
          points: [
            "Containers, flexbox layout and the theme builder's display conditions",
            "Dynamic content and custom fields with ACF",
            "Keeping builder sites fast — widget bloat, font loading, DOM weight",
          ],
        },
        {
          title: "Conversion Landing Pages, Forms & Lead Capture",
          points: [
            "Landing page anatomy — proof stacking, objection blocks, thank-you flows",
            "Elementor forms with webhooks, Google Sheets and CRM integrations",
            "Conversion tracking with Google Tag Manager and GA4 key events",
          ],
        },
        {
          title: "WooCommerce Store Engineering",
          points: [
            "Product types, attributes, variations and inventory discipline",
            "Catalogue and category architecture, filtering and bulk CSV import",
            "Store templates in Gutenberg blocks and Elementor Pro WooCommerce widgets",
          ],
        },
        {
          title: "Payments, GST, Logistics & Checkout Conversion",
          points: [
            "Razorpay, PayU and cash on delivery",
            "GST tax classes, HSN handling, shipping zones and courier integration",
            "Abandoned cart recovery and the go-live checklist",
          ],
        },
        {
          title: "Keyword Research, Intent & Site Architecture",
          points: [
            "Classifying informational, commercial, transactional and navigational intent",
            "Competitor keyword gap analysis and clustering into topics",
            "Mapping every keyword to a specific URL and deriving site architecture",
          ],
        },
        {
          title: "On-Page SEO & Content Optimisation in WordPress",
          points: [
            "Title tag formulas, meta descriptions, heading structure and alt text",
            "E-E-A-T signals, internal linking and contextual siloing",
            "Optimising WooCommerce product and category pages",
          ],
        },
        {
          title: "The SEO Plugin Stack — Rank Math, Schema & Redirections",
          points: [
            "Comparing Rank Math, Yoast and All in One SEO, migrating without losing metadata",
            "Meta templates for every post type, indexation rules, sitemaps and breadcrumbs",
            "The schema generator, redirection manager and 404 monitor",
          ],
        },
        {
          title: "Technical SEO, Schema & Core Web Vitals",
          points: [
            "Robots.txt, XML sitemaps, crawl budget and canonical rules",
            "Crawling a site in Screaming Frog and triaging the export into a fix sheet",
            "Core Web Vitals — LCP, INP and CLS — measured and remediated",
          ],
        },
        {
          title: "AEO & GEO — Visibility Inside AI Search",
          points: [
            "How ChatGPT Search, Perplexity, Google AI Overviews and Gemini retrieve and cite sources",
            "Question-first structure, direct answer blocks and extractable formatting",
            "Entity consistency across site and schema, and measuring AI referral traffic in GA4",
          ],
        },
        {
          title: "Security, Backups, Migration & Maintenance Operations",
          points: [
            "Hardening, malware scanning, incident response and tested restores",
            "Migration with All-in-One WP Migration, Duplicator and Migrate Guru",
            "Preserving search equity through redirect mapping and scoping a maintenance retainer",
          ],
        },
        {
          title: "Capstone — Live Client Build, Launch & Handover",
          points: [
            "Scoping a build from a client conversation and pre-launch quality assurance",
            "Analytics and Search Console handover with a client training video",
            "Proposals, quotations, GST invoices and portfolio preparation",
          ],
        },
      ],
      tools: [
        "cPanel",
        "LocalWP",
        "FileZilla",
        "phpMyAdmin",
        "Cloudflare",
        "WordPress",
        "Gutenberg",
        "Site Editor / FSE",
        "Elementor Pro",
        "ACF",
        "WPForms",
        "WooCommerce",
        "Razorpay",
        "Shiprocket",
        "Rank Math",
        "Screaming Frog",
        "Google Search Console",
        "Google Tag Manager",
        "GA4",
        "Microsoft Clarity",
        "WP Rocket",
        "Wordfence",
        "UpdraftPlus",
        "Duplicator",
        "ChatGPT",
        "Perplexity",
        "Looker Studio",
        "Zoho Books / Refrens",
      ],
    },

    outcomes: [
      {
        q: "What job roles open up after WordPress?",
        a: "Graduates move into WordPress Developer, WooCommerce Developer, Website Manager, Web Content Executive and SEO Executive roles, plus freelance web consulting. Agencies in Jalandhar, Mohali and Ludhiana hire for the first three directly, and the SEO route opens because the course covers keyword research, on-page, technical SEO and AI-search visibility rather than design alone.",
      },
      {
        q: "What can I earn, and how fast does it grow?",
        a: "Entry-level WordPress roles in the Jalandhar and Mohali market start modestly and move up quickly once you can show WooCommerce and technical SEO work alongside a build. Freelance work is priced per project rather than monthly, and remote roles for metro or overseas clients pay noticeably more once your portfolio can prove it.",
      },
      {
        q: "Can I freelance or work remotely with this skill?",
        a: "Yes — WordPress is one of the few skills where the deliverable is a URL, so location stops mattering once you can show completed work. The course covers scoping and pricing a maintenance retainer and writing quotations, which is what lets you charge properly for freelance builds.",
      },
      {
        q: "Which industries hire for this in Punjab?",
        a: "Coaching institutes, clinics and diagnostic labs, real estate and property firms, gyms and salons, and sports goods and leather manufacturers around Jalandhar all hire in-house or freelance WordPress talent, along with the digital agencies serving them.",
      },
      {
        q: "Can I specialise further after this course?",
        a: "Yes — the natural next steps are SEO, performance marketing or Shopify development, and this course already carries the search foundation. Students who want to go deeper into rankings and link building usually continue into the dedicated SEO programme.",
      },
    ],

    projects: [
      {
        title: "Five-Page Business Website",
        body: "Built in Gutenberg on a real domain with working enquiry capture, mobile tested, on a documented plugin stack — the single deliverable small businesses in Jalandhar buy most often.",
        tags: ["WordPress", "Gutenberg"],
      },
      {
        title: "Dynamic Elementor Site & Tracked Landing Pages",
        body: "A custom header, footer, blog archive and single templates driven by custom fields, plus three live landing pages with tracked form submissions and a split test running.",
        tags: ["Elementor Pro", "GTM + GA4"],
      },
      {
        title: "Live WooCommerce Store",
        body: "A structured catalogue of thirty products with variations and filtering, a completed test order, a generated GST invoice and a working abandoned-cart recovery flow.",
        tags: ["WooCommerce", "Razorpay"],
      },
      {
        title: "Capstone — Client-Grade Build & Handover",
        body: "One site taken from a client brief to launch with a technical and SEO audit, an AI-visibility scorecard and a client dashboard, handed over with documentation, a quotation and a GST invoice.",
        tags: ["Rank Math", "Looker Studio"],
      },
    ],

    reviews: [
      {
        name: "Rajat Mahajan",
        role: "WordPress Developer",
        city: "Jalandhar",
        initials: "RM",
        quote:
          "I built and launched a real WooCommerce store during the course, not a demo theme. That store is still live and it's the first thing I show in interviews.",
      },
      {
        name: "Kirandeep Kaur",
        role: "Freelance Web Developer",
        city: "Phagwara",
        initials: "KK",
        quote:
          "The migration and maintenance module is the reason I can now charge a monthly retainer instead of billing once and disappearing.",
      },
      {
        name: "Aman Thakur",
        role: "Website Manager",
        city: "Hoshiarpur",
        initials: "AT",
        quote:
          "Elementor Pro was the part I actually needed for my job. I now build client pages in an afternoon instead of a week.",
      },
      {
        name: "Simran Oberoi",
        role: "WooCommerce Developer",
        city: "Kapurthala",
        initials: "SO",
        quote:
          "We built a thirty-product store with real Razorpay payments and a GST invoice flow. My interviewer asked how I'd handle a failed checkout and I already had an answer.",
      },
      {
        name: "Deepak Bansal",
        role: "SEO & WordPress Executive",
        city: "Ludhiana",
        initials: "DB",
        quote:
          "Learning WordPress and SEO together made both make more sense. I understand why a site is built a certain way now, not just how.",
      },
      {
        name: "Navjot Kaur",
        role: "Freelance Web Consultant",
        city: "Jalandhar Cantt",
        initials: "NK",
        quote:
          "I run three client sites now on the side while working full-time. The weekend batch made that possible without quitting my job.",
      },
      {
        name: "Harmanpreet Singh",
        role: "Web Designer",
        city: "Nakodar",
        initials: "HS",
        quote:
          "The block-themes module was new to me and it turned out to be the direction WordPress itself is moving. Good to have learned it properly instead of picking it up later.",
      },
      {
        name: "Ritika Sharma",
        role: "Website Manager",
        city: "Kartarpur",
        initials: "RS",
        quote:
          "I handle our clinic's website content and forms now without waiting on an agency. The course paid for itself within two months.",
      },
    ],

    faqs: [
      {
        q: "How long is the WordPress course in Jalandhar?",
        a: "The course runs 14 weeks, roughly three and a half months, at one module per week. It covers domains and hosting through Gutenberg, Elementor Pro, WooCommerce, SEO and site handover, with progression based on deliverables rather than the calendar.",
      },
      {
        q: "What is the fee for a WordPress course in Jalandhar?",
        a: "Techcadd's WordPress course fee covers all fourteen modules, live project work and the internship letter. Counsellors share the current fee sheet and instalment options on request, and a demo class is free.",
      },
      {
        q: "Do I need coding knowledge to learn WordPress?",
        a: "No. The course starts at domains, hosting and DNS and assumes no prior technical background, so school leavers, non-technical graduates and business owners can all join.",
      },
      {
        q: "What jobs can I get after learning WordPress and WooCommerce?",
        a: "WordPress Developer, WooCommerce Developer, Website Manager, Web Content Executive and SEO Executive are the common roles, plus freelance site building. Agencies, coaching institutes, clinics and manufacturers across Jalandhar, Mohali and Ludhiana hire for these.",
      },
      {
        q: "Does Techcadd guarantee placement after the course?",
        a: "No institute can honestly guarantee a job, and Techcadd does not. What is provided is placement support — interview preparation, portfolio and resume review, and referrals through the placement cell.",
      },
      {
        q: "Which software and tools are taught in this WordPress course?",
        a: "WordPress, Gutenberg, Elementor Pro, WooCommerce, Rank Math, Screaming Frog, Google Search Console, GA4, Google Tag Manager, WP Rocket, Wordfence and Razorpay, among others. Hosting is operated through cPanel.",
      },
      {
        q: "Do I get a certificate and internship letter?",
        a: "Yes. Students who complete the capstone receive a course completion certificate and an internship letter covering the live client-grade build.",
      },
      {
        q: "Are weekend or evening batches available for working professionals?",
        a: "Yes, weekday, evening and weekend batches are offered so working professionals and college students can attend without leaving their job or classes. 1-on-1 training is also available for anyone who wants a fully personal schedule. Every class — batch or 1-on-1 — runs for 2 hours.",
      },
      {
        q: "Should I learn WordPress or digital marketing first?",
        a: "Learn WordPress first if you want to build and sell websites, and digital marketing first if you want to run advertising campaigns. This course includes the search side — keyword research, on-page, technical SEO and AI-search visibility — so it also serves as an entry point into SEO work.",
      },
      {
        q: "Is a WooCommerce store included in the course?",
        a: "Yes. You build a live WooCommerce store with a structured catalogue, working payments through Razorpay or PayU, GST settings and a completed test order, as part of Month 2.",
      },
    ],

    related: [
      "/courses/shopify",
      "/courses/seo",
      "/courses/digital-marketing",
      "/courses/google-ads",
      "/courses/social-media-marketing",
    ],
  },

  {
    slug: "seo",
    segment: "courses",
    eyebrow: "SEO",
    h1: "SEO Course in Jalandhar",
    title: "SEO Course in Jalandhar — Rank a Live Domain | Techcadd",
    description:
      "13-week SEO Course in Jalandhar — keyword research, on-page, technical SEO, Core Web Vitals, local SEO, link building and AI search visibility on a live domain you build and rank yourself. Internship letter and placement support at Techcadd.",
    keywords: [
      "seo course jalandhar",
      "seo training institute jalandhar",
      "search engine optimization course jalandhar",
      "seo course with placement jalandhar",
      "technical seo training jalandhar",
      "local seo course jalandhar",
      "seo course fees in jalandhar",
    ],
    intro:
      "Rank it. Prove it. Keep it. A 13-week course on one live domain — design the imagery, build the site in WordPress and Elementor, then rank it across on-page, technical, local, off-page and AI search.",
    facts: [
      { label: "Duration", value: "13 Weeks · 3 Months" },
      { label: "Mode", value: "Classroom, Weekend & 1-on-1" },
      { label: "Eligibility", value: "12th Pass Onward" },
      { label: "Includes", value: "Live Domain & Ranking Record" },
    ],

    overview: [
      "Techcadd's SEO Course in Jalandhar is a 13-week, 13-module programme covering keyword research, on-page, technical SEO, Core Web Vitals, local SEO, link building and AI search visibility. You build the site yourself in WordPress and Elementor, then rank it — leaving with dated ranking records and a full client audit pack, not a screenshot from a slide.",
      "Rankings move slowly, which is exactly why the course puts you on a live domain from Week 3 rather than handing you a finished case study at the end.",
    ],

    whoCanDo: {
      intro:
        "SEO starts at Module 01 with how search engines actually work, so no coding, design or marketing background is assumed. Your own site goes live in Week 3, and every technique after that is applied to something you own.",
      groups: [
        {
          title: "Students after 12th",
          body: "No coding, design or marketing background is required — crawling, indexing and ranking are explained from scratch. Your site is live from Week 3, so you are working on something real almost immediately.",
        },
        {
          title: "Graduates and final-year students",
          body: "SEO interviews test one thing: whether the rankings came from your work. By Week 13 you have a keyword matrix, a before-and-after position record with dates, a crawl report with fixes implemented and an outreach log with replies.",
        },
        {
          title: "Working professionals",
          body: "Evening and weekend batches let you keep the job. Many professionals start by auditing and fixing their own employer's website, which is usually the fastest internal promotion available.",
        },
        {
          title: "Business owners and freelancers",
          body: "A module covers Google Business Profile and the map pack — the highest-converting SEO service in the Indian market, and one you can deliver for a client without ever touching their website.",
        },
      ],
    },

    whyProgram: [
      "SEO is the only marketing skill where the work keeps paying after you stop. A ranked collection page, a claimed and optimised Google Business Profile and a page that AI answers cite keep returning visitors next year at no additional cost — that difference is the entire commercial argument.",
      "The local market buys map-pack rankings before it buys anything else. For a clinic, a gym or a coaching centre, appearing in the top three map results outperforms the website entirely, and a dedicated module covers profile optimisation, citations, review systems and geo-grid rank tracking end to end.",
      "Supervised live work beats free tutorials because SEO advice cannot be verified from a video — and you cannot tell which advice is outdated until six months of your own work has failed. Every module here ends in a graded deliverable a trainer reviews before you advance, on a live domain with real Search Console data.",
      "You are being trained for the version of this job that exists now. AI Overviews answer a share of queries without a click, Core Web Vitals made page experience measurable, and structure a machine can extract and quote is what still moves rankings — almost no competing institute in Punjab teaches the AI-search side yet.",
    ],

    whyTechcadd: {
      intro:
        "Sessions are run by people currently ranking sites for paying clients, which is why the course covers unglamorous things like redirect chains, indexing drops, listing suspensions and outreach that actually gets replies.",
      points: [
        {
          title: "Trainers who run live SEO engagements",
          body: "Real hosting, real Search Console data and dated ranking records from Week 3 — rankings move slowly, which is exactly why you need a live site from the start rather than a case study handed to you at the end.",
        },
        {
          title: "Thirteen graded deliverables, not thirteen lectures",
          body: "Every module ends in an artefact a trainer reviews before you advance — a keyword matrix, a crawl fix sheet, a Core Web Vitals score, a geo-grid screenshot, an outreach reply log.",
        },
        {
          title: "You rank your own domain, not a demo",
          body: "Most SEO candidates can describe a fix but cannot implement one. Carrying WordPress, Elementor and Photoshop alongside the search work is what makes a junior hire immediately useful.",
        },
        {
          title: "AEO and GEO are taught, not mentioned",
          body: "A full week covers visibility inside ChatGPT, Perplexity and Google AI Overviews with its own deliverable — a share-of-voice scorecard.",
        },
        {
          title: "Small batches",
          body: "Deliverable-based review only works if a trainer can properly review each submission, so batch sizes are kept small.",
        },
        {
          title: "Since 2007, trained across Punjab",
          body: "Techcadd runs skill-training programmes across Jalandhar, Ludhiana, Mukerian, Hoshiarpur, Phagwara, Bathinda, Amritsar, Patiala and Mohali.",
        },
      ],
    },

    learn: {
      intro:
        "The course moves from an empty domain to a ranked site you can prove you ranked. You start with how search engines actually work and how SEO is scoped and sold, then produce your own imagery in Photoshop and build a real site in WordPress and Elementor Pro rather than practising on someone else's. Month 2 is research and execution — keyword intent decides the architecture before the menu is built, on-page work fixes what is published, content briefs make publishing repeatable, and a crawl-driven technical audit fixes what sits underneath. Month 3 builds authority and evidence — Core Web Vitals engineered on a live build, a Google Business Profile ranked in the map pack with geo-grid proof, an outreach campaign with logged replies, pages structured so AI answers can cite them, and finally a full client audit, dashboard and reporting pack you defend in front of a panel.",
      modules: [
        {
          title: "How Search Works & the SEO Business Case",
          points: [
            "Crawling, indexing, rendering and ranking explained without jargon",
            "SERP features, the E-E-A-T framework and algorithm updates",
            "The business case — traffic value, cost per acquisition and an honest timeline",
          ],
        },
        {
          title: "Photoshop for Web Imagery & Content Creative",
          points: [
            "Background removal, retouching, composites and page banners",
            "Designing blog featured images, infographics and comparison graphics",
            "Exporting for the web — WebP, compression and alt text conventions",
          ],
        },
        {
          title: "Domains, Hosting & WordPress Foundations",
          points: [
            "Domains, DNS records, nameservers and hosting compared",
            "cPanel operations, SSL, staging and scheduled backups",
            "WordPress installation, permalink structure and the essential plugin stack",
          ],
        },
        {
          title: "Elementor Pro — Building Pages That Rank",
          points: [
            "Theme builder — headers, footers, single, archive and 404 templates",
            "Heading hierarchy inside a builder and why H1 discipline breaks there first",
            "Question-first headings, direct answer blocks, tables and FAQ sections",
          ],
        },
        {
          title: "Keyword Research, Intent & Site Architecture",
          points: [
            "Classifying informational, commercial, transactional and navigational intent",
            "Competitor keyword gap analysis, scoring by volume, difficulty and business value",
            "Mapping every keyword to a single URL and deriving site architecture",
          ],
        },
        {
          title: "On-Page SEO & Content Optimisation",
          points: [
            "Title tag formulas, meta descriptions, heading structure and image alt text",
            "Content depth, semantic coverage and featured snippet targeting",
            "E-E-A-T signals, internal linking and Rank Math configuration",
          ],
        },
        {
          title: "Content Writing, Briefs & Editorial Systems",
          points: [
            "Article structures — how-to, listicle, comparison, buying guide",
            "Writing content briefs a freelancer can execute unaided",
            "AI-assisted drafting held to a human editing standard",
          ],
        },
        {
          title: "Technical SEO, Schema & Site Health",
          points: [
            "Robots.txt, XML sitemaps, crawl budget and canonical rules",
            "Crawling a site in Screaming Frog and triaging the export into a fix sheet",
            "JSON-LD schema for Organization, LocalBusiness, Article, FAQ and Review",
          ],
        },
        {
          title: "Core Web Vitals & Performance Engineering",
          points: [
            "LCP, INP and CLS, and why field data differs from lab data",
            "Render-blocking CSS and JavaScript, critical CSS and font loading strategy",
            "Caching layers, CDN delivery and Elementor-specific performance traps",
          ],
        },
        {
          title: "Local SEO & Google Business Profile",
          points: [
            "How the map pack ranks — relevance, distance and prominence",
            "NAP consistency, citation building and review generation systems",
            "Local landing pages, LocalBusiness schema and geo-grid rank tracking",
          ],
        },
        {
          title: "Off-Page SEO, Digital PR & Link Acquisition",
          points: [
            "Evaluating a prospect on relevance, traffic and link profile",
            "Outreach templates, personalisation and follow-up cadence",
            "Anchor text distribution, toxic link identification and disavow",
          ],
        },
        {
          title: "AEO & GEO — Visibility Inside AI Search",
          points: [
            "How ChatGPT Search, Perplexity, Google AI Overviews and Gemini retrieve and cite sources",
            "Question-first structure, direct answer blocks and extractable formatting",
            "Entity consistency and measuring AI referral traffic in GA4",
          ],
        },
        {
          title: "Analytics, Audits, Reporting & Client Capstone",
          points: [
            "GA4 for organic search and Search Console query and indexing analysis",
            "Full audit methodology across technical, on-page, content, local and off-page",
            "Monthly reporting packs, proposals, retainers and GST invoicing",
          ],
        },
      ],
      tools: [
        "Google Keyword Planner",
        "Semrush",
        "Ahrefs",
        "Ubersuggest",
        "AlsoAsked",
        "Google Trends",
        "cPanel",
        "WordPress",
        "Elementor Pro",
        "Rank Math",
        "LiteSpeed Cache",
        "Adobe Photoshop",
        "Canva Pro",
        "Screaming Frog",
        "Google Search Console",
        "Rich Results Test",
        "PageSpeed Insights",
        "Lighthouse",
        "WP Rocket",
        "Cloudflare",
        "Google Business Profile",
        "geo-grid rank trackers",
        "ChatGPT",
        "Perplexity",
        "Gemini",
        "GA4",
        "Looker Studio",
      ],
    },

    outcomes: [
      {
        q: "What job roles open up after an SEO course?",
        a: "SEO Executive, Technical SEO Specialist, Local SEO Specialist, Content and Outreach Executive, Web Content Executive and freelance SEO consultant. Agencies in Jalandhar, Mohali, Ludhiana and Chandigarh hire for the first three directly.",
      },
      {
        q: "What can I earn, and how fast does it grow?",
        a: "Entry-level SEO roles in the Punjab market start modestly and move up as you can run technical audits and defend a reporting pack. Remote roles for Delhi, Bengaluru and overseas agencies pay noticeably more, and SEO is one of the most remote-friendly skills in marketing.",
      },
      {
        q: "Can I freelance or work remotely with this skill?",
        a: "Yes — SEO is delivered as reports, rankings and traffic, so location is irrelevant once you can evidence results. A Google Business Profile-only service is the easiest first sale, since it needs no website access at all.",
      },
      {
        q: "Which industries hire for this in Punjab?",
        a: "Clinics, diagnostic labs and dental practices, coaching institutes and immigration consultancies, real estate firms, gyms and hospitality, sports goods and leather exporters in Jalandhar, and the digital agencies serving all of them.",
      },
      {
        q: "Can I specialise further after this course?",
        a: "Yes. Natural next steps are technical SEO and performance, paid media, or full WordPress and WooCommerce development — this course already carries the build skills for the last of those.",
      },
    ],

    projects: [
      {
        title: "Live Site With a Complete Web Image Set",
        body: "A WordPress site on a real domain with SSL, clean permalinks, staging and backups, built out with five Elementor templates and correct heading structure, plus a ten-piece image set exported to web weight targets with alt text written.",
        tags: ["WordPress", "Elementor Pro"],
      },
      {
        title: "100-Keyword Matrix & Dated Ranking Record",
        body: "Keywords scored on intent, difficulty and business value, clustered into topics and mapped to URLs, then full on-page optimisation and three published articles with a before-and-after ranking record.",
        tags: ["Semrush", "Rank Math"],
      },
      {
        title: "Map Pack Build & Live Outreach Campaign",
        body: "A fully optimised Google Business Profile with fifteen citations, a live review flow and before-and-after geo-grid screenshots, plus an outreach campaign across fifty qualified prospects with a logged reply rate.",
        tags: ["Google Business Profile", "Ahrefs"],
      },
      {
        title: "Capstone — Complete Client Engagement Pack",
        body: "A full audit across technical, on-page, content, local and off-page with fixes implemented, an AI visibility scorecard, a Looker Studio dashboard and a reporting pack defended to a mock client panel.",
        tags: ["Screaming Frog", "Looker Studio"],
      },
    ],

    reviews: [
      {
        name: "Sourav Mehta",
        role: "SEO Executive",
        city: "Jalandhar",
        initials: "SM",
        quote:
          "The SEO module is the real thing — we ranked an actual client site, not a demo. My interviewer asked for proof and I just opened Search Console on my phone.",
      },
      {
        name: "Ishika Grover",
        role: "Technical SEO Specialist",
        city: "Phagwara",
        initials: "IG",
        quote:
          "Screaming Frog crawls and the fix sheets felt overwhelming in Week 8. By the capstone I could triage a site's technical audit on my own without hesitating.",
      },
      {
        name: "Yuvraj Sandhu",
        role: "Local SEO Specialist",
        city: "Kapurthala",
        initials: "YS",
        quote:
          "I now run Google Business Profile optimisation for three clinics as a side service. No website access needed, and it's the easiest thing I've ever sold.",
      },
      {
        name: "Mehak Chadha",
        role: "Content & Outreach Executive",
        city: "Hoshiarpur",
        initials: "MC",
        quote:
          "Outreach was the module I dreaded most and it turned out to be the most valuable. I actually got replies by the end of the fifty-prospect campaign.",
      },
      {
        name: "Karanveer Bajwa",
        role: "Freelance SEO Consultant",
        city: "Nakodar",
        initials: "KB",
        quote:
          "Building the site myself before ranking it changed how I think about SEO. I'm not guessing at fixes anymore, I know exactly what the developer needs to change.",
      },
      {
        name: "Priyanka Sethi",
        role: "SEO Analyst",
        city: "Jalandhar Cantt",
        initials: "PS",
        quote:
          "The AEO and GEO week was genuinely new to me and nobody else locally seems to teach it. Clients have already started asking about AI visibility by name.",
      },
      {
        name: "Tarun Vashisht",
        role: "SEO Executive",
        city: "Ludhiana",
        initials: "TV",
        quote:
          "I travelled from Ludhiana for the weekend batch. Watching a real ranking move over four weeks made the whole thing click in a way no video ever did.",
      },
    ],

    faqs: [
      {
        q: "How long is the SEO course in Jalandhar?",
        a: "The course runs 13 weeks, roughly three months, at one module per week. It covers how search engines work through keyword research, on-page, technical SEO, local SEO, link building, AI search visibility and client reporting.",
      },
      {
        q: "What is the fee for an SEO course in Jalandhar?",
        a: "Techcadd's SEO course fee covers all thirteen modules, live project work on your own domain and the capstone client engagement. Counsellors share the current fee sheet and instalment options on request.",
      },
      {
        q: "Do I need coding knowledge to learn SEO?",
        a: "No. SEO is diagnosis rather than programming, and this course starts at crawling, indexing and hosting basics with no assumed background. You will edit settings, plugins and page structure in WordPress and Elementor, but you will not write code.",
      },
      {
        q: "How long does SEO take to show results?",
        a: "Typically three to six months for meaningful ranking movement on a new site, though on-page fixes and a Google Business Profile can move within weeks. This course records before-and-after positions with dates precisely because rankings shift slowly.",
      },
      {
        q: "What jobs can I get after an SEO course?",
        a: "SEO Executive, Technical SEO Specialist, Local SEO Specialist, Content and Outreach Executive, and freelance SEO consultant. Your thirteen graded deliverables are what interviews actually assess.",
      },
      {
        q: "Does Techcadd guarantee placement after the SEO course?",
        a: "No institute can honestly guarantee a job, and Techcadd does not. What is provided is placement support — interview preparation, portfolio and resume review, and referrals through the placement cell.",
      },
      {
        q: "Which tools and software are taught in the SEO course?",
        a: "Semrush, Ahrefs, Google Keyword Planner, Google Search Console, Screaming Frog, Rank Math, PageSpeed Insights, WP Rocket, Google Business Profile, GA4 and Looker Studio. Sites are built in WordPress and Elementor Pro.",
      },
      {
        q: "Is SEO still worth learning with AI answers taking over search?",
        a: "Yes, but the work has changed — a growing share of queries now ends in an AI answer that cites a handful of sources, so the goal is being one of those cited sources. A dedicated module covers answer engine and generative engine optimisation.",
      },
      {
        q: "Are weekend or evening batches available?",
        a: "Yes, weekday, evening and weekend batches are offered so working professionals and college students can attend without leaving their job or classes. 1-on-1 training is also available for anyone who wants a fully personal schedule. Every class — batch or 1-on-1 — runs for 2 hours.",
      },
    ],

    related: [
      "/courses/wordpress",
      "/courses/google-ads",
      "/courses/digital-marketing",
      "/courses/social-media-marketing",
      "/courses/shopify",
    ],
  },

  {
    slug: "google-ads",
    segment: "courses",
    eyebrow: "Google Ads",
    h1: "Google Ads Course in Jalandhar",
    title: "Google Ads Course in Jalandhar — Live Ad Budget | Techcadd",
    description:
      "9-week Google Ads Course in Jalandhar — the auction, Photoshop ad creative, keyword research, account architecture, conversion tracking, Search, Shopping, Display, YouTube and Performance Max, spent on a real advertising budget. Placement support at Techcadd.",
    keywords: [
      "google ads course jalandhar",
      "ppc training institute jalandhar",
      "google ads certification course jalandhar",
      "performance marketing course jalandhar",
      "google ads course with placement jalandhar",
      "ppc course fees in jalandhar",
    ],
    intro:
      "Buy the right clicks, prove the result. A nine-week course from the auction to a managed account, spending a real budget across Search, Shopping, Display, YouTube and Performance Max.",
    facts: [
      { label: "Duration", value: "9 Weeks · 2 Months" },
      { label: "Mode", value: "Classroom, Weekend & 1-on-1" },
      { label: "Eligibility", value: "12th Pass Onward" },
      { label: "Includes", value: "Live Ad Budget" },
    ],

    overview: [
      "Techcadd's Google Ads Course in Jalandhar is a nine-week, nine-module programme covering the auction, Photoshop ad creative, keyword research, account architecture, conversion tracking, Search, Shopping, Display, YouTube and Performance Max. You spend a real advertising budget from Module 06, then leave with a structured account, a documented audit and a defended client report.",
      "Nothing launches until the creative exists, the keywords are researched, the account is structured and the tracking is verified — the same order a competent agency works in.",
    ],

    whoCanDo: {
      intro:
        "Google Ads starts at Module 01 with the auction and campaign arithmetic taught from scratch, so no marketing or design background is assumed. From Module 06 every session runs on a live account with a real advertising budget.",
      groups: [
        {
          title: "Students after 12th",
          body: "No marketing or design background is required — the auction, Quality Score and campaign arithmetic are taught from scratch. Google Ads is a numbers job more than a creative one, so commerce and science students often take to it fastest.",
        },
        {
          title: "Graduates and final-year students",
          body: "PPC interviews test whether you can build an account, launch it and read the numbers without supervision. By Week 9 you have an account built in Google Ads Editor, verified conversion tracking and live Search, Shopping and YouTube campaigns.",
        },
        {
          title: "Working professionals",
          body: "Evening and weekend batches let you keep your job while making the fastest route into performance marketing, which is where the salaries in this field sit. Many professionals start by auditing their own company's account.",
        },
        {
          title: "Business owners and freelancers",
          body: "Coaching institutes, immigration consultancies, clinics and showrooms across Jalandhar are spending monthly on Google Ads without a negative keyword list or verified conversion tracking. This course teaches you to run that account properly, in-house or as a retainer.",
        },
      ],
    },

    whyProgram: [
      "Google Ads captures demand that already exists, which is why businesses keep paying for it. Someone typing a high-intent local search has already told you what they want before you spend a rupee — it is the highest-intent channel in advertising, which makes competent account management directly billable from your first month.",
      "Punjab has an unusually heavy Google Ads market. Immigration and IELTS consultancies, coaching institutes, real estate developers, clinics and hospitality across Jalandhar, Ludhiana, Mohali and Chandigarh compete on search every day, and most of the accounts local agencies inherit are badly built.",
      "Supervised live work beats free tutorials because mistakes here cost money, not time. A match type error, a missing negative list or a conversion action counted twice spends a real budget on queries that were never going to convert — and from Module 06 the account runs on live money with cost per conversion recorded before and after.",
      "The job has narrowed to exactly what automation cannot do. Smart bidding sets the bids, broad match chooses many of the queries and Performance Max chooses the network — what is left to a specialist is deciding what counts as a conversion, feeding the system clean measurement, writing the offer and auditing where the money went. These nine modules are built around that remaining job.",
    ],

    whyTechcadd: {
      intro:
        "Sessions are run by people currently managing live accounts, which is why the course covers disapprovals, restricted accounts, rising CPMs, wasted spend and conversion actions that never fired — the things that actually decide whether an account survives.",
      points: [
        {
          title: "Trainers who spend real budgets every week",
          body: "The examples in class are from accounts being managed this quarter, not a five-year-old case study.",
        },
        {
          title: "Nine graded deliverables, not nine lectures",
          body: "Every module ends in an artefact a trainer reviews before you advance — a break-even model, a banner set, a keyword file, an Editor-built account, a verified tracking container, an optimisation log.",
        },
        {
          title: "You spend real money from Month 2",
          body: "Campaigns run on live budget with cost per conversion recorded before and after. No amount of classroom theory teaches what a rising cost per acquisition feels like when it is your own money in the account.",
        },
        {
          title: "Nothing launches before it should",
          body: "Creative, keywords, account structure and verified tracking all come before the first campaign goes live — the same sequence a competent agency follows.",
        },
        {
          title: "You produce the ad creative as well as run the account",
          body: "Most Google Ads candidates cannot build a banner set or a thumbnail, and most designers cannot build a campaign. Carrying both makes a junior hire immediately useful.",
        },
        {
          title: "Since 2007, trained across Punjab",
          body: "Techcadd runs skill-training programmes across Jalandhar, Ludhiana, Mukerian, Hoshiarpur, Phagwara, Bathinda, Amritsar, Patiala and Mohali.",
        },
      ],
    },

    learn: {
      intro:
        "The course runs in the order a competent agency actually works, which is not the order most people learn in. You start with the arithmetic — the auction, Quality Score and a break-even model — because a campaign that cannot pay for itself on paper will not pay for itself in the auction. Then you produce the creative yourself in Photoshop, since Display, Demand Gen and Performance Max consume image assets continuously. Next comes keyword research and intent, then the account architecture, match types and negative lists that determine how much control you will have later. Only then does anything launch: conversion tracking is installed and verified first, because smart bidding optimises towards whatever your tracking tells it. From Module 06 you run live Search campaigns on real budget, add Display, remarketing and YouTube using your own creative, build a Merchant Center feed with Shopping and Performance Max, and finish with a two-week optimisation log, a full account audit, a dashboard and a client report you defend in front of a panel.",
      modules: [
        {
          title: "Search Advertising Foundations & Campaign Maths",
          points: [
            "The auction, Ad Rank and Quality Score components",
            "The metric chain — CPM, CPC, CTR, CPA, ROAS and break-even ROAS",
            "Reverse-engineering a revenue target into required clicks and daily spend",
          ],
        },
        {
          title: "Ad Creative Production with Adobe Photoshop",
          points: [
            "Background removal, product retouching and non-destructive workflow",
            "Building a display banner set across every standard size",
            "Merchant Center image policy and YouTube thumbnails",
          ],
        },
        {
          title: "Keyword Research & Search Intent",
          points: [
            "Classifying informational, commercial, transactional and navigational intent",
            "Keyword Planner forecasts — volume, competition and bid estimates",
            "Building negative keyword lists before launch, not after",
          ],
        },
        {
          title: "Account Architecture, Match Types & Negatives",
          points: [
            "Structuring campaigns by intent, margin, geography and budget control",
            "Match types and the search terms report mining cadence",
            "Bulk building and quality-checking an account in Google Ads Editor",
          ],
        },
        {
          title: "Conversion Tracking — GTM, GA4 & Google Ads",
          points: [
            "Google Tag Manager containers, tags, triggers and the preview/debug workflow",
            "Tracking form submissions, calls, WhatsApp clicks and purchases",
            "GA4 key events and a Looker Studio dashboard",
          ],
        },
        {
          title: "Search Campaigns — Responsive Ads, Assets & Bidding",
          points: [
            "Responsive search ads — headline strategy, pinning and asset strength",
            "The full asset suite — sitelinks, callouts, structured snippets, call and lead form",
            "Bidding strategies and a fourteen-day optimisation log",
          ],
        },
        {
          title: "Display, Remarketing & YouTube Advertising",
          points: [
            "Display targeting by audience, topic and placement",
            "The remarketing tag, audience lists and dynamic remarketing basics",
            "YouTube campaign types — in-stream, in-feed, bumper and Shorts",
          ],
        },
        {
          title: "Shopping, Merchant Center & Performance Max",
          points: [
            "Merchant Center setup, product feeds and required attributes",
            "Feed rules, disapproval troubleshooting and Shopping campaign structure",
            "Performance Max — asset groups, audience signals and search themes",
          ],
        },
        {
          title: "Optimisation, Scaling & Client Reporting — Capstone",
          points: [
            "The weekly optimisation routine across search terms, negatives, bids and budgets",
            "Diagnosing rising cost per acquisition and falling impression share",
            "Account audit methodology, monthly reporting, proposals and GST invoicing",
          ],
        },
      ],
      tools: [
        "Google Ads",
        "Google Ads Editor",
        "Google Merchant Center",
        "YouTube Studio",
        "Google Keyword Planner",
        "Semrush",
        "Ahrefs",
        "Google Trends",
        "Ads Transparency Center",
        "Adobe Photoshop",
        "Canva Pro",
        "Google Web Designer",
        "Google Tag Manager",
        "GA4",
        "Tag Assistant",
        "Microsoft Clarity",
        "Looker Studio",
        "Google Sheets",
      ],
    },

    outcomes: [
      {
        q: "What job roles open up after a Google Ads course?",
        a: "Google Ads Executive, PPC Executive, Search Specialist, E-commerce PPC Executive, Performance Marketing Executive, and freelance Google Ads consultant. Agencies in Jalandhar, Mohali, Ludhiana and Chandigarh hire for these directly.",
      },
      {
        q: "What can I earn, and how fast does it grow?",
        a: "Entry-level Google Ads and PPC roles in the Punjab market move up as you can manage budgets independently and defend a reporting pack. Performance marketing sits at the upper end of digital marketing salaries because results are directly measurable.",
      },
      {
        q: "Can I freelance or work remotely with this skill?",
        a: "Yes — account access is granted remotely, so location is irrelevant. An account audit is the standard way to win the first client, and a dedicated module covers proposals, pricing and retainers.",
      },
      {
        q: "Which industries hire for this in Punjab?",
        a: "Immigration and IELTS consultancies, coaching institutes, real estate developers, clinics and dental practices, hotels and hospitality, and exporters running B2B search — immigration and education are among the region's heaviest search spenders.",
      },
      {
        q: "Can I specialise further after this course?",
        a: "Yes. Natural next steps are Meta Ads and social media marketing for the paid social side, SEO for organic search, or Shopify if you want to own the store behind Shopping campaigns.",
      },
    ],

    projects: [
      {
        title: "Break-Even Model & Full Creative Pack",
        body: "A calculator turning budget, CPC and conversion rate into CPA, ROAS and required daily spend for a real business, plus a display banner set, a responsive display asset kit and three YouTube thumbnails to Google's published specifications.",
        tags: ["Google Sheets", "Adobe Photoshop"],
      },
      {
        title: "300-Keyword Research File & Editor-Built Account",
        body: "Keywords clustered into ad groups with intent, cost and business value scored, plus a pre-launch negative list, then a complete account built in Google Ads Editor and quality-checked before any spend.",
        tags: ["Keyword Planner", "Google Ads Editor"],
      },
      {
        title: "Measurement Stack & Live Search Campaigns",
        body: "A published GTM container with five verified conversion actions and a shared Looker Studio dashboard, then live Search campaigns with three responsive search ads per ad group and a fourteen-day optimisation log.",
        tags: ["Google Tag Manager", "Google Ads"],
      },
      {
        title: "Capstone — Account Audit & Client Report",
        body: "Remarketing, Display, YouTube, an approved Merchant Center feed and a Performance Max build, then two weeks on live budget with before-and-after cost per conversion and a client report defended to a mock panel.",
        tags: ["Merchant Center", "Looker Studio"],
      },
    ],

    reviews: [
      {
        name: "Abhinav Kalra",
        role: "PPC Executive",
        city: "Jalandhar",
        initials: "AK",
        quote:
          "I travelled from Ludhiana for the weekend batch and it was worth every trip. Real ad spend, real mistakes, real corrections — YouTube does not give you that.",
      },
      {
        name: "Gurleen Kaur",
        role: "Google Ads Executive",
        city: "Kapurthala",
        initials: "GK",
        quote:
          "Building the negative keyword list before launch felt tedious in class. Then I watched wasted spend disappear on the live account and understood exactly why it mattered.",
      },
      {
        name: "Manav Chawla",
        role: "Performance Marketing Executive",
        city: "Phagwara",
        initials: "MC",
        quote:
          "The break-even model in Module 01 is what I still use before pitching any client budget. Everything after it made a lot more sense once that number was real.",
      },
      {
        name: "Sanya Kohli",
        role: "E-commerce PPC Executive",
        city: "Hoshiarpur",
        initials: "SK",
        quote:
          "Our Merchant Center feed kept getting disapproved in practice. Fixing it myself for the capstone taught me more than any lecture could have.",
      },
      {
        name: "Ravneet Bhatia",
        role: "Freelance Google Ads Consultant",
        city: "Nakodar",
        initials: "RB",
        quote:
          "I now audit accounts for two immigration consultancies as freelance work. The audit methodology from Module 09 is literally what I show clients to win the account.",
      },
      {
        name: "Ojasvi Anand",
        role: "Search Specialist",
        city: "Jalandhar Cantt",
        initials: "OA",
        quote:
          "Spending real money on a live campaign changes how seriously you take a match type mistake. I never forgot a lesson learned with actual budget on the line.",
      },
    ],

    faqs: [
      {
        q: "How long is the Google Ads course in Jalandhar?",
        a: "The course runs nine weeks, roughly two months, at one module per week. Month 1 covers the auction, Photoshop ad creative, keyword research and account architecture; Month 2 covers tracking, Search, Display, YouTube, Shopping, Performance Max and a client-reporting capstone.",
      },
      {
        q: "What is the fee for a Google Ads course in Jalandhar?",
        a: "Techcadd's Google Ads course fee covers the full nine-week programme. Counsellors share the current fee sheet and instalment options on request.",
      },
      {
        q: "How much ad budget do I need during the course?",
        a: "A small live advertising spend runs from Module 06 to Module 09. The amount is kept deliberately low because the objective is learning optimisation on real data rather than scaling spend — confirm the current recommended figure with a counsellor.",
      },
      {
        q: "Do I need marketing experience to learn Google Ads?",
        a: "No. Module 01 teaches the auction, Quality Score and campaign arithmetic from the ground up, and the course assumes no marketing, design or technical background.",
      },
      {
        q: "What jobs can I get after a Google Ads course?",
        a: "Google Ads Executive, PPC Executive, Search Specialist, E-commerce PPC Executive and Performance Marketing Executive, plus freelance account management.",
      },
      {
        q: "Does Techcadd guarantee placement after the Google Ads course?",
        a: "No institute can honestly guarantee a job, and Techcadd does not. What is provided is placement support — interview preparation, portfolio and resume review, and referrals through the placement cell.",
      },
      {
        q: "Which tools and software are taught in the Google Ads course?",
        a: "Google Ads, Google Ads Editor, Google Merchant Center, Google Keyword Planner, Google Tag Manager, GA4, Looker Studio and YouTube Studio. Ad creative is produced in Adobe Photoshop and Canva Pro.",
      },
      {
        q: "Should I learn Google Ads or Meta Ads first?",
        a: "Learn Google Ads first if your target businesses sell something people actively search for — coaching, immigration services, clinics, property. Learn Meta Ads first if the product needs to be discovered rather than searched.",
      },
      {
        q: "Are weekend or evening batches available for working professionals?",
        a: "Yes, weekday, evening and weekend batches are offered so working professionals and college students can attend without leaving their job or classes. 1-on-1 training is also available for anyone who wants a fully personal schedule. Every class — batch or 1-on-1 — runs for 2 hours.",
      },
    ],

    related: [
      "/courses/social-media-marketing",
      "/courses/seo",
      "/courses/digital-marketing",
      "/courses/shopify",
      "/courses/wordpress",
    ],
  },

  {
    slug: "social-media-marketing",
    segment: "courses",
    eyebrow: "Social Media Marketing",
    h1: "Social Media Marketing Course in Jalandhar",
    title:
      "Social Media Marketing Course in Jalandhar — Content & Meta Ads | Techcadd",
    description:
      "17-week Social Media Marketing Course in Jalandhar covering design, video editing, shooting, scripting, UGC production and Meta Ads on a live budget. Two tracks, one placement-focused programme at Techcadd.",
    keywords: [
      "social media marketing course jalandhar",
      "social media marketing training institute jalandhar",
      "content creation course jalandhar",
      "meta ads course jalandhar",
      "reels editing course jalandhar",
      "ugc creator course jalandhar",
      "social media marketing course fees in jalandhar",
    ],
    intro:
      "Make it, post it, then put money behind it. A four-month, 17-module programme in content creation and Meta Ads — design, shoot, edit and script your own work, then run paid campaigns on a live budget.",
    facts: [
      { label: "Duration", value: "17 Weeks · 4 Months" },
      { label: "Mode", value: "Classroom, Weekend & 1-on-1" },
      { label: "Eligibility", value: "12th Pass Onward" },
      { label: "Includes", value: "Live Meta Ad Budget" },
    ],

    overview: [
      "Techcadd's Social Media Marketing Course in Jalandhar is a four-month, 17-module programme in content creation and Meta Ads. You learn design, video editing, shooting, scripting, UGC production and analytics across Track One, then run paid campaigns on a live budget in Track Two.",
      "It suits students, creators, working professionals and business owners with no prior design or marketing background — the design and Canva work starts from absolute zero in Module 01, and Track Two advertises the exact content Track One taught you to produce.",
    ],

    whoCanDo: {
      intro:
        "The course starts at Module 01 with design fundamentals and Canva from scratch, so no design, video or marketing background is assumed. This is one of the few Techcadd courses where you can start earning during the course — UGC brands buy creative volume, not follower counts.",
      groups: [
        {
          title: "Students after 12th",
          body: "No design, video or marketing background is needed — Module 01 starts with design fundamentals and Canva from scratch. UGC brands buy creative volume rather than follower counts, so a student with a few good product videos and a rate card can bill from Month 3.",
        },
        {
          title: "Graduates and final-year students",
          body: "Agencies hire on output, not marks. By Week 17 you have a design set, edited videos, a thirty-day content calendar executed live, a UGC pack with a media kit and Meta campaigns you personally ran on real budget.",
        },
        {
          title: "Working professionals",
          body: "Evening and weekend batches let you keep the job. Track Two — Business Manager, pixel, tracking, campaign builds and optimisation — is where salaried performance marketing roles sit, and it is only four weeks of the programme.",
        },
        {
          title: "Business owners, creators and freelancers",
          body: "Salons, gyms, restaurants, clinics and coaching centres across Jalandhar are all posting inconsistently and boosting posts without tracking. This course replaces both habits with a content system and a properly structured ad account you run yourself.",
        },
      ],
    },

    whyProgram: [
      "Creative production is now the job, because the platforms automated everything else. Meta chooses who sees an ad, at what price, in which placement — what it has not automated is the idea, the shoot and the edit, which is why this programme spends three months on making content before it spends one on spending money.",
      "UGC is the fastest paid work available in this field, and it does not need an audience. Brands buy creative volume rather than follower counts, which is why a creator with no following can bill from the first month, provided they have a media kit, a rate card and a demonstrated outreach habit.",
      "Supervised live work beats free tutorials because of the feedback loop, not the information. What is not free is someone telling you your hook is dead by second two, your audio is unusable, or your campaign is optimising towards an event that never fired. Every module here ends in a graded deliverable published on live accounts and run on real ad budgets.",
      "Two hiring markets open, not one. Jalandhar and Ludhiana agencies hire creators, video editors and social media executives; brands and performance agencies hire media buyers who can also produce the creative. Very few candidates carry both, which is exactly what finishing both tracks gives you.",
    ],

    whyTechcadd: {
      intro:
        "Sessions are run by people currently shooting, editing and buying media for clients, which is why the course covers unusable audio, dead hooks, creative fatigue and events that never fired — the things that actually decide whether content works.",
      points: [
        {
          title: "Trainers who produce content and spend real budgets",
          body: "Working examples come from live accounts, not a slide deck of screenshots from years ago.",
        },
        {
          title: "Seventeen graded deliverables, not seventeen lectures",
          body: "Every module ends in an artefact a trainer reviews before you advance — a design set, a footage bank, a script and hook bank, a UGC pack, an optimisation log.",
        },
        {
          title: "You publish on live accounts and spend a real ad budget",
          body: "The thirty-day calendar is executed live, and Track Two campaigns run on real money with cost per result recorded before and after. Nothing here is a mock-up.",
        },
        {
          title: "Creative and paid media in one programme",
          body: "Most candidates carry one or the other. Producing the creative and running the account that spends behind it is a combination agencies struggle to hire.",
        },
        {
          title: "You can start earning during the course",
          body: "A dedicated module builds the media kit, rate card and outreach habit that make UGC work possible without an audience, deliberately placed in Month 3 so you have a portfolio before the course ends.",
        },
        {
          title: "Since 2007, trained across Punjab",
          body: "Techcadd runs skill-training programmes across Jalandhar, Ludhiana, Mukerian, Hoshiarpur, Phagwara, Bathinda, Amritsar, Patiala and Mohali.",
        },
      ],
    },

    learn: {
      intro:
        "The course runs from 'I have never opened Canva' to 'I run this brand's content and its ad account.' You start with design fundamentals and Photoshop, then learn Premiere Pro before ever picking up a camera — because editing is the bottleneck in every content team. Mobile videography and shooting discipline come next, since most creators are limited by their footage rather than their edit. From there the work becomes strategic — niche research and an AI workflow, audience personas and content pillars, a thirty-day calendar, scriptwriting and hook banks, on-camera performance and shoot planning. Month 3 turns it commercial — UGC production with a media kit and logged brand outreach, brand campaigns delivered against a real client workflow, and analytics that decide what to make next from data rather than taste. Month 4 is Track Two — Business Manager and policy, pixel and event tracking, audiences and funnels, campaign builds with your own creative, then optimisation, scaling and a client report. The final week takes one brand through all of it end to end.",
      modules: [
        {
          title: "Design Foundations & Canva Production",
          points: [
            "Visual hierarchy, contrast, whitespace and typography pairing",
            "Canva in production — brand kits, template systems and magic resize",
            "Social posts, Instagram carousels, story sets, Reel covers and thumbnails",
          ],
        },
        {
          title: "Adobe Photoshop for Commercial Creative",
          points: [
            "Layers, masking, selection tools and background removal",
            "Photo retouching, colour correction and product editing",
            "Product advertisements and social creatives with web export",
          ],
        },
        {
          title: "Premiere Pro — Editing for Social Video",
          points: [
            "Sequences, cutting, trimming, ripple and roll edits",
            "Text, titles, burned-in captions and audio levelling",
            "Export presets for Reels, Shorts, feed and YouTube",
          ],
        },
        {
          title: "Mobile Videography & Shooting Discipline",
          points: [
            "Smartphone camera control — resolution, frame rate, exposure and focus lock",
            "Lighting setups and audio capture with lavalier and shotgun microphones",
            "Batch shoot day methodology and an edit-ready handover",
          ],
        },
        {
          title: "Video Formats, AI Video & Platform Delivery",
          points: [
            "Format fit across Reels, YouTube Shorts and feed",
            "Retention curve design and pattern interrupts",
            "AI-generated video with Google Flow and equivalent tools",
          ],
        },
        {
          title: "Niche Research, Trends & the AI Workflow",
          points: [
            "Validating a niche on demand, competition and content sustainability",
            "Google Trends, Pinterest Trends and Reddit as research tools",
            "AI for topic ideas, hooks, scripts and captions, with fact-checking",
          ],
        },
        {
          title: "Audience, Content Pillars & the Calendar",
          points: [
            "Building an audience persona from evidence rather than assumption",
            "Content pillars — educational, entertaining, inspirational, promotional",
            "Thirty-day calendars, posting cadence and bio optimisation",
          ],
        },
        {
          title: "Scriptwriting, Hooks & Storytelling",
          points: [
            "Script structures — educational, storytelling, listicle, UGC",
            "The first three seconds — curiosity, problem, question and story hooks",
            "Writing at volume from a hook bank",
          ],
        },
        {
          title: "On-Camera Performance & Shoot Planning",
          points: [
            "Camera confidence, voice modulation and pace",
            "Script to shot list to storyboard to shoot",
            "Wardrobe, location and set planning for a batch shoot day",
          ],
        },
        {
          title: "UGC Production & Winning Brand Work",
          points: [
            "UGC formats — demonstration, testimonial, review and lifestyle",
            "Usage rights, deliverable counts and revision limits",
            "Pricing, rate cards, media kits and brand outreach",
          ],
        },
        {
          title: "Brand Campaigns & Client Delivery Workflow",
          points: [
            "Product campaigns, promotional Reels and product photography for social",
            "The client workflow — brief, concept, script, approval, shoot, edit, revision",
            "Scheduling, approval and community management",
          ],
        },
        {
          title: "Content Analytics & the Creator Portfolio",
          points: [
            "Instagram Insights and YouTube Analytics",
            "Deciding what to repeat, improve or stop",
            "Assembling a creator portfolio from design, video, UGC and strategy work",
          ],
        },
        {
          title: "Meta Ads Foundation — Business Manager & Policy",
          points: [
            "Facebook Page and Instagram professional account setup",
            "Business Manager, roles, permissions and account security",
            "Campaign, ad set and ad structure, and advertising policies",
          ],
        },
        {
          title: "Tracking & Audiences — Pixel, Events & Funnels",
          points: [
            "Installing the Meta Pixel, standard and custom events",
            "Conversions API basics and domain verification",
            "Custom audiences, lookalikes, exclusions and funnel mapping",
          ],
        },
        {
          title: "Campaign Build, Ad Formats & Paid Creative",
          points: [
            "Choosing the objective — traffic, engagement, leads, sales, catalogue sales",
            "Budgets, bid strategies and instant-form lead delivery",
            "Ad formats — image, video, carousel, collection, Reels and Stories",
          ],
        },
        {
          title: "Optimisation, Scaling & Client Reporting",
          points: [
            "Reading CPM, CPC, CTR, frequency and cost per result",
            "The learning phase, A/B testing and creative fatigue diagnosis",
            "Scaling rules, account audits and client reporting dashboards",
          ],
        },
        {
          title: "Capstone — One Brand, End to End",
          points: [
            "Research and strategy, a month of content designed and shot by you",
            "A paid campaign built and optimised on live budget",
            "Building the case study and pricing your services",
          ],
        },
      ],
      tools: [
        "Canva Pro",
        "Adobe Photoshop",
        "Adobe Premiere Pro",
        "CapCut",
        "smartphone camera",
        "lavalier microphone",
        "ring light / softbox",
        "Google Flow",
        "Google Trends",
        "Pinterest Trends",
        "ChatGPT",
        "Gemini",
        "Notion",
        "Meta Business Suite",
        "Instagram Insights",
        "YouTube Studio",
        "Meta Ads Manager",
        "Events Manager",
        "Meta Pixel",
        "Looker Studio",
      ],
    },

    outcomes: [
      {
        q: "What job roles open up after a social media marketing course?",
        a: "Content Creator, UGC Creator, Video Editor, Social Media Executive, Social Media Manager and Meta Ads or Performance Executive. Agencies in Jalandhar and Ludhiana hire creators and editors constantly; brands and performance agencies hire media buyers.",
      },
      {
        q: "What can I earn, and how fast does it grow?",
        a: "Entry-level social media executive roles start modestly, with video editors slightly higher and Meta Ads or performance roles moving up within two to three years. UGC is paid per video rather than monthly, so it scales with output instead of tenure.",
      },
      {
        q: "Can I freelance or work remotely with this skill?",
        a: "Yes, and this is one of the most freelance-friendly skills of the lot — UGC videos are delivered as files, so brands anywhere can hire you. A dedicated module covers rate cards, proposals and retainers.",
      },
      {
        q: "Which industries hire for this in Punjab?",
        a: "Salons, gyms, restaurants and cafés, clinics and dental practices, coaching institutes and immigration consultancies, real estate firms, boutiques and D2C apparel brands, plus the digital agencies serving all of them.",
      },
      {
        q: "Can I specialise further after this course?",
        a: "Yes. The natural next steps are Google Ads for search and shopping traffic, SEO for organic visibility, or Shopify if you want to run the store behind the content.",
      },
    ],

    projects: [
      {
        title: "Brand Design Set & Commercial Creative",
        body: "A ten-piece Canva set for one brand with a reusable template kit — carousel, story set, Reel covers, thumbnails and poster — plus five retouched commercial creatives including a product advertisement built in Photoshop.",
        tags: ["Canva Pro", "Adobe Photoshop"],
      },
      {
        title: "Five-Format Video Set From Your Own Footage",
        body: "A self-shot footage bank covering talking-head, product and B-roll with a written lighting and audio setup sheet, edited into five short-form videos across five formats including one AI-generated cut.",
        tags: ["Premiere Pro", "CapCut"],
      },
      {
        title: "UGC Pack, Media Kit & a Live Brand Campaign",
        body: "Three UGC videos with a media kit, rate card and twenty logged brand approaches with replies recorded, plus one product campaign delivered against a written brief with concept, script, shoot, edit and a revision round.",
        tags: ["Instagram", "Meta Business Suite"],
      },
      {
        title: "Capstone — One Brand, End to End",
        body: "Strategy and a thirty-day calendar, a month of content you designed and shot, a live Meta campaign optimised on real budget, and a results report defended to a mock client panel.",
        tags: ["Meta Ads Manager", "Instagram Insights"],
      },
    ],

    reviews: [
      {
        name: "Zara Kapoor",
        role: "UGC Creator",
        city: "Jalandhar",
        initials: "ZK",
        quote:
          "I started pitching brands with my three UGC videos before the course even ended. No following, just a rate card and the outreach habit we built in Module 10.",
      },
      {
        name: "Dhruv Malhotra",
        role: "Video Editor",
        city: "Phagwara",
        initials: "DM",
        quote:
          "Premiere Pro was intimidating in Week 3. By the capstone I could turn a shoot into five publishable cuts in a single day.",
      },
      {
        name: "Anahita Sood",
        role: "Social Media Executive",
        city: "Kapurthala",
        initials: "AS",
        quote:
          "The thirty-day content calendar we built for a real account is what got me hired — my interviewer asked to see it before asking anything else.",
      },
      {
        name: "Kabir Ahluwalia",
        role: "Meta Ads Executive",
        city: "Hoshiarpur",
        initials: "KA",
        quote:
          "Running a live campaign in Track Two on real budget was nerve-wracking the first week. Watching cost per result actually come down by the optimisation log was the payoff.",
      },
      {
        name: "Ishita Bakshi",
        role: "Content Creator",
        city: "Nakodar",
        initials: "IB",
        quote:
          "I never thought I'd be comfortable on camera. The on-camera module and reviewing my own footage each day fixed that faster than I expected.",
      },
      {
        name: "Rehan Qureshi",
        role: "Social Media Manager",
        city: "Ludhiana",
        initials: "RQ",
        quote:
          "Doing content and Meta Ads together, not separately, is the actual advantage. I can shoot the ad and also run the account it spends from.",
      },
    ],

    faqs: [
      {
        q: "How long is the social media marketing course in Jalandhar?",
        a: "The course runs 17 weeks, roughly four months, at one module per week. Months 1 to 3 cover content creation — design, video, shooting, scripting, UGC and analytics — and Month 4 covers Meta Ads, ending with a one-brand capstone.",
      },
      {
        q: "What is the fee for a social media marketing course in Jalandhar?",
        a: "Techcadd's social media marketing course fee covers the full four-month programme. Counsellors share the current fee sheet and instalment options on request.",
      },
      {
        q: "Do I need a good camera or laptop for this course?",
        a: "A smartphone is enough for all shooting modules — camera control, lighting and audio are taught on a phone specifically. A laptop capable of running Adobe Premiere Pro and Photoshop is needed for the editing and design modules.",
      },
      {
        q: "Can I earn during the course as a UGC creator?",
        a: "Yes, that is deliberate — UGC brands buy creative volume, not follower counts, so you can be hired with no audience. A dedicated module builds three UGC videos, a media kit, a rate card and twenty logged brand approaches.",
      },
      {
        q: "What jobs can I get after a social media marketing course?",
        a: "Content Creator, UGC Creator, Video Editor, Social Media Executive, Social Media Manager and Meta Ads or Performance Executive. Your seventeen graded deliverables are what interviews assess.",
      },
      {
        q: "Does Techcadd guarantee placement after this course?",
        a: "No institute can honestly guarantee a job, and Techcadd does not. What is provided is placement support — interview preparation, portfolio and resume review, and referrals through the placement cell.",
      },
      {
        q: "Which tools and software are taught in this course?",
        a: "Canva Pro, Adobe Photoshop, Adobe Premiere Pro, CapCut, Meta Business Suite, Meta Ads Manager, Events Manager, Instagram Insights, YouTube Studio, Google Trends and ChatGPT.",
      },
      {
        q: "Is this course only about Instagram, or does it cover other platforms?",
        a: "It covers Instagram, Facebook, YouTube and LinkedIn for organic content, with format-specific delivery for Reels, Shorts and feed. The paid side is Meta only, because that is where most Indian small business ad budgets go.",
      },
      {
        q: "Are weekend or evening batches available for working professionals?",
        a: "Yes, weekday, evening and weekend batches are offered so working professionals and college students can attend without leaving their job or classes. 1-on-1 training is also available for anyone who wants a fully personal schedule. Every class — batch or 1-on-1 — runs for 2 hours.",
      },
    ],

    related: [
      "/courses/google-ads",
      "/courses/digital-marketing",
      "/courses/seo",
      "/courses/shopify",
      "/courses/wordpress",
    ],
  },

  {
    slug: "shopify",
    segment: "courses",
    eyebrow: "Shopify",
    h1: "Shopify Development Course in Jalandhar",
    title:
      "Shopify Development Course in Jalandhar — Live Store & Ad Spend | Techcadd",
    description:
      "Shopify Development Course in Jalandhar — source a product, build the store, rank it and advertise it, then let AI produce the photography, video and copy. Two exit points: 3 months to a live store, 6 months to a growth system. At Techcadd.",
    keywords: [
      "shopify course jalandhar",
      "shopify development course in jalandhar",
      "ecommerce course jalandhar",
      "dropshipping course jalandhar",
      "shopify training institute jalandhar",
      "shopify course with placement jalandhar",
      "shopify course fees in jalandhar",
    ],
    intro:
      "Build the store, source the product, rank it and advertise it — then let AI produce the photography, the video and the copy. Two exit points: three months to a live selling store, six months to a growth system.",
    facts: [
      { label: "Duration", value: "3 or 6 Months" },
      { label: "Mode", value: "Classroom, Weekend & 1-on-1" },
      { label: "Eligibility", value: "12th Pass Onward" },
      { label: "Includes", value: "Live Store & Ad Budget" },
    ],

    overview: [
      "Techcadd's Shopify Development Course in Jalandhar teaches you to source a product, build a store, launch it on a custom domain with working payments, then rank and advertise it. Choose three months for a live selling store, or six months to add AI product photography, video and paid media scaling.",
      "It is one 22-module ladder with two exit points, not two separate courses — the six-month AI-powered stage continues from Module 12 on the same store you already built in the first three months, so nothing is repeated if you extend.",
    ],

    whoCanDo: {
      intro:
        "Module 01 starts with product research and margin arithmetic taught from scratch, so no coding, design or marketing background is assumed. From Module 09 every session runs on a live store with a real advertising budget.",
      groups: [
        {
          title: "Students after 12th",
          body: "No coding, design or marketing background is needed — Module 01 starts with product research and margin arithmetic taught from scratch. The three-month stage ends with a store that has taken real orders, which becomes your portfolio and your interview answer.",
        },
        {
          title: "Graduates and final-year students",
          body: "E-commerce roles hire on evidence — a live URL, a completed test order, a verified pixel and a cost per purchase before and after. By Week 13 you have all four, and the technical ceiling is Shopify's admin panel, not code.",
        },
        {
          title: "Working professionals",
          body: "Evening and weekend batches let you keep your job while building your own store. Professionals often start with the six-month stage in mind, because AI creative production and paid scaling are where salaried performance roles sit.",
        },
        {
          title: "Business owners, traders and exporters",
          body: "Manufacturers and retailers being asked for a direct-to-consumer channel build it in-house here — Shopify with Razorpay, cash on delivery, GST settings and courier integration, plus the Meta and Google advertising that fills it.",
        },
      ],
    },

    whyProgram: [
      "D2C is the channel Punjab manufacturers are being pushed into, and almost nobody locally can build it properly. Selling directly needs a store that takes payments correctly, a catalogue structured for Shopping feeds and someone who can run the advertising behind it — three skills this syllabus covers early on.",
      "The skill splits into two income routes, and you choose after Week 13. One is employment — store manager, e-commerce executive, performance marketer. The other is your own store, which is a business rather than a salary, and Module 01 teaches the margin arithmetic that tells you which one you are looking at before you commit any budget.",
      "Supervised live work beats free tutorials because of the review, not the information. What a tutorial cannot check is whether your product actually has margin after courier and payment gateway fees, whether your pixel is firing verified purchase events, or whether your test order actually reached the supplier.",
      "The creative side is now the whole job, and it is why the six-month stage exists. Meta and Google have automated targeting; what they have not automated is the photograph, the video and the offer. Producing on-brand product scenes and video ad variations without a shoot is currently the most saleable service you can offer other store owners.",
    ],

    syllabus: {
      intro:
        "Two exit points on one ladder. Modules are numbered 01 to 22 in a single sequence — the six-month programme contains everything in the three-month one and continues from Module 12 on the same store you already built. Nothing is repeated, and you can extend later without redoing a module.",
      stages: [
        {
          months: 3,
          label: "Practitioner",
          range: "Modules 1 – 11",
          summary:
            "Source a product, build the store, rank it and run your first live Meta and Google campaigns.",
        },
        {
          months: 6,
          label: "AI-Powered Expert",
          range: "Modules 12 – 22",
          summary:
            "Produce the creative with AI, scale the paid channels and run the store on data.",
        },
      ],
      modules: [
        {
          n: 1,
          from: 3,
          title: "Product Research & Store Economics",
          body: "Winning product criteria, supplier sourcing and vetting, and pricing to a target margin — landed cost, payment fees, ad cost and break-even ROAS.",
        },
        {
          n: 2,
          from: 3,
          title: "Photoshop for Product & Ad Creative",
          body: "Clean product cut-outs, removing supplier branding, and building high click-through ad creative to live platform specifications.",
        },
        {
          n: 3,
          from: 3,
          title: "Canva & Brand Design Systems",
          body: "A brand kit and store graphics — banners, trust badges, size charts and social templates — held across store, ads and social.",
        },
        {
          n: 4,
          from: 3,
          title: "Shopify Store Setup & Product Architecture",
          body: "Store settings, importing products, writing titles and descriptions, and structuring variants, collections and navigation.",
        },
        {
          n: 5,
          from: 3,
          title: "Theme Customisation & Conversion Page Design",
          body: "Home and product page design — gallery, price framing, objection handling and sticky add-to-cart — tested and passed on mobile.",
        },
        {
          n: 6,
          from: 3,
          title: "Payments, Policies, Domain & Store Launch",
          body: "Domain connection, Razorpay, PayU and cash on delivery, GST and shipping settings, legal pages and a completed test order through the supplier.",
        },
        {
          n: 7,
          from: 3,
          title: "Keyword Research & Search Intent",
          body: "Keyword metrics and intent classification for an e-commerce catalogue, mapped to a specific collection, product or article URL.",
        },
        {
          n: 8,
          from: 3,
          title: "On-Page SEO for Shopify",
          body: "Title tags, meta descriptions and heading structure for collection and product pages, without damaging conversion.",
        },
        {
          n: 9,
          from: 3,
          title: "Meta Ads — Business Manager, Pixel & Live Campaigns",
          body: "Business Manager, Meta Pixel and Conversions API, campaign structure, and a live campaign with a twenty-one-day optimisation log.",
        },
        {
          n: 10,
          from: 3,
          title: "Google Ads — Search, Shopping & Merchant Center",
          body: "Account structure, Merchant Center feed submission, and a live Shopping and Search campaign with a cost-per-conversion report.",
        },
        {
          n: 11,
          from: 3,
          title: "Practitioner Capstone — Live Store & First Sales",
          body: "Taking one product from research to revenue and calculating true profit after product cost, shipping, gateway fees, apps and ad spend.",
        },
        {
          n: 12,
          from: 6,
          title: "Prompt Engineering & the AI Operating Stack",
          body: "Prompt frameworks and building a custom AI assistant loaded with your product, brand and customer data.",
        },
        {
          n: 13,
          from: 6,
          title: "AI Product Photography & Studio-Grade Shoots",
          body: "AI product photography that generates lifestyle scenes and seasonal sets while holding product fidelity.",
        },
        {
          n: 14,
          from: 6,
          title: "AI Video Generation & Synthetic UGC",
          body: "Text-to-video generation, AI avatars and multilingual AI voice for producing ad variations in bulk.",
        },
        {
          n: 15,
          from: 6,
          title: "Premiere Pro — Ad & Product Video Editing",
          body: "Cutting, captions, colour correction and UGC-style ad assembly, delivered across every platform aspect ratio.",
        },
        {
          n: 16,
          from: 6,
          title: "Content Writing & AI Content Systems",
          body: "Direct-response frameworks, product descriptions that sell, and email and WhatsApp flows, AI-assisted and human-edited.",
        },
        {
          n: 17,
          from: 6,
          title: "Technical SEO, Schema & Search Console",
          body: "Crawl budget, Core Web Vitals on a theme carrying apps, and validated Product and Review schema.",
        },
        {
          n: 18,
          from: 6,
          title: "Meta Ads at Scale — Creative Testing, A/B & Retargeting",
          body: "Creative testing matrices, full-funnel retargeting and vertical or horizontal scaling rules on live budget.",
        },
        {
          n: 19,
          from: 6,
          title: "Google Ads — Display, Performance Max & Feed Engineering",
          body: "Performance Max asset groups, audience signals and advanced feed rules for product-level bidding.",
        },
        {
          n: 20,
          from: 6,
          title: "Google Analytics 4 & Store Data Analysis",
          body: "E-commerce events, funnel analysis and a blended Shopify, Meta and Google dashboard in Looker Studio.",
        },
        {
          n: 21,
          from: 6,
          title: "Retention, Automation & Customer Experience",
          body: "Email and SMS flows, an AI support chatbot and automation between the store, the ad platform and a CRM.",
        },
        {
          n: 22,
          from: 6,
          title: "Expert Capstone — AI-Powered Store at Scale",
          body: "Running one store as a complete system, with a full audit, a blended dashboard, a profit report and a client kit ready to pitch.",
        },
      ],
      note: "Nested, not parallel. The six-month AI-powered programme contains everything in the three-month Practitioner programme and continues from Module 12 on the same store you already built. Choosing the shorter programme costs you scope, never depth — and you can extend later without repeating a single module.",
    },

    whyTechcadd: {
      intro:
        "Sessions are run by people currently building stores and spending real advertising money, which is why the course covers failed checkouts, gateway approvals, feed disapprovals and rising cost per purchase — the things that actually break a store.",
      points: [
        {
          title: "Trainers who run live stores and live budgets",
          body: "The examples in class come from stores being managed and budgets being spent this quarter, not a screenshot from years ago.",
        },
        {
          title: "Twenty-two graded deliverables, not twenty-two lectures",
          body: "Every module ends in an artefact a trainer reviews before you advance — a supplier quote, a live URL, a completed test order, a verified pixel event, an approved feed, a profit sheet.",
        },
        {
          title: "You spend a real advertising budget",
          body: "From Module 09 onward, campaigns run on live money with cost per purchase recorded before and after.",
        },
        {
          title: "Honest arithmetic, including when a product fails",
          body: "Students are taught to identify an unprofitable product early rather than to keep spending on it — the opposite of what most e-commerce content online teaches.",
        },
        {
          title: "Internship letter, certificate and one continuous portfolio",
          body: "All deliverables are produced for the same store, so the portfolio reads as one continuous engagement rather than a folder of exercises.",
        },
        {
          title: "Since 2007, trained across Punjab",
          body: "Techcadd runs skill-training programmes across Jalandhar, Ludhiana, Mukerian, Hoshiarpur, Phagwara, Bathinda, Amritsar, Patiala and Mohali.",
        },
      ],
    },

    learn: {
      intro:
        "The programme runs in one line from an empty Shopify trial to a store that has taken real orders and can prove what it earned. You start with product research and margin arithmetic, because a product bought badly cannot be advertised profitably later. Then you produce its creative yourself in Photoshop and Canva, build and theme the store, and launch it on a custom domain with Razorpay, GST, shipping and a completed test order fulfilled through the supplier. From there the store has to be found and filled — keyword research and on-page SEO for free traffic, then Meta and Google Ads on a real budget, ending in a profit-and-loss sheet after every cost. The six-month stage takes that same store further into where the work is actually going — a brand-trained AI assistant, AI product photography and video that replace a shoot, Premiere Pro editing, conversion copywriting, technical SEO, Meta and Google scaling with proper feed engineering, GA4 reporting, and retention flows that make the second order the profitable one.",
      tools: [
        "Shopify",
        "AliExpress",
        "CJdropshipping",
        "DSers / AutoDS",
        "Shiprocket",
        "Razorpay",
        "PayU",
        "Adobe Photoshop",
        "Canva Pro",
        "Google Keyword Planner",
        "Semrush",
        "Meta Business Suite",
        "Ads Manager",
        "Google Ads",
        "Google Merchant Center",
        "ChatGPT",
        "Claude",
        "Photoroom",
        "Midjourney",
        "Runway",
        "HeyGen",
        "Adobe Premiere Pro",
        "GA4",
        "Looker Studio",
        "Klaviyo / Brevo",
        "Zoho Books / Refrens",
      ],
    },

    outcomes: [
      {
        q: "What job roles open up after a Shopify course?",
        a: "Shopify Store Developer, E-commerce Executive, Store Manager and Shopify Store Owner after the three-month stage; AI Creative Producer, E-commerce Performance Marketer and Growth Manager after the six-month stage.",
      },
      {
        q: "What can I earn, and how fast does it grow?",
        a: "Entry-level e-commerce and store roles in the Punjab market move up quickly for someone who can run paid media and read a profit sheet. Store ownership is a business, not a salary — the range there is genuinely open at both ends.",
      },
      {
        q: "Can I freelance or work remotely with this skill?",
        a: "Yes — a Shopify build is delivered as a URL, so location stops mattering once you can show completed stores. A dedicated module covers scoping, pricing, quotations, retainers and GST invoicing.",
      },
      {
        q: "Which industries hire for this in Punjab?",
        a: "Sports goods, leather and hand-tools manufacturers in Jalandhar, hosiery and garments in Ludhiana, agri-equipment dealers, plus D2C brands in food, wellness, apparel and home goods.",
      },
      {
        q: "Can I specialise further after this course?",
        a: "Yes. The three-month stage extends directly into the six-month AI-powered stage without repeating a module. Beyond that, students specialise into paid media, SEO or WordPress and WooCommerce.",
      },
    ],

    projects: [
      {
        title: "Product Research & Margin Model",
        body: "Twenty candidate products scored on demand, margin and shipping, narrowed to three with supplier quotes and a break-even model for the one you choose.",
        tags: ["Google Sheets", "AliExpress"],
      },
      {
        title: "Live Store Taking Real Payments",
        body: "A Shopify store with a structured thirty-product catalogue, designed home and product pages, launched on a custom domain with working payments and every policy page published.",
        tags: ["Shopify", "Razorpay"],
      },
      {
        title: "Live Meta and Google Campaigns",
        body: "A Meta campaign on a real budget with verified pixel and purchase events and a twenty-one-day optimisation log, plus an approved Merchant Center feed running live Shopping and Search campaigns.",
        tags: ["Ads Manager", "Merchant Center"],
      },
      {
        title: "Capstone — Store Profit-and-Loss & Case Study",
        body: "One product taken from research to revenue, with profit calculated after product cost, shipping, gateway fees, apps and ad spend, and a case study defended to a mock client panel.",
        tags: ["Shopify", "Looker Studio"],
      },
    ],

    reviews: [
      {
        name: "Arjun Vaidya",
        role: "Shopify Store Developer",
        city: "Jalandhar",
        initials: "AV",
        quote:
          "I launched a real store during the course and it actually took a paying order. That's a very different conversation in an interview than saying I learned Shopify.",
      },
      {
        name: "Divya Ratra",
        role: "E-commerce Executive",
        city: "Phagwara",
        initials: "DR",
        quote:
          "The margin model in Module 01 stopped me picking a product I would have lost money on. I use that same sheet before sourcing anything now.",
      },
      {
        name: "Nikhil Suri",
        role: "Store Manager",
        city: "Kapurthala",
        initials: "NS",
        quote:
          "Getting our Merchant Center feed approved was harder than I expected. Fixing the disapprovals myself for the capstone is exactly what my current job needed on day one.",
      },
      {
        name: "Palak Anand",
        role: "AI Creative Producer",
        city: "Hoshiarpur",
        initials: "PA",
        quote:
          "The AI product photography module changed how I think about a shoot budget. I can now produce twenty on-brand scenes from a single supplier photo.",
      },
      {
        name: "Vivaan Kalsi",
        role: "E-commerce Performance Marketer",
        city: "Ludhiana",
        initials: "VK",
        quote:
          "Six months of scaling the same store instead of jumping between demos meant every mistake had a real consequence, and I actually learned from it.",
      },
      {
        name: "Simar Preet",
        role: "Shopify Store Owner",
        city: "Nakodar",
        initials: "SP",
        quote:
          "I run my own store now selling to Punjab and beyond. The honest profit arithmetic from Module 11 is the reason I know it's actually working, not just busy.",
      },
    ],

    faqs: [
      {
        q: "How long is the Shopify course in Jalandhar?",
        a: "There are two durations — three months ending in a live store that has taken orders, and six months adding AI product photography, AI video, advanced paid media, analytics and retention. The six-month track continues from the three-month one without repeating anything.",
      },
      {
        q: "What is the fee for a Shopify course in Jalandhar?",
        a: "Techcadd's Shopify course is priced separately for the three-month and six-month tracks. Counsellors share the current fee sheet, instalment options and the recommended budget for a domain, a Shopify plan and the live ad campaigns on request.",
      },
      {
        q: "Do I need coding knowledge to build a Shopify store?",
        a: "No. Shopify is operated through its admin panel and theme editor, and this course assumes no coding, design or marketing background. The harder skills taught are product research, creative production and campaign arithmetic.",
      },
      {
        q: "How much money do I need to actually run a store during the course?",
        a: "Plan for a Shopify plan, a domain, a product sample and a small advertising budget for the live campaign modules. Amounts are kept deliberately small because the goal is to learn optimisation on real data — discuss the current recommended figure with a counsellor.",
      },
      {
        q: "What jobs can I get after a Shopify course?",
        a: "Shopify Store Developer, E-commerce Executive, Store Manager, and after the six-month stage, AI Creative Producer or E-commerce Performance Marketer.",
      },
      {
        q: "Does Techcadd guarantee placement after the course?",
        a: "No institute can honestly guarantee a job, and Techcadd does not. What is provided is placement support — interview preparation, portfolio and resume review, and referrals through the placement cell.",
      },
      {
        q: "Which tools and software are taught in the Shopify course?",
        a: "Shopify, DSers, Razorpay, Shiprocket, Adobe Photoshop, Canva Pro, Meta Ads Manager, Google Ads, Google Merchant Center, GA4 and Google Search Console in the three-month stage. The six-month stage adds AI photography and video tools, Premiere Pro, Klaviyo and Looker Studio.",
      },
      {
        q: "Do I get a certificate and internship letter?",
        a: "Yes. Students who complete the capstone receive a course completion certificate and an internship letter covering the live store project.",
      },
      {
        q: "Are weekend or evening batches available for working professionals?",
        a: "Yes, weekday, evening and weekend batches are offered so working professionals and college students can attend without leaving their job or classes. 1-on-1 training is also available for anyone who wants a fully personal schedule. Every class — batch or 1-on-1 — runs for 2 hours.",
      },
    ],

    related: [
      "/courses/digital-marketing",
      "/courses/social-media-marketing",
      "/courses/google-ads",
      "/courses/wordpress",
      "/courses/seo",
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
      { label: "Mode", value: "Classroom, Weekend & 1-on-1" },
      { label: "Eligibility", value: "12th Pass Onward" },
      { label: "Includes", value: "Internship Letter" },
    ],
  },
  "internship-training": {
    heading: (label) => `${label} in Jalandhar`,
    intro:
      "University-recognised industrial training at Techcadd Jalandhar, finishing with a live project, an internship letter and placement drives.",
    facts: [
      { label: "Mode", value: "Classroom & 1-on-1" },
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
      { label: "Mode", value: "Classroom & 1-on-1" },
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
