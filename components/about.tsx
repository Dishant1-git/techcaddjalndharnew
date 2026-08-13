import Image from "next/image"
import { Container } from "./container"
import Link from "next/link"
import { ScrollHeading } from "./scroll-heading"
import { CONTACT } from "@/lib/navigation"

/** The four intakes counsellors actually enrol students into. */
const FORMATS = [
  { duration: "45 Days", label: "Summer & winter industrial training" },
  { duration: "6 Weeks", label: "University-mandated training" },
  { duration: "6 Months", label: "Industrial training with internship" },
  { duration: "Weekend", label: "Batches for working professionals" },
]

/** The journey a student moves through, start to offer letter. */
const PATH = [
  {
    step: "01",
    title: "Career counselling",
    body: "Sit with a counsellor, compare tracks and pick the one that fits your degree and goal.",
  },
  {
    step: "02",
    title: "Classroom & lab",
    body: "Small batches, daily practicals on licensed software, and doubt sessions until it clicks.",
  },
  {
    step: "03",
    title: "Live project & internship",
    body: "Build something real from our client work, then walk out with an internship letter.",
  },
  {
    step: "04",
    title: "Placement drives",
    body: "Portfolio reviews, mock interviews and drives with our hiring partner network.",
  },
]

export function About() {
  return (
    /* overflow-hidden clips the decorative glow, which would otherwise push the
       page wider than the viewport on small screens. */
    <section
      id="about"
      className="relative overflow-hidden py-20 lg:py-28"
    >
      <Container>
        {/* --- Story + collage, balanced as one row --- */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center rounded-full border border-line bg-subtle px-4 py-1.5 text-xs font-medium tracking-wide">
              About Us
            </span>

            <ScrollHeading
              lines={["Two decades of turning", "students into engineers"]}
              className="mt-6 font-display text-4xl leading-[1.05] font-bold tracking-tight lg:text-5xl"
            />

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted lg:text-lg">
              Techcadd is an IT company that trains the people who build with
              it. Every course is taught from the same stack we ship client work
              on — so the syllabus moves when the industry does, and your mentor
              is an engineer who still writes code for a living.
            </p>

            {/* Formats sit high on the page: it's the first thing a student
                asks a counsellor. */}
            <dl data-reveal suppressHydrationWarning className="mt-9 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {FORMATS.map((f) => (
                <div
                  key={f.duration}
                  className="border-l-2 border-brand-600/25 pl-4"
                >
                  <dt className="font-display text-lg font-bold tracking-tight">
                    {f.duration}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">
                    {f.label}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/courses"
                className="group inline-flex items-center gap-3 rounded-full bg-brand-600 py-2 pr-2 pl-7 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.85)] transition-colors duration-300 hover:bg-brand-700"
              >
                Find your course
                <span className="grid size-8 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
                  <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
                    <path
                      d="M5 12h14m-7-7 7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>

              <a
                href={CONTACT.phoneHref}
                className="text-sm font-medium transition-colors duration-200 hover:text-brand-600"
              >
                Talk to a counsellor
                <span className="mt-0.5 block font-mono text-xs text-muted">
                  {CONTACT.phone}
                </span>
              </a>
            </div>
          </div>

          {/* Panorama on top, two equal tiles beneath — the stack lands at the
              same height as the copy beside it. */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 -right-12 size-72 rounded-full bg-brand-500/15 blur-[90px]"
            />

            <div className="relative grid grid-cols-2 gap-4">
              {/* Taller crop on phones so the group still reads at 360px. */}
              <Photo
                src="/assets/images/about/team.jpg"
                alt="The Techcadd team and students outside the Jalandhar campus"
                className="col-span-2 aspect-[2/1] sm:aspect-[14/5]"
                sizes="(min-width: 1024px) 590px, 92vw"
              >
                <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/45 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-white/85 uppercase backdrop-blur-md">
                  Team Techcadd
                </span>
              </Photo>

              <Photo
                src="/assets/images/about/mentoring.webp"
                alt="A mentor walking students through code on a laptop"
                className="aspect-[4/3]"
                sizes="(min-width: 1024px) 290px, 45vw"
              />

              <Photo
                src="/assets/images/about/lab-demo.webp"
                alt="A robotics demonstration during a Techcadd lab session"
                className="aspect-[4/3]"
                sizes="(min-width: 1024px) 290px, 45vw"
              />
            </div>
          </div>
        </div>

        {/* --- How a programme runs --- */}
        <div className="mt-20 border-t border-line pt-14 lg:mt-28 lg:pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
              How it works
            </span>
            <h3 className="mt-4 font-display text-3xl leading-tight font-bold tracking-tight text-balance lg:text-4xl">
              From your first counselling call to your first offer
            </h3>
          </div>

          <div className="relative mt-12 lg:mt-16">
            {/* Dashed rail threading the numbered badges, hidden behind them. */}
            <div
              aria-hidden="true"
              className="absolute top-6 right-[12.5%] left-[12.5%] hidden border-t border-dashed border-line lg:block"
            />

            <ol
              data-reveal
              suppressHydrationWarning
              className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
            >
              {PATH.map((p) => (
                <li
                  key={p.step}
                  className="lg:flex lg:flex-col lg:items-center lg:text-center"
                >
                  <span className="grid size-12 place-items-center rounded-full border border-line bg-white font-display text-sm font-bold tracking-tight text-brand-600 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.5)]">
                    {p.step}
                  </span>

                  <p className="mt-5 font-display text-lg font-bold tracking-tight">
                    {p.title}
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                    {p.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

      </Container>
    </section>
  )
}

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
