import type { Metadata } from "next"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { HeroVideo } from "@/components/hero-video"
import { TeamGrid, type TeamMember } from "@/components/team-grid"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Our Founder — Mr. Gourav Gupta",
  description:
    "Mr. Gourav Gupta founded techcadd in 2016 to bridge the gap between academics and industry through practical, future-ready skills. His vision, his work with institutions, and the recognition it has earned.",
  alternates: { canonical: `${SITE.url}/about/founder` },
}

/** How he is described publicly, in the order the profile lists them. */
const DESCRIPTORS = [
  "Visionary Entrepreneur",
  "Technology Educator",
  "Skill Development Advocate",
]

/**
 * Where techcadd's focus widened to under his leadership.
 *
 * `art` names the illustration each card leads with, and `wide` marks the two
 * that take the top row. The bento is six columns: the two wide cards span
 * three each, the remaining three span two each — so both rows fill exactly and
 * there is never an orphan card sitting in a half-empty row.
 */
const FOCUS_AREAS = [
  {
    art: "chip" as const,
    wide: true,
    title: "Emerging Technologies",
    body: "Moving the catalogue beyond conventional computer education into AI, cloud, cyber security and automation.",
  },
  {
    art: "workbench" as const,
    wide: true,
    title: "Practical Training",
    body: "Learning built on projects and hands-on work rather than theory alone.",
  },
  {
    art: "network" as const,
    wide: false,
    title: "Industry Engagement",
    body: "Working with employers and institutions so what is taught tracks what is actually hired for.",
  },
  {
    art: "growth" as const,
    wide: false,
    title: "Career Development",
    body: "Counselling, placement support and career pathways treated as part of the programme, not an afterthought.",
  },
  {
    art: "spark" as const,
    wide: false,
    title: "Innovation",
    body: "Bringing new technology into the classroom early, while it is still emerging.",
  },
]

/**
 * One duration and curve for every part of the leadership card hover.
 *
 * The curve is the site's own — the same one the project cards, scroll reveals
 * and word-by-word headings use — so this section moves like the rest of the
 * page. Kept as a constant because four elements animate together and they only
 * read as a single gesture if they share the timing exactly; a literal string
 * here still gets picked up by Tailwind's scanner.
 */
const HOVER_EASE = "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"

type Engagement = { tag: string; title: string; body: string }

const ENGAGEMENTS: Engagement[] = [
  {
    tag: "IKGPTU · 2025",
    title: "Pre-placement talk at I.K. Gujral Punjab Technical University",
    body: "IKGPTU identifies Mr. Gourav Gupta as Founder & CEO of TechCADD, and hosted him for a pre-placement talk and interaction with students during TechCADD's 2025 campus placement drive.",
  },
  {
    tag: "Workshops",
    title: "Technology workshops at educational institutions",
    body: "He has participated in technology-focused workshops and discussions covering Artificial Intelligence, robotics, cyber security and other emerging technologies.",
  },
]

/**
 * The founder story, in chapters.
 *
 * Deliberately free of numbers that cannot be sourced — the periods are the
 * founding year and the present, both already stated elsewhere on the site,
 * and the claims are about approach rather than counts.
 */
const FOUNDER_STORY = [
  {
    period: "Before 2016",
    heading: "The gap he kept seeing",
    body: "Working alongside technical graduates, one pattern repeated: strong marks, complete syllabi, and no evidence. Students could describe a technology without ever having shipped anything with it, and interviewers in Mohali and Chandigarh had learned to stop asking about coursework.",
  },
  {
    period: "2016",
    heading: "techcadd opens in Jalandhar",
    body: "The institute started with a single principle carried over from that observation — that a student should leave with work an employer can open and inspect. Live client briefs went into the syllabus from the beginning rather than being added as a capstone at the end.",
  },
  {
    period: "The model",
    heading: "Practitioners in the classroom",
    body: "Trainers stayed on live delivery work instead of moving into full-time teaching, so the examples in class came from the current quarter. Small batches kept it possible for a trainer to look at every student's screen, which is what makes correction daily rather than occasional.",
  },
  {
    period: "Today",
    heading: "A network across Punjab",
    body: "techcadd now runs across Jalandhar, Ludhiana, Mohali, Hoshiarpur, Phagwara, Amritsar, Patiala, Bathinda and Mukerian, works with universities on industrial training and placement drives, and continues under Mr. Gourav Gupta as Founder and CEO.",
  },
]

