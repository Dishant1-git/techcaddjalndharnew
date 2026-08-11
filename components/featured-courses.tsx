/**
 * Featured courses — a bento grid of frosted glass cards.
 *
 * Layout on lg (3 columns, 5 row-units):
 *   ┌───────┬───────┬───────┐
 *   │ Cyber │ Data  │       │  rows 1-2 / AI spans 1-3
 *   ├───────┴───────┤  AI   │
 *   │  Full-Stack   ├───────┤  Full-Stack spans cols 1-2, rows 3-5
 *   │               │ Mktg  │  Marketing rows 4-5
 *   └───────────────┴───────┘
 * Auto-placement lands every card without explicit coordinates, so the
 * order of the JSX below is load-bearing.
 */

import Link from "next/link"
import { Container } from "./container"
import { ScrollHeading } from "./scroll-heading"

const PLACEMENT_TREND = "M0 64 C16 60 26 42 40 40 C54 38 60 56 74 57 C88 58 96 22 112 18 C128 14 132 48 146 52 C160 56 168 36 182 32 C196 28 204 50 218 54 C232 58 244 42 260 38"

const STACK_ROWS = [
  { label: "React & Next.js", meta: "Frontend", badge: "+42%" },
  { label: "Node & Express", meta: "Backend", badge: "+31%" },
  { label: "MongoDB & SQL", meta: "Database", badge: "+27%" },
]

const ALERTS = [
  { title: "New batch alert", body: "Digital Marketing — starts Monday" },
  { title: "Placement drive", body: "14 companies hiring this month" },
]

