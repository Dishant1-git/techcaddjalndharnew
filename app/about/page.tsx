import type { Metadata } from "next"
import Image from "next/image"
<<<<<<< Updated upstream
import Link from "next/link"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { HeroVideo } from "@/components/hero-video"
import { Recognition } from "@/components/recognition"
=======
import { Fragment } from "react"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { HeroVideo } from "@/components/hero-video"
import { PanelTexture } from "@/components/panel-texture"
>>>>>>> Stashed changes
import { TimelineProgress } from "@/components/timeline-progress"
import { SITE } from "@/lib/site"
import { STATS } from "@/lib/stats"

export const metadata: Metadata = {
  title: "About Techcadd — Our Story, Values and Journey",
  description:
    "Founded in 2016 in Jalandhar, techcadd trains learners in AI, data science, cyber security, cloud, full stack development, design and CAD/CAM. Our story, our approach, and the milestones along the way.",
  alternates: { canonical: `${SITE.url}/about` },
}

/*
  The page alternates dark and light panels the whole way down, so no two
  neighbours share a background:

    hero (video) · who we are · ecosystem · changing world · who we teach
    (photo) · learn→grow · what's different · domains · approach · industry
    · journey · belief & today · CTA
     D           L             D            L               D
     L            D                 L         D           L          D  L  D

  Each dark panel is dressed differently — video, circuit texture, a
  photograph, the aurora texture, flat ink — so the rhythm reads as variety
  rather than five copies of the same navy block.
*/

/*
  TODO: three photographs is everything the repo has, so they are reused across
  the page the same way lib/gallery.ts reuses them. Drop real photos into
  public/assets/images/about/ and point these at them — nothing else needs to
  change.
*/
const PHOTOS = {
  team: "/assets/images/about/team.jpg",
  mentoring: "/assets/images/about/mentoring.webp",
  lab: "/assets/images/about/lab-demo.webp",
}

/** The disciplines named in the company profile, in the order it lists them. */
const DISCIPLINES = [
  "Artificial Intelligence",
  "Data Science",
  "Machine Learning",
  "Cyber Security",
  "Cloud Computing",
  "Full Stack Development",
  "MERN Stack",
  "Python",
  "Web Development",
  "Mobile App Development",
  "Digital Marketing",
  "Graphic Designing",
  "UI/UX",
  "Animation",
  "Video Editing",
  "CAD/CAM",
]

/** Who the training ecosystem is built to serve. */
const LEARNERS = [
  {
    title: "School & College Students",
    body: "Looking to develop technology skills early.",
  },
  {
    title: "Graduates & Job Seekers",
    body: "Preparing for technology careers.",
  },
  {
    title: "Engineering & IT Students",
    body: "Seeking practical exposure and industrial training.",
  },
  {
    title: "Working Professionals",
    body: "Looking to upgrade or diversify their skills.",
  },
  {
    title: "Career Switchers",
    body: "Exploring opportunities in the technology sector.",
  },
  {
    title: "Entrepreneurs & Freelancers",
    body: "Seeking digital and technology capabilities.",
  },
]

/** Learn → Practice → Build → Grow. */
const JOURNEY_STEPS = [
  { title: "Learn", body: "Understand the concepts and fundamentals." },
  {
    title: "Practice",
    body: "Apply knowledge through hands-on exercises and guided learning.",
  },
  { title: "Build", body: "Work on projects and practical applications." },
  {
    title: "Grow",
    body: "Develop professional confidence and career-oriented skills.",
  },
]

