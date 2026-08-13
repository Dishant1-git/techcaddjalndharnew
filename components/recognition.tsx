import { Container } from "./container"

/**
 * Awards, recognition and accreditation.
 *
 * Lived on /about/founder, which read oddly: none of these are the founder's
 * personal awards — they are the institute's certification, its university
 * engagements and its collaborations. It belongs on /about, and moving it also
 * leaves the founder page free to be about the person.
 *
 * Extracted into a component rather than copied so there is one copy of the
 * claims. They are sourced statements, and two divergent versions of a sourced
 * claim is how a site ends up contradicting itself.
 */
type Recognition = {
  title: string
  body: string
  icon: "badge" | "handshake" | "campus" | "spark"
}

const RECOGNITION: Recognition[] = [
  {
    icon: "badge",
    title: "ISO 9001 Certified",
    body: "techcadd's public LinkedIn profile describes the organization as an ISO 9001-certified and government-registered IT institute.",
  },
  {
    icon: "handshake",
    title: "Industry–Academia Engagement",
    body: "techcadd has participated in institutional initiatives and placement activities, including a joint campus placement drive hosted by I.K. Gujral Punjab Technical University in November 2025.",
  },
  {
    icon: "campus",
    title: "Academic Collaboration",
    body: "Publicly available information also records techcadd's collaboration with educational institutions for skill development, workshops and experiential learning initiatives.",
  },
  {
    icon: "spark",
    title: "Technology & Innovation Initiatives",
    body: "techcadd has participated in AI and robotics-focused initiatives, including demonstrations involving its AI robotic dog Chi-Chi at educational and technology events.",
  },
]

export function Recognition({ tinted = false }: { tinted?: boolean }) {
  return (
    <section className={`py-20 lg:py-28 ${tinted ? "bg-subtle" : ""}`}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
            Awards, Recognition &amp; Accreditation
          </p>

          <h2
            data-reveal
            suppressHydrationWarning
            className="mt-4 font-display text-3xl leading-[1.12] font-bold tracking-tight text-ink text-balance sm:text-4xl lg:text-5xl"
          >
            Recognition built through learning, innovation and industry
            engagement
          </h2>

          <p
            data-reveal
            suppressHydrationWarning
            className="mt-5 text-base leading-relaxed text-muted lg:text-lg"
          >
            techcadd&apos;s credibility is supported not only by its training
            programs but also by its participation in industry–academia
            initiatives, campus placements, workshops, technology events and
            institutional collaborations.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-2">
          {RECOGNITION.map((item, index) => (
            <li
              key={item.title}
              data-reveal
              suppressHydrationWarning
              style={
                { "--reveal-delay": `${index * 90}ms` } as React.CSSProperties
              }
              className={`flex gap-5 rounded-2xl border border-line p-7 lg:p-8 ${
                tinted ? "bg-background" : "bg-subtle"
              }`}
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-[0_14px_32px_-14px_rgba(37,99,235,0.9)]">
                <RecognitionIcon name={item.icon} className="size-6" />
              </span>

              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Attribution, same as the mission page carries: these are drawn from
            published sources rather than being our own claims, and they are
            marked as such. */}
        <p className="mx-auto mt-12 max-w-3xl text-center text-xs leading-relaxed text-muted lg:mt-16">
          The recognitions above are drawn from publicly available information,
          institutional announcements and techcadd&apos;s own published
          profiles.
        </p>
      </Container>
    </section>
  )
}

/**
 * The four recognition marks. One component with a switch rather than four
 * exported icons, because nothing else on the site uses them and the card data
 * already names which one it wants.
 */
function RecognitionIcon({
  name,
  className,
}: {
  name: Recognition["icon"]
  className?: string
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  }

  if (name === "handshake") {
    return (
      <svg {...common}>
        <path
          d="M8 12.5 5.5 15a1.8 1.8 0 0 0 2.5 2.6l.6-.6.9.9a1.8 1.8 0 0 0 2.6-2.5l1 1a1.8 1.8 0 0 0 2.5-2.6l-3.9-3.9-1.6 1.2a2 2 0 0 1-2.5-.1L7 10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.75 8.5 6 5.75l3.25 1.5L12 6l2.75 1.25L18 5.75l3.25 2.75"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === "campus") {
    return (
      <svg {...common}>
        <path
          d="M12 3.75 21 8l-9 4.25L3 8l9-4.25Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 10.25V15c0 1.5 2.5 2.75 5.5 2.75s5.5-1.25 5.5-2.75v-4.75M20.25 9v5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === "spark") {
    return (
      <svg {...common}>
        <path
          d="M12 3.25 13.9 9l5.85 1.9-5.85 1.9L12 18.65 10.1 12.8 4.25 10.9 10.1 9 12 3.25Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M18.5 16.5 19.2 18.6l2.05.65-2.05.65-.7 2.1-.7-2.1-2.05-.65 2.05-.65.7-2.1Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path
        d="M12 2.75 14 4.6l2.7-.35.9 2.55 2.4 1.3-.85 2.6.85 2.6-2.4 1.3-.9 2.55-2.7-.35L12 18.6l-2-1.85-2.7.35-.9-2.55-2.4-1.3.85-2.6-.85-2.6 2.4-1.3.9-2.55L10 4.6l2-1.85Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m9.4 10.9 1.9 1.9 3.4-3.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