export function FeaturedCourses() {
  return (
    <section id="courses" className="relative overflow-hidden py-20 lg:py-28">
      {/* Colour beneath the glass — without something to refract, frosted
          panels just read as grey boxes. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[8%] size-[32rem] rounded-full bg-brand-400/35 blur-[110px]" />
        <div className="absolute top-1/3 right-[4%] size-[28rem] rounded-full bg-accent-400/30 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 size-[30rem] rounded-full bg-violet-400/25 blur-[120px]" />
        <div className="absolute right-1/4 bottom-10 size-[22rem] rounded-full bg-rose-300/25 blur-[110px]" />
      </div>

      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/60 bg-white/60 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            Featured Courses
          </span>
          <ScrollHeading
            lines={["Courses that get you hired"]}
            className="mt-6 font-display text-4xl leading-[1.05] font-bold tracking-tight lg:text-6xl"
          />
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted lg:text-lg">
            Industry-built curriculum, live projects and a placement cell behind
            every programme.
          </p>
        </div>

        <div
          data-reveal
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[8rem]"
        >
          {/* --- 1. Cybersecurity --- */}
          <Card href="/courses/cybersecurity" className="lg:row-span-2">
            <CardTitle>Cybersecurity &amp; Ethical Hacking</CardTitle>

            <div className="flex flex-1 items-center justify-center py-6">
              <svg viewBox="0 0 96 108" className="h-32 w-auto drop-shadow-[0_18px_28px_rgba(37,99,235,0.35)]" aria-hidden="true">
                <defs>
                  <linearGradient id="fc-shield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="55%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>
                <path
                  d="M48 2 6 18v38c0 26 20 42 42 50 22-8 42-24 42-50V18L48 2Z"
                  fill="url(#fc-shield)"
                />
                <path
                  d="M48 2 6 18v38c0 26 20 42 42 50V2Z"
                  fill="#ffffff"
                  opacity="0.12"
                />
                <path
                  d="M48 34v20m0 10v2"
                  stroke="#ffffff"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="flex flex-wrap gap-2">
              <Pill>Live pentest labs</Pill>
              <Pill>CEH-aligned syllabus</Pill>
            </div>
          </Card>

          {/* --- 2. Data Science --- */}
          <Card href="/courses/data-science" className="lg:row-span-2">
            <CardTitle>Data Science &amp; Analytics</CardTitle>

            <div className="relative mt-6 flex-1 overflow-hidden rounded-2xl border border-white/60 bg-white/45 p-4 backdrop-blur-md">
              <div className="mb-3 flex justify-end gap-2">
                <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white">
                  Live
                </span>
                <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold text-white">
                  +38%
                </span>
              </div>

              <svg viewBox="0 0 260 90" className="w-full" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="fc-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${PLACEMENT_TREND} L260 90 L0 90 Z`} fill="url(#fc-area)" />
                <path
                  d={PLACEMENT_TREND}
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M112 18v72"
                  stroke="#0f172a"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.35"
                />
                <circle cx="112" cy="18" r="6" fill="#0f172a" />
                <circle cx="112" cy="18" r="2.5" fill="#ffffff" />
              </svg>

              <div className="mt-2 flex justify-between font-mono text-[9px] tracking-wide text-muted">
                {["2020", "2021", "2022", "2023", "2024", "2025"].map((y) => (
                  <span key={y}>{y}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* --- 3. Artificial Intelligence (dark glass) --- */}
          <Card
            href="/courses/artificial-intelligence"
            dark
            className="lg:row-span-3"
          >
            <CardTitle dark>AI &amp; Machine Learning</CardTitle>

            <div className="flex flex-1 flex-col items-center justify-center">
              <span className="bg-gradient-to-b from-brand-300 via-brand-500 to-brand-700 bg-clip-text font-display text-[clamp(3.5rem,9vw,5.5rem)] leading-none font-extrabold tracking-tight text-transparent drop-shadow-[0_0_35px_rgba(37,99,235,0.55)]">
                AI
              </span>
              {/* Mirrored echo, faded into the card floor. */}
              <span
                aria-hidden="true"
                className="-mt-2 scale-y-[-1] bg-gradient-to-b from-brand-500/45 to-transparent bg-clip-text font-display text-[clamp(3.5rem,9vw,5.5rem)] leading-none font-extrabold tracking-tight text-transparent blur-[1px]"
              >
                AI
              </span>
            </div>

            <p className="text-center text-sm leading-relaxed text-white/70">
              Build models, agents and RAG pipelines
              <br />
              that survive production.
            </p>
          </Card>

          {/* --- 4. Full-Stack Development --- */}
          <Card
            href="/courses/mern-stack"
            className="sm:col-span-2 lg:row-span-3"
          >
            <div className="text-center">
              <CardTitle>Full-Stack Development</CardTitle>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                MERN, MEAN and PHP stacks taught end to end — schema design,
                APIs, interfaces and deployment.
              </p>
            </div>

            <div className="mt-8 flex flex-1 flex-wrap items-end justify-center gap-5 sm:flex-nowrap">
              {/* Placement donut */}
              <div className="w-full max-w-[220px] -rotate-3 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.45)] backdrop-blur-lg">
                <div className="relative mx-auto size-24">
                  <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden="true">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="185 201"
                    />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center font-display text-xl font-bold">
                    92%
                  </span>
                </div>
                <p className="mt-3 text-center text-xs text-muted">
                  placement rate, 2025 batches
                </p>
              </div>

              {/* Stack rows */}
              <div className="w-full max-w-[290px] rotate-2 space-y-2 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.45)] backdrop-blur-lg">
                {STACK_ROWS.map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-foreground/5 text-brand-600">
                      <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
                        <path
                          d="M9 7.5 4.5 12 9 16.5M15 7.5 19.5 12 15 16.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {row.label}
                      </span>
                      <span className="block text-xs text-muted">{row.meta}</span>
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      {row.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* --- 5. Digital Marketing --- */}
          <Card href="/courses/digital-marketing" className="lg:row-span-2">
            <CardTitle>Digital Marketing</CardTitle>

            <div className="mt-5 flex-1 space-y-2">
              {ALERTS.map((a, i) => (
                <div
                  key={a.title}
                  className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/70 p-3 backdrop-blur-lg"
                  style={{ opacity: 1 - i * 0.25 }}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
                      <path
                        d="M12 4a6 6 0 0 0-6 6v4l-1.5 3h15L18 14v-4a6 6 0 0 0-6-6Zm-2.5 15a2.5 2.5 0 0 0 5 0"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted">{a.title}</span>
                    <span className="block truncate text-sm font-semibold">
                      {a.body}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-3 rounded-full bg-brand-600 py-2 pr-2 pl-7 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.85)] transition-colors duration-300 hover:bg-brand-700"
          >
            Browse all courses
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
        </div>
      </Container>
    </section>
  )
}

function Card({
  href,
  dark = false,
  className = "",
  children,
}: {
  href: string
  dark?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] p-6 transition-all duration-500 hover:-translate-y-1 ${
        dark
          ? "border border-white/10 bg-slate-950/85 text-white shadow-[0_30px_70px_-30px_rgba(2,6,23,0.9)] backdrop-blur-2xl hover:bg-slate-950/90"
          : "border border-white/60 bg-white/55 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur-2xl hover:bg-white/70"
      } ${className}`}
    >
      {/* Top-edge sheen — what sells the panel as glass rather than paint. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-px ${
          dark
            ? "bg-gradient-to-r from-transparent via-white/25 to-transparent"
            : "bg-gradient-to-r from-transparent via-white to-transparent"
        }`}
      />
      {children}
    </Link>
  )
}

function CardTitle({
  dark = false,
  children,
}: {
  dark?: boolean
  children: React.ReactNode
}) {
  return (
    <h3
      className={`text-center font-display text-lg font-bold tracking-tight text-balance lg:text-xl ${
        dark ? "text-white" : ""
      }`}
    >
      {children}
    </h3>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
      {children}
    </span>
  )
}