const DIFFERENTIATORS = [
  {
    title: "Industry-Oriented Curriculum",
    body: "Training is designed around practical skills and technologies relevant to today's digital workplace.",
  },
  {
    title: "Hands-On Learning",
    body: "Students get opportunities to apply concepts rather than relying solely on theoretical instruction.",
  },
  {
    title: "Emerging Technology Programs",
    body: "Learners can explore domains including AI, Machine Learning, Data Science, Cyber Security, Cloud Computing and other modern technologies.",
  },
  {
    title: "Projects & Industrial Exposure",
    body: "Project-based learning and industrial training help students connect classroom concepts with practical applications.",
  },
  {
    title: "Experienced Trainers & Mentors",
    body: "Guidance from trainers and mentors helps learners understand technical concepts and their real-world applications.",
  },
  {
    title: "Career Guidance",
    body: "Students can receive guidance related to course selection, skill development, resumes, interviews and career pathways.",
  },
  {
    title: "Placement Assistance",
    body: "techcadd provides placement assistance and career support to eligible learners; actual employment decisions remain with recruiting organizations.",
  },
  {
    title: "Modern Learning Infrastructure",
    body: "Technology-focused learning environments are designed to support practical training and hands-on work.",
  },
  {
    title: "Industry & Academic Engagement",
    body: "techcadd has participated in workshops, training initiatives and placement activities with educational institutions, strengthening the connection between academic learning and industry-oriented skills.",
  },
]

/** The four skill families, grouped the way the profile groups them. */
const DOMAINS = [
  {
    title: "Technology",
    items: [
      "AI",
      "Machine Learning",
      "Data Science",
      "Cyber Security",
      "Cloud Computing",
      "DevOps",
    ],
  },
  {
    title: "Development",
    items: [
      "Python",
      "Full Stack",
      "MERN",
      "Web Development",
      "Mobile App Development",
    ],
  },
  {
    title: "Digital & Creative",
    items: [
      "Digital Marketing",
      "UI/UX",
      "Graphic Designing",
      "Video Editing",
      "Animation",
    ],
  },
  {
    title: "Professional & Technical Skills",
    items: [
      "Advanced Excel",
      "CAD/CAM",
      "Accounting",
      "Other career-focused programs",
    ],
  },
]

/** Practical. Future-Focused. Career-Oriented. */
const PRINCIPLES = [
  {
    title: "Relevance",
    body: "Learn technologies and skills that connect with evolving industry requirements.",
  },
  {
    title: "Application",
    body: "Turn concepts into practical skills through projects, exercises and hands-on learning.",
  },
  {
    title: "Growth",
    body: "Develop the mindset and adaptability required to keep learning in a rapidly changing technology landscape.",
  },
]

type Milestone = { year: string; title: string; body: string }

/**
 * TODO: 2017–2026 are still placeholder — replace with the real history.
 *
 * Only 2016 is sourced: the founding year and founder come from the company
 * profile quoted in the section above. The other ten entries are scaffolding
 * written to plausible dates so the timeline could be built, and each one is a
 * dated public claim about a real business, so they need the team's own account
 * rather than something that merely sounds right.
 */
const MILESTONES: Milestone[] = [
  { year: "2016", title: "techcadd is founded", body: "Mr. Gourav Gupta starts techcadd in Jalandhar, to close the gap between academic learning and industry needs." },
  { year: "2017", title: "Industrial training at scale", body: "Six-week, 45-day and six-month tracks become full programmes." },
  { year: "2018", title: "A placement cell", body: "Hiring support becomes its own team rather than a trainer's side task." },
  { year: "2019", title: "Colleges come on board", body: "Formal training partnerships begin with universities across Punjab." },
  { year: "2020", title: "Teaching through lockdown", body: "Live online batches launch in weeks, and no cohort loses a term." },
  { year: "2021", title: "Data on the syllabus", body: "Analytics and data science join the catalogue as full tracks." },
  { year: "2022", title: "Cloud and DevOps", body: "AWS, Docker and CI pipelines are added to the developer paths." },
  { year: "2023", title: "After-12th pathways", body: "Career tracks built for school leavers, not just graduates." },
  { year: "2024", title: "AI on the syllabus", body: "Generative and agentic AI arrive, taught on real projects." },
  { year: "2025", title: "Ten thousand alumni", body: "The trained-student count passes five figures across all tracks." },
  { year: "2026", title: "Today and beyond", body: "New labs, new tracks, and the same rule: you learn it by building it." },
]