/*
  Placeholder portraits.

  Local files, not a remote avatar service: the site's CSP is
  `img-src 'self' data: blob:` (next.config.mjs), so picsum.photos, pravatar and
  the rest are blocked outright and would render as broken frames. These are the
  three photographs that exist in the repo, cycled — the same stand-in that
  lib/gallery.ts uses, and for the same reason.

  TODO: drop headshots into public/assets/images/team/ and point each member's
  `photo` at their own file. Set `alt` on the portrait in components/team-grid.tsx
  to the person's name at the same time — it is empty today precisely because
  these pictures are not of the people they sit under, and naming them would
  tell a screen reader something untrue.
*/
const PLACEHOLDER_PORTRAITS = [
  "/assets/images/about/team.jpg",
  "/assets/images/about/mentoring.webp",
  "/assets/images/about/lab-demo.webp",
]

/**
 * The team, in the order given.
 *
 * TODO: only the founder's designation is filled in — it is stated publicly on
 * this page already. The rest carry the neutral "Team Member", because inventing
 * titles for real, named colleagues would put claims on the site that nobody has
 * approved. Add the second tuple entry as the real designations come in; nothing
 * else needs to change.
 */
const TEAM: TeamMember[] = (
  [
    ["Gourav Gupta", "Founder & CEO"],
    ["Shilpa Gupta"],
    ["Asmita Sehgal"],
    ["Daljeet Singh"],
    ["Amit Sharma"],
    ["Harrachneet Kaur"],
    ["Alam"],
    ["Tanisha"],
    ["Sandeep"],
    ["Anita"],
    ["Shiv"],
    ["Aman"],
  ] as const
).map(([name, role], index) => ({
  name,
  role: role ?? "Team Member",
  // Deterministic rather than random: Math.random() here would pick a different
  // picture on the server than on the client and fail hydration.
  photo: PLACEHOLDER_PORTRAITS[index % PLACEHOLDER_PORTRAITS.length],
}))

