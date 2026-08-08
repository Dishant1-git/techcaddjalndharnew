import { COURSE_GROUPS } from "@/lib/navigation"

/**
 * Course categories — the same four groups the Courses mega menu opens with,
 * so the homepage and the navigation never drift apart.
 */

/** How many course links each card shows before collapsing into a count. */
const PREVIEW_COUNT = 4

const ICONS: Record<string, React.ReactNode> = {
  Programming: (
    <path
      d="M9 7.5 4.5 12 9 16.5M15 7.5 19.5 12 15 16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "AI & Data": (
    <path
      d="M12 4.5a3 3 0 0 0-3 3 3 3 0 0 0-1.5 5.6V16a3 3 0 0 0 4.5 2.6 3 3 0 0 0 4.5-2.6v-2.9A3 3 0 0 0 15 7.5a3 3 0 0 0-3-3Zm0 0v14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "Digital Marketing": (
    <path
      d="M4 10v4h3l5 3.5v-11L7 10H4Zm12.5-2a5 5 0 0 1 0 8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "Cyber & Cloud": (
    <path
      d="M12 3.5 5 6.5V12c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6.5l-7-3Zm-2.5 8.5 2 2 4-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

export function Categories() {
  return (
    <section id="categories" className="px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-line bg-subtle px-4 py-1.5 text-xs font-medium tracking-wide">
              Categories
            </span>
            <h2 className="mt-6 font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance lg:text-5xl">
              Pick the track
              <br />
              that fits your goal
            </h2>
          </div>

          <p className="max-w-sm text-base leading-relaxed text-muted">
            Four disciplines, one campus. Every category runs across all four
            intake formats, so you choose the subject first and the schedule
            second.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {COURSE_GROUPS.map((group) => {
            const preview = group.items.slice(0, PREVIEW_COUNT)
            const rest = group.items.length - preview.length

            return (
              <div
                key={group.title}
                className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-[0_28px_60px_-32px_rgba(15,23,42,0.5)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-600/10 text-brand-600 transition-colors duration-500 group-hover:bg-brand-600 group-hover:text-white">
                    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
                      {ICONS[group.title]}
                    </svg>
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {group.index}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                  {group.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {group.blurb}
                </p>

                <ul className="mt-5 flex-1 space-y-1.5 border-t border-line pt-5">
                  {preview.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="group/link flex items-center gap-2 text-sm text-foreground/75 transition-colors duration-200 hover:text-brand-600"
                      >
                        <span className="h-px w-2 bg-brand-600/40 transition-all duration-300 group-hover/link:w-3.5 group-hover/link:bg-brand-600" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>

                <a
                  href="/courses"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-700"
                >
                  {rest > 0 ? `+${rest} more courses` : "View courses"}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h14m-7-7 7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
