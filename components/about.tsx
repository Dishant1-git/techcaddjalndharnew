import Image from "next/image"
import { CONTACT } from "@/lib/navigation"

/** Short proof points, written the way the counsellors pitch them on a call. */
const POINTS = [
  {
    title: "An IT company first",
    body: "We ship client software, then teach from the same codebases.",
    icon: "M4 8.5h16v11H4v-11Zm5 0V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2.5M4 13.5h16",
  },
  {
    title: "Labs, not lectures",
    body: "Every batch builds a live project and defends it before a panel.",
    icon: "M4 5.5h16v13H4v-13Zm0 3.5h16M8.5 13l1.8 1.8-1.8 1.8M12.5 16.6H15",
  },
  {
    title: "Placement built in",
    body: "Mock interviews, portfolio reviews and drives with hiring partners.",
    icon: "M12 3.5 3.5 8 12 12.5 20.5 8 12 3.5ZM6.5 10v5.2c0 1.3 2.5 2.3 5.5 2.3s5.5-1 5.5-2.3V10",
  },
  {
    title: "Certified & recognised",
    body: "ISO-certified centre with industry-endorsed course completion.",
    icon: "M12 3.5 5 6v5.5c0 3.6 2.9 6.9 7 9 4.1-2.1 7-5.4 7-9V6l-7-2.5Zm-3 8.5 2.2 2.2L15.5 10",
  },
]

export function About() {
  return (
    /* overflow-hidden clips the decorative glow, which would otherwise push the
       page wider than the viewport on small screens. */
    <section
      id="about"
      className="relative overflow-hidden px-4 py-20 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-[1240px]">
        {/* --- Story + collage, balanced as one row --- */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center rounded-full border border-line bg-subtle px-4 py-1.5 text-xs font-medium tracking-wide">
              About Us
            </span>

            <h2 className="mt-6 font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance lg:text-5xl">
              Two decades of turning
              <br />
              students into engineers
            </h2>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted lg:text-lg">
              TechCadd started in Jalandhar as a small CAD training room and grew
              into an IT company that also trains the people who build with it.
              The work we deliver for clients — AI systems, cloud platforms,
              full-stack products — is the same work our students learn on.
            </p>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              That loop is the whole point. Curriculum changes when the industry
              changes, mentors are engineers who are still shipping, and every
              programme ends with something you can show a hiring manager.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href="/about"
                className="group inline-flex items-center gap-3 rounded-full bg-brand-600 py-2 pr-2 pl-7 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.85)] transition-colors duration-300 hover:bg-brand-700"
              >
                More about TechCadd
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
              </a>

              <a
                href={CONTACT.phoneHref}
                className="font-mono text-sm text-muted transition-colors duration-200 hover:text-brand-600"
              >
                {CONTACT.phone}
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
                alt="The TechCadd team and students outside the Jalandhar campus"
                className="col-span-2 aspect-[2/1] sm:aspect-[14/5]"
                sizes="(min-width: 1024px) 590px, 92vw"
              >
                <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/45 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-white/85 uppercase backdrop-blur-md">
                  Team TechCadd
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
                alt="A robotics demonstration during a TechCadd lab session"
                className="aspect-[4/3]"
                sizes="(min-width: 1024px) 290px, 45vw"
              />
            </div>
          </div>
        </div>

        {/* --- Proof points --- */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-line/70 bg-subtle p-6 transition-colors duration-300 hover:border-brand-200 hover:bg-brand-50 lg:p-7"
            >
              <span className="grid size-11 place-items-center rounded-xl border border-line bg-white text-brand-600">
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
                  <path
                    d={p.icon}
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <p className="mt-5 font-display text-lg font-bold tracking-tight">
                {p.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
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