export default function FounderPage() {
  return (
    <main>
      {/* Same hero shell as /about and /about/mission-vision — one video, one
          scrim, `min-h-screen` so a short window grows the panel rather than
          pushing the name out of the bottom. */}
      <section
        data-cursor="light"
        className="relative isolate flex min-h-screen items-center overflow-hidden bg-ink pt-32 pb-16 text-white lg:pt-40 lg:pb-20"
      >
        <HeroVideo src="/assets/video/aboutus-bg.mp4" />

        <Container className="relative">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            Founder
          </span>

          {/* A name is not a sentence, so the two-tone treatment the sibling
              heroes use would have nothing to emphasise — this one is solid
              white and lets the role line underneath carry the context. */}
          <h1
            data-reveal
            suppressHydrationWarning
            className="mt-7 font-display text-5xl leading-[1.05] font-bold tracking-tight text-white text-balance sm:text-6xl lg:text-7xl"
          >
            Mr. Gourav Gupta
          </h1>

          <p
            data-reveal
            suppressHydrationWarning
            className="mt-5 font-display text-lg font-medium tracking-tight text-white/75 lg:text-xl"
          >
            Founder &amp; CEO,techcadd computer education
          </p>

          <ul
            data-reveal
            suppressHydrationWarning
            className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/60"
          >
            {DESCRIPTORS.map((item, index) => (
              <li key={item} className="inline-flex items-center gap-3">
                {/* The bullet belongs to the item that follows it, so it wraps
                    with that item instead of being stranded at a line end. */}
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="size-1 rounded-full bg-accent-400"
                  />
                )}
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/*
        The story. Copy on the left, portrait on the right, centred against each
        other — the photograph keeps a fixed portrait ratio at every width rather
        than stretching to the text, because a founder portrait cropped to
        whatever height the paragraph happens to need is a worse picture.
      */}
      <section className="bg-subtle py-20 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-20">
            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
                The founder
              </p>

              <h2
                data-reveal
                suppressHydrationWarning
                className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
              >
                Making young people{" "}
                <span className="text-brand-600">capable and confident</span>{" "}
                with technology.
              </h2>

              <div
                data-reveal
                suppressHydrationWarning
                className="mt-7 space-y-5 text-base leading-relaxed text-muted lg:text-[17px]"
              >
                <p>
                  Mr. Gourav Gupta founded techcadd in 2016 with a vision of
                  making young people more capable and confident in using
                  technology and building careers in the digital economy.
                </p>
                <p>
                  Under his leadership, techcadd has expanded its focus beyond
                  conventional computer education into emerging technologies,
                  practical training, industry engagement, career development
                  and innovation.
                </p>
              </div>

              {/* Sign-off, in place of the handwritten signature the layout
                  would otherwise carry — the rule does the same job of closing
                  the block without needing an asset that does not exist. */}
              <div className="mt-9 border-t border-line pt-6">
                <p className="font-display text-lg font-bold tracking-tight text-ink">
                  Mr. Gourav Gupta
                </p>
                <p className="mt-1 text-sm text-muted">
                  Founder &amp; CEO, techcadd computer education
                </p>
              </div>
            </div>

            {/*
              Monogram panel, standing in for the portrait.

              TODO: when the photograph is available, put it at
              public/assets/images/about/founder.jpg and swap this block for:

                <Image
                  src="/assets/images/about/founder.jpg"
                  alt="Mr. Gourav Gupta, Founder and CEO of techcadd"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />

              An <Image> pointing at a file that is not there 404s on every
              request and logs an error in the dev terminal, so this holds the
              same frame and ratio without asking for an asset that does not
              exist yet.
            */}
            <div
              data-reveal
              suppressHydrationWarning
              className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-3xl border border-line bg-linear-to-br from-brand-50 to-subtle text-center"
            >
              <div>
                <span
                  aria-hidden="true"
                  className="font-display text-7xl font-bold tracking-tight text-brand-600/25 lg:text-8xl"
                >
                  GG
                </span>

                <span
                  aria-hidden="true"
                  className="mx-auto mt-6 block h-0.5 w-14 rounded-full bg-linear-to-r from-brand-600 to-accent-400"
                />

                <p className="mt-6 font-display text-base font-bold tracking-tight text-ink">
                  Mr. Gourav Gupta
                </p>
                <p className="mt-1 text-sm text-muted">Founder &amp; CEO</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/*
        The one idea the whole page hangs on, given a band of its own. Centred
        and short on purpose: it is the only thing in this section, so it is read
        rather than skimmed past inside a column of prose.
      */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              His vision
            </p>

            <p className="mt-6 text-base text-muted lg:text-lg">
              His vision centres on one fundamental idea:
            </p>

            <blockquote
              data-reveal
              suppressHydrationWarning
              className="mt-5 font-display text-2xl leading-[1.2] font-bold tracking-tight text-ink text-balance sm:text-3xl lg:text-4xl"
            >
              Bridge the gap between academics and industry through practical,
              future-ready skills.
            </blockquote>

            <span
              aria-hidden="true"
              className="mx-auto mt-10 block h-0.5 w-24 rounded-full bg-linear-to-r from-brand-600 to-accent-400"
            />
          </div>

          <div className="mt-16 text-center lg:mt-24">
            {/* Rule-and-label eyebrow: the bar is a separate element rather
                than a "|" character, so it keeps its weight and alignment
                independently of the font. */}
            <p className="flex items-center justify-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-3.5 w-0.5 rounded-full bg-brand-600"
              />
              <span className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
                Leadership
              </span>
            </p>

            <h3
              data-reveal
              suppressHydrationWarning
              className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-[1.15] font-bold tracking-tight text-ink text-balance lg:text-4xl"
            >
              Under his leadership
            </h3>
          </div>

          {/*
            Bento grid. Six columns at `lg` so the two wide cards can take three
            each on the first row and the three narrow ones take two each on the
            second — the split lives in the data as `wide`, not in index maths,
            so reordering the list cannot silently break the layout.

            Below `lg` it drops to two columns and the last card spans both,
            which is what keeps five cards from leaving a gap at that width.
          */}
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-6 lg:gap-6">
            {FOCUS_AREAS.map((area, index) => (
              <li
                key={area.title}
                data-reveal
                suppressHydrationWarning
                /* Staggered left to right: all five arrive together, and firing
                   at once would read as one block appearing rather than a set
                   being laid down. */
                style={
                  { "--reveal-delay": `${index * 80}ms` } as React.CSSProperties
                }
                /*
                  This element carries the reveal and the grid span only. The
                  card itself is the child below, and the split is load-bearing
                  for two separate reasons.

                  Specificity: the scroll reveal ends on
                  `.reveal-ready [data-reveal].is-visible { transform: none }`,
                  which is (0,3,0). A Tailwind `hover:-translate-y-2` is
                  (0,2,0), so putting the lift on this same element loses to the
                  reveal and the card never moves at all. The child is not a
                  `[data-reveal]`, so nothing overrides it.

                  Hit area: a element that moves out from under the pointer
                  stops being hovered, drops back, is hovered again, and
                  oscillates — the classic lift jitter. `:hover` on this static
                  wrapper stays true while its descendant travels, because
                  hit-testing follows the DOM, not the moved box.
                */
                className={`group ${
                  area.wide ? "lg:col-span-3" : "sm:last:col-span-2 lg:col-span-2"
                }`}
              >
                {/*
                  `h-full` so cards still stretch to the tallest in the row now
                  that a wrapper sits between them and the grid.

                  Three things make the hover read as smooth rather than as a
                  jump: the site's own easing curve at the same 0.5s the project
                  cards use, so the motion matches the rest of the page; a
                  resting shadow for the hover shadow to interpolate *from*,
                  since animating out of `none` pops it in at full strength; and
                  `transform-gpu`, which puts the card on its own layer so the
                  8px travel cannot land on a subpixel and shimmer.

                  Nothing here affects layout: `translate` is a transform, so it
                  cannot reflow its neighbours, and the border is present at the
                  same width in both states — only its colour changes — so the
                  box never resizes and no text can shift by a pixel.

                  Reduced motion cancels the *travel* only. Killing the whole
                  transition there would snap the border, shadow and background
                  on instantly — the abrupt effect the setting exists to avoid,
                  not a gentler version of it. A colour fade is not motion.
                */}
                <div
                  className={`flex h-full transform-gpu flex-col rounded-2xl border border-line bg-subtle p-5 shadow-[0_1px_2px_-1px_rgba(15,23,42,0.06)] transition-[transform,box-shadow,border-color,background-color] ${HOVER_EASE} group-hover:-translate-y-2 group-hover:border-brand-600/40 group-hover:bg-background group-hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.32)] motion-reduce:group-hover:translate-y-0 lg:p-6`}
                >
                  {/* The panel is white against the card's tinted ground, which
                      gives the art an edge to sit on without needing a second
                      border colour. On hover the two trade places — the card
                      lightens to white while the panel takes the brand tint —
                      so neither changes its contrast against the text. */}
                  <div
                    className={`grid h-44 place-items-center overflow-hidden rounded-xl border border-line/70 bg-background transition-colors ${HOVER_EASE} group-hover:border-brand-600/25 group-hover:bg-brand-50/60 lg:h-48`}
                  >
                    {/* Scaled from its own centre rather than the card's, and
                        clipped by the panel's `overflow-hidden`, so the art
                        grows into the frame instead of past its corners. */}
                    <div
                      className={`grid size-full transform-gpu place-items-center transition-transform ${HOVER_EASE} group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none`}
                    >
                      <FocusArt name={area.art} />
                    </div>
                  </div>

                  <h4
                    className={`mt-6 font-display text-lg font-bold tracking-tight text-ink transition-colors ${HOVER_EASE} group-hover:text-brand-600`}
                  >
                    {area.title}
                  </h4>

                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {area.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Industry and academia. Two entries, so a grid of equal cards rather
          than a timeline — there is no sequence to draw yet. */}
      <section className="bg-subtle py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              Engagement
            </p>

            <h2
              data-reveal
              suppressHydrationWarning
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Present where students are
            </h2>

            <p
              data-reveal
              suppressHydrationWarning
              className="mt-5 text-base leading-relaxed text-muted lg:text-lg"
            >
              His involvement extends into technology awareness and
              industry–academia engagement, on campus and at technology events.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-2">
            {ENGAGEMENTS.map((item, index) => (
              <li
                key={item.title}
                data-reveal
                suppressHydrationWarning
                style={
                  { "--reveal-delay": `${index * 110}ms` } as React.CSSProperties
                }
                className="flex flex-col rounded-2xl border border-line bg-background p-7 lg:p-9"
              >
                <span className="inline-flex self-start rounded-full bg-brand-50 px-3 py-1.5 font-mono text-[11px] font-medium tracking-[0.14em] text-brand-700 uppercase">
                  {item.tag}
                </span>

                <h3 className="mt-5 font-display text-xl leading-snug font-bold tracking-tight text-ink text-balance lg:text-2xl">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted lg:text-[15px]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* His belief, on ink — the page's one dark beat, placed between the two
          evidence sections so the reading has somewhere to pause. */}
      <section data-cursor="light" className="bg-ink py-20 text-white lg:py-28">
        <Container className="text-center">
          <p className="font-mono text-xs tracking-[0.22em] text-accent-400 uppercase">
            His belief
          </p>

          <blockquote
            data-reveal
            suppressHydrationWarning
            className="mx-auto mt-6 max-w-4xl font-display text-3xl leading-[1.14] font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl"
          >
            &ldquo;The future belongs to learners who continuously adapt,
            innovate and build.&rdquo;
          </blockquote>

          <p className="mt-8 text-sm text-white/55">
            Mr. Gourav Gupta, Founder &amp; CEO
          </p>
        </Container>
      </section>

      {/*
        The founder's story, in place of the recognition grid that used to sit
        here — those are the institute's certifications and university
        engagements rather than anything personal, so they moved to /about.

        Told as a chaptered narrative rather than a stat row: this is the one
        page on the site where the reader has come for a person, and a person
        is the one thing a metric cannot carry.
      */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              Our Founder Story
            </p>

            <h2
              data-reveal
              suppressHydrationWarning
              className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              From one classroom in Jalandhar to a network across Punjab
            </h2>

            <p
              data-reveal
              suppressHydrationWarning
              className="mt-5 text-base leading-relaxed text-muted lg:text-lg"
            >
              techcadd began with a single observation that has not changed
              since: students were finishing technical degrees without ever
              having built anything someone would pay for.
            </p>
          </div>

          <ol className="mx-auto mt-14 max-w-3xl lg:mt-16">
            {FOUNDER_STORY.map((chapter, index) => (
              <li
                key={chapter.heading}
                data-reveal
                suppressHydrationWarning
                style={
                  { "--reveal-delay": `${index * 90}ms` } as React.CSSProperties
                }
                /* The rule is drawn on the list item rather than between them
                   so the last chapter does not trail a line into whitespace. */
                className="relative border-l border-line pb-10 pl-8 last:border-transparent last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 -left-[7px] size-3.5 rounded-full border-4 border-background bg-brand-600"
                />

                <p className="font-mono text-xs tracking-[0.18em] text-brand-600 uppercase">
                  {chapter.period}
                </p>

                <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink lg:text-2xl">
                  {chapter.heading}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted lg:text-base">
                  {chapter.body}
                </p>
              </li>
            ))}
          </ol>

          <figure className="mx-auto mt-14 max-w-3xl rounded-2xl border border-line bg-subtle p-8 lg:mt-16 lg:p-10">
            <blockquote className="font-display text-lg leading-snug font-bold tracking-tight text-ink text-balance lg:text-2xl">
              &ldquo;A certificate says you attended. A project someone can open
              says you can do the work. We built techcadd around the
              second.&rdquo;
            </blockquote>
            <figcaption className="mt-5 text-sm text-muted">
              Mr. Gourav Gupta, Founder &amp; CEO
            </figcaption>
          </figure>
        </Container>
      </section>

      {/*
        The legacy strip. Two dates with a rule between them — the rule is the
        decade, so it grows to whatever space is left rather than being a fixed
        width, and the pair stacks with the rule dropped below `sm` where there
        is no horizontal room for it.
      */}
      <section className="bg-subtle py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              A growing legacy
            </p>

            <div
              data-reveal
              suppressHydrationWarning
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            >
              <span className="font-display text-4xl font-bold tracking-tight text-ink lg:text-5xl">
                2016
              </span>

              <span
                aria-hidden="true"
                className="hidden h-0.5 w-24 rounded-full bg-linear-to-r from-brand-600 to-accent-400 sm:block lg:w-32"
              />

              <span className="font-display text-4xl font-bold tracking-tight text-brand-600 lg:text-5xl">
                Today
              </span>
            </div>

            <p
              data-reveal
              suppressHydrationWarning
              className="mt-8 text-base leading-relaxed text-muted lg:text-lg"
            >
              From a vision to make technology education more accessible, to
              today&apos;s focus on AI, automation, cloud, cyber security and
              industry-ready skills — techcadd continues to evolve with the
              technology landscape.
            </p>
          </div>
        </Container>
      </section>

      {/*
        The team, last before the CTA and on the plain ground.

        The tinted inset panel that used to frame this is gone with the
        travelling lanes it was built for. A grid needs no frame — the cards
        are their own edges — and on the plain ground they align with the
        container gutter like every other section's content.
      */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-grid size-12 place-items-center rounded-2xl border border-line bg-background text-brand-600 shadow-[0_10px_28px_-16px_rgba(15,23,42,0.45)]">
              <TeamIcon />
            </span>

            <h2
              data-reveal
              suppressHydrationWarning
              className="mt-5 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              Meet Our Team
            </h2>

            <p
              data-reveal
              suppressHydrationWarning
              className="mt-4 text-base leading-relaxed text-muted lg:text-lg"
            >
              Trainers, mentors and counsellors who keep the classrooms running
              and the students moving.
            </p>
          </div>

          <TeamGrid members={TEAM} />
        </Container>
      </section>

      <Cta />
    </main>
  )
}

/** The badge above “Meet Our Team” — a group of three. */
function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M7.2 18.2a4.8 4.8 0 0 1 9.6 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M18.4 9.6a2.3 2.3 0 1 0-1.6-4M21 16.8a3.6 3.6 0 0 0-2.8-3.5M5.6 9.6a2.3 2.3 0 1 1 1.6-4M3 16.8a3.6 3.6 0 0 1 2.8-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * The five leadership illustrations.
 *
 * Abstract line art rather than photographs: these are areas of focus, not
 * things that can be photographed, and vector art stays crisp at any density
 * while costing no request — the same reasoning the panel textures are built
 * on. Colours are read from the theme tokens, so a palette change carries
 * through here without touching this file.
 */
function FocusArt({ name }: { name: (typeof FOCUS_AREAS)[number]["art"] }) {
  /* One frame for all five, so every illustration is drawn on the same grid
     and they optically match across cards of different widths. */
  const frame = {
    viewBox: "0 0 200 140",
    className: "h-full w-full px-6 py-4",
    fill: "none",
    "aria-hidden": true as const,
  }

  const line = "var(--color-line)"
  const brand = "var(--color-brand-600)"

  if (name === "workbench") {
    return (
      <svg {...frame}>
        <rect x="26" y="24" width="148" height="92" rx="10" stroke={line} strokeWidth="3" />
        <path d="M26 46h148" stroke={line} strokeWidth="3" />
        <g fill={line}>
          <circle cx="41" cy="35" r="3.5" />
          <circle cx="53" cy="35" r="3.5" />
          <circle cx="65" cy="35" r="3.5" />
        </g>
        <g fill={line}>
          <rect x="40" y="60" width="64" height="7" rx="3.5" />
          <rect x="40" y="74" width="96" height="7" rx="3.5" />
          <rect x="40" y="88" width="44" height="7" rx="3.5" />
        </g>
        {/* The one solid element — it reads as the thing being built. */}
        <rect x="98" y="84" width="50" height="17" rx="8.5" fill={brand} />
      </svg>
    )
  }

  if (name === "network") {
    return (
      <svg {...frame}>
        <g stroke={line} strokeWidth="2.5">
          <path d="M100 70 54 44M100 70l46-26M100 70 54 96M100 70l46 26" />
        </g>
        <circle cx="100" cy="70" r="38" stroke={line} strokeWidth="2" strokeDasharray="4 7" />
        <circle cx="100" cy="70" r="20" fill={brand} fillOpacity="0.12" stroke={brand} strokeWidth="2.5" />
        <circle cx="100" cy="70" r="7" fill={brand} />
        {/* Filled with the page ground, so each node punches a clean hole in
            the spoke running underneath it. */}
        <g fill="var(--color-background)" stroke={line} strokeWidth="2.5">
          <circle cx="54" cy="44" r="11" />
          <circle cx="146" cy="44" r="11" />
          <circle cx="54" cy="96" r="11" />
          <circle cx="146" cy="96" r="11" />
        </g>
      </svg>
    )
  }

  if (name === "growth") {
    return (
      <svg {...frame}>
        <path d="M32 112h136" stroke={line} strokeWidth="3" strokeLinecap="round" />
        <g fill={line}>
          <rect x="42" y="88" width="16" height="24" rx="4" />
          <rect x="68" y="76" width="16" height="36" rx="4" />
          <rect x="94" y="82" width="16" height="30" rx="4" />
        </g>
        <g fill={brand}>
          <rect x="120" y="60" width="16" height="52" rx="4" fillOpacity="0.5" />
          <rect x="146" y="42" width="16" height="70" rx="4" />
        </g>
        {/* Rides ten units above every bar top, so the trend never collides
            with the columns it is describing. */}
        <path
          d="M50 78 76 66l26 6 26-22 26-18"
          stroke={brand}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 6"
        />
      </svg>
    )
  }

  if (name === "spark") {
    return (
      <svg {...frame}>
        <g stroke={line} strokeWidth="3" strokeLinecap="round">
          <path d="M100 18v10M64 34l7 7M136 34l-7 7M46 70h10M144 70h10" />
        </g>
        <circle cx="100" cy="66" r="28" fill={brand} fillOpacity="0.1" stroke={brand} strokeWidth="2.5" />
        <path
          d="M92 62c0-6 4-10 8-10s8 4 8 10c0 4-3 6-4 10h-8c-1-4-4-6-4-10Z"
          stroke={brand}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <g stroke={line} strokeWidth="3" strokeLinecap="round">
          <path d="M90 100h20M93 110h14" />
        </g>
      </svg>
    )
  }

  return (
    <svg {...frame}>
      <g stroke={line} strokeWidth="3" strokeLinecap="round">
        <path d="M76 34V20M100 34V20M124 34V20" />
        <path d="M76 106v14M100 106v14M124 106v14" />
        <path d="M64 58H50M64 70H50M64 82H50" />
        <path d="M136 58h14M136 70h14M136 82h14" />
      </g>
      <rect x="64" y="34" width="72" height="72" rx="14" stroke={line} strokeWidth="3" />
      <rect
        x="82"
        y="52"
        width="36"
        height="36"
        rx="8"
        fill={brand}
        fillOpacity="0.12"
        stroke={brand}
        strokeWidth="2.5"
      />
      <path d="M164 24l3.5 9 9 3.5-9 3.5-3.5 9-3.5-9-9-3.5 9-3.5 3.5-9Z" fill={brand} fillOpacity="0.55" />
    </svg>
  )
}