export default function AboutPage() {
  return (
    <main>
      {/* --- 01 · DARK — hero ------------------------------------------- */}
      <section
        data-cursor="light"
        /* `min-h-screen`, not a fixed `h-screen`: the panel fills the viewport
           as intended, but a short window — a laptop in landscape, or a phone
           with the browser chrome showing — grows it rather than spilling the
           stats out of the bottom. Centred, so the padding above and below is
           only a floor for that case. */
        className="relative isolate flex min-h-screen items-center overflow-hidden bg-ink pt-32 pb-20 text-white lg:pt-40 lg:pb-28"
      >
        <HeroVideo src="/assets/video/aboutus-bg.mp4" />

        <Container className="relative">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            About us
          </span>

          {/* Two-tone rather than one weight: the bright phrases carry the
              sentence on their own, so the line reads at a glance and in full. */}
          <h1
            data-reveal
            suppressHydrationWarning
            className="mt-7 max-w-4xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            Learn about <span className="text-white">our people,</span> our story
            and <span className="text-white">how we turn skills into careers.</span>
          </h1>

          {/* Same source as the homepage band — one set of numbers for the whole
              site, so a claim can never drift between two pages. */}
          <dl
            data-reveal
            suppressHydrationWarning
            className="mt-14 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="relative flex flex-col-reverse pl-5"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-linear-to-b from-accent-400 to-brand-600"
                />
                <dt className="mt-2 text-sm text-white/55">{stat.label}</dt>
                <dd className="font-display text-4xl leading-none font-bold tracking-tight lg:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* --- 02 · LIGHT — who we are ------------------------------------
        Copy on the left, a three-photo collage on the right: one wide frame
        with two square ones under it, so the column has some movement in it
        rather than sitting as a single flat rectangle.
      */}
      <section className="bg-subtle py-20 lg:py-28">
        <Container>
          <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
            Who we are
          </p>

          <h2
            data-reveal
            suppressHydrationWarning
            className="mt-4 max-w-4xl font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
          >
            Empowering Skills. Enabling Careers.{" "}
            <span className="text-brand-600">Building the Future.</span>
          </h2>

          <div
            data-reveal
<<<<<<< Updated upstream
            suppressHydrationWarning
            className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
=======
            className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16"
>>>>>>> Stashed changes
          >
            <div>
              <div className="space-y-5 text-base leading-relaxed text-muted lg:text-[17px]">
                <p>
                  Founded in 2016 by{" "}
                  {/* The one place his name appears on this page, so it is the
                      one that should carry the link to his profile. */}
                  <Link
                    href="/about/founder"
                    className="font-semibold text-foreground underline decoration-brand-600/40 underline-offset-4 transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
                  >
                    Mr. Gourav Gupta
                  </Link>
                  , techcadd is an IT training and skill-development
                  organization focused on bridging the gap between academic
                  learning and evolving industry requirements. The organization
                  combines practical exposure, emerging technologies,
                  project-based learning and career-oriented training to help
                  learners develop relevant skills and greater confidence for
                  the professional world.
                </p>
                <p>
                  From Artificial Intelligence, Data Science, Machine Learning,
                  Cyber Security and Cloud Computing to Full Stack Development,
                  MERN Stack, Python, Web Development, Mobile App Development,
                  Digital Marketing, Graphic Designing, UI/UX, Animation, Video
                  Editing, CAD/CAM and other technology-focused disciplines,
                  techcadd provides learners with opportunities to explore
                  diverse career pathways in the digital economy.
                </p>
              </div>

              <h3 className="mt-9 font-display text-sm font-bold tracking-tight text-ink">
                What we teach
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                From Artificial Intelligence to CAD/CAM and other
                technology-focused disciplines — skills for the evolving digital
                economy.
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {DISCIPLINES.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-7 border-t border-line pt-5 text-sm text-muted">
                Headquartered in Jalandhar, Punjab.
              </p>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 size-64 rounded-full bg-brand-500/15 blur-[90px]"
              />

              <div className="relative grid grid-cols-2 gap-4">
                <Photo
                  src={PHOTOS.team}
                  alt="The techcadd team and students at the Jalandhar centre"
                  className="col-span-2 aspect-[2/1] sm:aspect-[16/7]"
                  sizes="(min-width: 1024px) 38vw, 92vw"
                >
                  <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/45 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-white/85 uppercase backdrop-blur-md">
                    Team techcadd
                  </span>
                </Photo>

                <Photo
                  src={PHOTOS.mentoring}
                  alt="A mentor walking a student through code on a laptop"
                  className="aspect-square"
                  sizes="(min-width: 1024px) 19vw, 45vw"
                />

                <Photo
                  src={PHOTOS.lab}
                  alt="A lab demonstration during a techcadd session"
                  className="aspect-square"
                  sizes="(min-width: 1024px) 19vw, 45vw"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 03 · DARK — more than training -----------------------------
        The circuit texture behind it, and the two photographs stepped out of
        line with each other so the pair reads as a spread rather than a row.
      */}
      <section
        data-cursor="light"
        className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28"
      >
        <PanelTexture />

        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-accent-400 uppercase">
                More than training
              </p>

              <h2
                data-reveal
                className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl"
              >
                A skill-building ecosystem.
              </h2>

              <div
                data-reveal
                className="mt-6 space-y-5 text-base leading-relaxed text-white/70 lg:text-[17px]"
              >
                <p>
                  At techcadd, technology education is designed to go beyond
                  textbooks and conventional classroom learning. The focus is on
                  helping learners{" "}
                  <strong className="font-semibold text-white">
                    learn, implement and grow
                  </strong>{" "}
                  by combining conceptual understanding with practical
                  application.
                </p>
                <p>
                  Students can work on assignments, projects, industrial
                  training and internship-oriented learning experiences that
                  help them understand how technology is applied in real-world
                  environments. Publicly available information about techcadd
                  also reflects recent practical workshops and training
                  activities in areas such as mobile application development,
                  cloud computing, AI/ML, DevOps and data-related skills.
                </p>
              </div>
            </div>

            <div data-reveal className="grid gap-5 sm:grid-cols-2">
              {/* `self-start`, so the grid does not stretch the two to a common
                  row height and flatten the 4:3 the offset below plays
                  against. */}
              <Photo
                src={PHOTOS.lab}
                alt="A trainer running a lab demonstration at techcadd"
                className="aspect-[4/3] self-start"
                sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw"
              />

              <Photo
                src={PHOTOS.mentoring}
                alt="A mentor guiding a student through a project at techcadd"
                className="hidden aspect-[4/3] self-start sm:mt-12 sm:block"
                sizes="(min-width: 1024px) 24vw, 45vw"
              />
            </div>
          </div>
        </Container>
      </section>

<<<<<<< Updated upstream
          <h3
            data-reveal
            suppressHydrationWarning
            className="mt-16 font-display text-2xl font-bold tracking-tight text-ink lg:mt-20 lg:text-3xl"
          >
            What makes techcadd different?
          </h3>
=======
      {/* --- 04 · LIGHT — preparing learners ---------------------------- */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              Why it matters
            </p>
>>>>>>> Stashed changes

            <h2
              data-reveal
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Preparing learners for a changing digital world
            </h2>

            <div
              data-reveal
              className="mt-6 space-y-5 text-base leading-relaxed text-muted lg:text-lg"
            >
              <p>
                Technology is evolving rapidly. Artificial Intelligence,
                automation, cloud platforms, cybersecurity, data and software
                development are continuously changing the way businesses
                operate.
              </p>
              <p>
                techcadd aims to keep its learning ecosystem aligned with this
                changing environment by introducing learners to emerging
                technologies and industry-relevant tools, helping them develop
                the adaptability required to continue learning throughout their
                careers.
              </p>
            </div>
          </div>

          {/* The point of the section, pulled out of the paragraphs so it is
              not read past. */}
          <p
            data-reveal
<<<<<<< Updated upstream
            suppressHydrationWarning
            className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4"
=======
            className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-subtle px-7 py-6 text-center font-display text-lg leading-relaxed font-medium tracking-tight text-ink text-balance lg:text-xl"
>>>>>>> Stashed changes
          >
            The objective is not simply to teach a technology, but to develop
            the ability to understand problems, build solutions, use technology
            effectively and keep upgrading one&apos;s skills.
          </p>
        </Container>
      </section>

      {/* --- 05 · DARK — who we teach -----------------------------------
        A photograph carries this one instead of a texture: the section is
        about people, so the panel is a room full of them with the ink laid
        over the top, and the six groups sit on it as glass tiles.
      */}
      <section
        data-cursor="light"
        className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28"
      >
        <Image
          src={PHOTOS.team}
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover"
        />
        {/* Two layers: a flat wash to knock the photo back, then a vertical
            gradient so the top and bottom edges meet the neighbouring panels
            rather than cutting against them. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-ink/85"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-b from-ink via-ink/70 to-ink"
        />

        <Container className="relative">
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-[0.22em] text-accent-400 uppercase">
              Who we teach
            </p>

            <h2
              data-reveal
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl"
            >
              Learning for every stage of the career journey
            </h2>

            <p
              data-reveal
              className="mt-5 text-base leading-relaxed text-white/70"
            >
              techcadd&apos;s training ecosystem is designed to serve a diverse
              learner base, including:
            </p>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {LEARNERS.map((learner, index) => (
              <li
                key={learner.title}
                data-reveal
                style={
                  { "--reveal-delay": `${index * 80}ms` } as React.CSSProperties
                }
                className="rounded-2xl border border-white/15 bg-white/[0.07] p-7 backdrop-blur-md transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.12]"
              >
                <span className="font-mono text-[11px] tracking-[0.18em] text-accent-400">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-3 font-display text-base font-bold tracking-tight">
                  {learner.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {learner.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* --- 06 · LIGHT — learn → practice → build → grow ----------------
        Four steps threaded on a dashed rail from `lg`; stacked below that,
        where the numbering carries the order on its own.
      */}
      <section className="bg-subtle py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              From classroom to practical experience
            </p>

            <h2
              data-reveal
              className="mt-4 font-display text-3xl leading-[1.1] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Learn <Arrow /> Practice <Arrow /> Build <Arrow /> Grow
            </h2>
          </div>

          <div className="relative mt-14 lg:mt-20">
            <span
              aria-hidden="true"
              className="absolute top-7 right-[12.5%] left-[12.5%] hidden border-t border-dashed border-line lg:block"
            />

            <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {JOURNEY_STEPS.map((step, index) => (
                <li
                  key={step.title}
                  data-reveal
                  style={
                    {
                      "--reveal-delay": `${index * 110}ms`,
                    } as React.CSSProperties
                  }
                  className="lg:flex lg:flex-col lg:items-center lg:text-center"
                >
                  <span className="grid size-14 place-items-center rounded-full border border-line bg-background font-display text-base font-bold tracking-tight text-brand-600 shadow-[0_12px_28px_-16px_rgba(15,23,42,0.55)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-ink">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <p
            data-reveal
            className="mx-auto mt-14 max-w-3xl text-center text-sm leading-relaxed text-muted lg:mt-16"
          >
            This practical orientation is reflected in techcadd&apos;s publicly
            described offerings, which include live projects, industrial
            training programs and internship opportunities.
          </p>
        </Container>
      </section>

      {/* --- 07 · DARK — what makes techcadd different -------------------
        The aurora texture rather than the circuit one: nine points is a lot of
        reading, and a schematic behind it competes.
      */}
      <section
        data-cursor="light"
        className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28"
      >
        <PanelTexture variant="aurora" />

        <Container className="relative">
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-[0.22em] text-accent-400 uppercase">
              The difference
            </p>

            <h2
              data-reveal
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl"
            >
              What makes techcadd different?
            </h2>
          </div>

          <ul
            data-reveal
            className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"
          >
            {DIFFERENTIATORS.map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <CheckIcon className="mt-0.5 size-5 shrink-0 text-accent-400" />

                <div>
                  <h3 className="font-display text-base font-bold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* --- 08 · LIGHT — building skills across domains ----------------- */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              What you can learn
            </p>

            <h2
              data-reveal
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Building skills across technology domains
            </h2>

            <p data-reveal className="mt-5 text-base leading-relaxed text-muted">
              Whether a learner wants to code an application, analyse data,
              build an AI solution, secure a network, manage cloud
              infrastructure, design a digital experience, create visual content
              or grow a business online, techcadd provides multiple learning
              pathways.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DOMAINS.map((domain, index) => (
              <div
                key={domain.title}
                data-reveal
                style={
                  { "--reveal-delay": `${index * 90}ms` } as React.CSSProperties
                }
                className="rounded-2xl border border-line bg-subtle p-7 transition-colors duration-300 hover:border-brand-600/40"
              >
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                  {domain.title}
                </h3>

                <span
                  aria-hidden="true"
                  className="mt-4 block h-0.5 w-10 rounded-full bg-linear-to-r from-accent-400 to-brand-600"
                />

                <ul className="mt-5 space-y-2.5">
                  {domain.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand-600"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* --- 09 · DARK — our approach ------------------------------------
        Flat ink, no texture and no photograph. Three principles is the
        shortest section on the page, and leaving it bare is what keeps the
        two dressed dark panels either side of it from running together.
      */}
      <section data-cursor="light" className="bg-ink py-20 text-white lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-accent-400 uppercase">
              Our approach
            </p>

            <h2
              data-reveal
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl"
            >
              Practical. Future-Focused.{" "}
              <span className="text-accent-400">Career-Oriented.</span>
            </h2>

            <p
              data-reveal
              className="mt-5 text-base leading-relaxed text-white/70"
            >
              techcadd&apos;s approach is built around three principles.
            </p>
          </div>

          <ol className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-3 lg:gap-12">
            {PRINCIPLES.map((principle, index) => (
              <li
                key={principle.title}
                data-reveal
                style={
                  { "--reveal-delay": `${index * 110}ms` } as React.CSSProperties
                }
                className="border-t-2 border-white/15 pt-6"
              >
                <p className="font-mono text-xs tracking-[0.22em] text-accent-400">
                  {String(index + 1).padStart(2, "0")} —
                </p>

                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                  {principle.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-white/65 lg:text-base">
                  {principle.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* --- 10 · LIGHT — connecting education with industry ------------- */}
      <section className="bg-subtle py-20 lg:py-28">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Photo
              src={PHOTOS.mentoring}
              alt="A campus workshop run by techcadd with a partner institution"
              className="aspect-[4/3] lg:aspect-[5/4]"
              sizes="(min-width: 1024px) 42vw, 92vw"
            />

            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
                Industry engagement
              </p>

              <h2
                data-reveal
                className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl"
              >
                Connecting education with industry
              </h2>

              <div
                data-reveal
                className="mt-6 space-y-5 text-base leading-relaxed text-muted lg:text-[17px]"
              >
                <p>
                  A major part of techcadd&apos;s broader ecosystem is its
                  engagement with educational institutions and industry-oriented
                  initiatives. Public records show techcadd participating in
                  campus placement activities and technology workshops with
                  educational institutions, providing students with
                  opportunities for industry interaction and practical exposure.
                </p>
                <p>
                  These interactions help strengthen the bridge between what
                  students learn and how technology is applied professionally.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 11 · DARK — our journey -------------------------------------
        Alternating timeline. One list with a rail down the middle: each item
        puts its year card against the rail and its copy on the outside, the
        sides swapping row by row. Below `sm` there is no room for two columns,
        so the rail moves to the left edge and every item stacks against it.

        The panel holds one viewport from `lg` up, and the list scrolls inside
        it. Eleven milestones do not fit a screen at a readable size — the
        earlier attempt to divide the height between them clipped 2026 off the
        bottom — so the height stays fixed and the overflow becomes a scroll
        rather than a loss. Under `lg` the panel simply grows with its content.

        On ink the white year cards read as chips on the rail, and `timeline-dark`
        fixes the one colour in globals.css that assumes a light background.
      */}
      <section
        data-cursor="light"
        className="timeline-dark relative isolate flex flex-col overflow-hidden bg-ink py-20 text-white lg:h-screen lg:py-14"
      >
        <PanelTexture variant="aurora" />

        {/* Renders nothing — it only watches the milestones below and stamps
            `data-state` on them, which is what the CSS styles against. */}
        <TimelineProgress />

        <Container className="relative flex flex-1 flex-col lg:min-h-0">
          <div className="text-center">
            <span className="font-mono text-xs tracking-[0.22em] text-accent-400 uppercase">
              Our journey
            </span>
            <h2
              data-reveal
              suppressHydrationWarning
              className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl"
            >
              A decade of building careers
            </h2>

            <p
              data-reveal
              className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/65 lg:text-base"
            >
              What began in 2016 has evolved into a technology-focused training
              ecosystem with an expanding portfolio of courses and practical
              learning initiatives — and the focus keeps moving towards emerging
              areas such as Artificial Intelligence, automation, cloud
              technologies, cybersecurity, data and modern software development.
            </p>
          </div>

          {/* Three nested boxes, each with one job: this one is the positioning
              frame the edge fades hang off, the next is the scroll port, and the
              innermost one takes the list's full height so the rail can run the
              whole way down. A rail placed on the scroll port itself would be
              only as tall as the visible area and would slide away as you
              scrolled. */}
          <div className="relative mt-10 flex-1 lg:mt-8 lg:min-h-0">
            {/* Scrollbar hidden, scrolling kept. The edge fades are what signal
                there is more below now, so nothing is lost by removing it. */}
            <div className="h-full [scrollbar-width:none] lg:overflow-y-auto lg:scroll-smooth [&::-webkit-scrollbar]:hidden">
              {/* Breathing room at both ends so the first and last dots are not
                  flush against the fades. */}
              <div className="relative lg:py-4">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-[7px] w-px bg-white/15 sm:left-1/2"
                />

                {/* Roomier than it was: each milestone now lights as it
                    reaches the middle of the screen, and that only reads as one
                    at a time if they are far enough apart that two are rarely
                    in the band together. */}
                <ol className="space-y-12 lg:space-y-16">
                  {MILESTONES.map((milestone, index) => {
                    const right = index % 2 === 1

                    return (
                      <li
                        key={milestone.year}
                        /* No `data-reveal` here. That is a one-shot that latches
                           on first sight, which cannot express a state the
                           timeline needs to take away again — and its
                           `.is-visible { opacity: 1 }` is (0,3,0), so it would
                           outrank the dimmed state and pin every milestone lit. */
                        data-timeline-item
                        className="relative pl-9 sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-12 sm:pl-0"
                      >
                        <span
                          aria-hidden="true"
                          className="timeline-dot absolute top-1/2 left-1 size-2.5 -translate-y-1/2 rounded-full bg-brand-500 ring-4 ring-brand-500/25 sm:left-1/2 sm:-translate-x-1/2"
                        />

                        {/* Half the column gap, so it meets the card exactly. */}
                        <span
                          aria-hidden="true"
                          className={`absolute top-1/2 hidden h-px w-6 -translate-y-1/2 bg-white/15 sm:block ${
                            right ? "left-1/2" : "right-1/2"
                          }`}
                        />

                        {/* Reversed rather than reordered: the card stays first
                            in the DOM, so the reading order is the same on both
                            sides. */}
                        <div
                          className={`flex items-center gap-4 ${
                            right
                              ? "sm:col-start-2"
                              : "sm:col-start-1 sm:flex-row-reverse sm:text-right"
                          }`}
                        >
                          {/* `text-ink` on the card itself, not on the number
                              inside it: the reached state in globals.css sets
                              `color` on `.timeline-card`, and it can only win
                              over this if they are the same element. */}
                          <div className="timeline-card w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-background text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
                            <div className="timeline-card__era bg-brand-600 py-0.5 text-center font-mono text-[10px] tracking-widest text-white">
                              20
                            </div>
                            <div className="py-1.5 text-center font-display text-xl leading-none font-bold">
                              {milestone.year.slice(2)}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-display text-sm font-bold tracking-tight lg:text-[15px]">
                              {milestone.year} — {milestone.title}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-white/60">
                              {milestone.body}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>

            {/* Softens the top cut line as the list scrolls under the heading. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 hidden h-10 bg-linear-to-b from-ink to-transparent lg:block"
            />
          </div>
        </Container>
      </section>

<<<<<<< Updated upstream
      {/* Moved here from /about/founder: these are the institute's
          certifications, university engagements and collaborations rather than
          anything personal to the founder, so they belong on the page about
          the institute. */}
      <Recognition />

=======
      {/* --- 12 · LIGHT — our belief, then techcadd today ----------------
        Two closing thoughts in one light panel, shaped differently from each
        other: the belief is editorial — three lines, ruled, with the prose
        held beside them — and techcadd today is a card, so the page signs off
        on something that reads as a note rather than another band.
      */}
      <section className="bg-subtle py-20 lg:py-28">
        <Container>
          <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
            Our belief
          </p>

          <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            {/* `<h2>` as a whole, with the lines as spans inside it — three
                separate headings would claim three subjects where there is
                one. */}
            <h2 data-reveal className="font-display tracking-tight text-ink">
              {["Technology changes.", "Skills evolve.", "Learning never stops."].map(
                (line, index) => (
                  <span
                    key={line}
                    /* The last line is the one that matters, so the colour
                       lands there and the first two lead up to it. */
                    className={`block border-b border-line py-4 text-3xl leading-tight font-bold text-balance first:pt-0 last:border-0 last:pb-0 sm:text-4xl lg:text-5xl ${
                      index === 2 ? "text-brand-600" : ""
                    }`}
                  >
                    {line}
                  </span>
                ),
              )}
            </h2>

            {/* Held off the top edge so it sits against the second line rather
                than racing the first — the statement should be read before the
                explanation. */}
            <div
              data-reveal
              className="space-y-5 border-l-2 border-brand-600/30 pl-6 text-base leading-relaxed text-muted lg:mt-6 lg:text-[17px]"
            >
              <p>
                We believe that meaningful technology education should not end
                when a course ends.
              </p>
              <p>
                It should give learners the knowledge to understand, the skills
                to build, the confidence to perform and the curiosity to keep
                growing.
              </p>
            </div>
          </div>

          <div
            data-reveal
            className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-3xl border border-line bg-background text-center shadow-[0_30px_70px_-40px_rgba(15,23,42,0.4)] lg:mt-20"
          >
            {/* The only fill on the card, and it is a hairline — enough to mark
                it as the closing note without another coloured panel. */}
            <span
              aria-hidden="true"
              className="block h-1 bg-linear-to-r from-brand-600 via-brand-500 to-accent-400"
            />

            <div className="px-7 py-12 sm:px-12 lg:py-16">
              <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
                techcadd today
              </p>

              {/* Three words, three columns, divided — the same rhythm as the
                  belief lines above but turned on its side, so the two rhyme
                  without repeating. */}
              <p className="mt-7 flex flex-col items-center justify-center gap-3 font-display text-2xl font-bold tracking-tight text-ink sm:flex-row sm:gap-6 lg:text-3xl">
                {["Learn.", "Implement.", "Grow."].map((word, index) => (
                  <Fragment key={word}>
                    {index > 0 && (
                      <span
                        aria-hidden="true"
                        className="hidden h-6 w-px bg-line sm:block"
                      />
                    )}
                    <span>{word}</span>
                  </Fragment>
                ))}
              </p>

              <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-muted lg:text-base">
                With a focus on practical technology education, emerging skills,
                industry engagement and career development, techcadd continues
                its journey towards creating a stronger ecosystem of
                future-ready technology professionals.
              </p>

              <div className="mt-10 border-t border-line pt-8">
                <p className="text-xs tracking-[0.14em] text-muted uppercase">
                  Your Skill &amp; Technology Partner
                </p>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
                  techcadd
                </p>
                <p className="mt-2 text-sm text-muted">
                  Where Your Tech Journey Begins.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 13 · DARK — call to action ---------------------------------- */}
>>>>>>> Stashed changes
      <Cta />
    </main>
  )
}

/**
 * A framed photograph: skeleton underneath until it paints, and a slow zoom on
 * hover. Same treatment as the homepage collage, so a photo looks the same
 * wherever it appears.
 */
function Photo({
  src,
  alt,
  className,
  sizes,
  children,
}: {
  src: string
  alt: string
  className: string
  sizes: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-subtle ring-1 ring-line/70 ${className}`}
    >
      {/* Shimmers until the photo paints over it — no JS needed, since the
          image is `fill object-cover` and covers this completely. */}
      <div aria-hidden="true" className="skeleton absolute inset-0" />

      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      {children}
    </div>
  )
}

/** The separator in “Learn → Practice → Build → Grow”. */
function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="inline-block size-[0.7em] shrink-0 align-middle text-brand-600"
    >
      <path
        d="M4 12h15m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m8.25 12.25 2.5 2.5 5-5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
