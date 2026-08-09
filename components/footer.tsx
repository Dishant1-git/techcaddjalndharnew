import Image from "next/image"
import Link from "next/link"
import { siFacebook, siInstagram, siX, siYoutube } from "simple-icons"
import {
  CONTACT,
  COURSE_GROUPS,
  NAV_ITEMS,
  QUICK_LINKS,
  type NavLink,
} from "@/lib/navigation"

/** simple-icons omits the LinkedIn mark (trademark policy), so it ships inline. */
const LINKEDIN_PATH =
  "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"

const SOCIALS = [
  { path: siInstagram.path, href: "https://instagram.com/techcadd", label: "Instagram" },
  { path: LINKEDIN_PATH, href: "https://linkedin.com/company/techcadd", label: "LinkedIn" },
  { path: siFacebook.path, href: "https://facebook.com/techcadd", label: "Facebook" },
  { path: siYoutube.path, href: "https://youtube.com/@techcadd", label: "YouTube" },
  { path: siX.path, href: "https://x.com/techcadd", label: "X" },
]

/** Mega-menu groups double as the footer's course column. */
const COURSE_LINKS: NavLink[] = COURSE_GROUPS.map((g) => ({
  label: g.title,
  href: `/courses#${g.title.toLowerCase().replace(/[^a-z]+/g, "-")}`,
}))

/** Everything in the top nav except Home and Courses (which has its own column). */
const COMPANY_LINKS: NavLink[] = NAV_ITEMS.filter(
  (i) => i.href !== "/" && !i.groups,
).map(({ label, href }) => ({ label, href }))

export function Footer() {
  return (
    /* Flat surface by design — the blue wash belongs to the CTA directly
       above, so the footer stays quiet and doesn't compete with it. */
    <footer className="relative overflow-hidden bg-subtle px-4 pt-16 pb-6 lg:px-8 lg:pt-24 lg:pb-10">
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[1.75rem] border border-line/70 bg-white shadow-[0_40px_90px_-40px_rgba(42,44,94,0.45)] lg:rounded-[2.5rem]">
        {/* --- Oversized wordmark background --- */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-[0.16em] block bg-linear-to-b from-ink/[0.13] to-brand-600/0 bg-clip-text text-center font-display text-[clamp(4.5rem,21vw,17rem)] leading-none font-bold tracking-tighter text-transparent select-none"
        >
          techcadd.
        </span>

        <div className="relative px-6 pt-12 pb-8 sm:px-10 lg:px-16 lg:pt-16 lg:pb-10">
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-10">
            {/* --- Brand --- */}
            <div className="max-w-sm">
              <Link href="/" className="block" aria-label="TechCadd home">
                <Image
                  src="/assets/icon/tce.png"
                  alt="TechCadd — Your Skill & Technology Partner"
                  width={952}
                  height={262}
                  className="h-14 w-auto"
                />
              </Link>

              <p className="mt-5 text-sm leading-relaxed text-muted">
                An IT company and technology institute — AI, cloud, cybersecurity
                and full-stack engineering, plus the training that builds the
                teams behind it.
              </p>

              <a
                href={CONTACT.emailHref}
                className="mt-7 inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold tracking-wide text-white shadow-[0_14px_34px_-14px_rgba(42,44,94,0.9)] transition-colors duration-300 hover:bg-brand-600"
              >
                {CONTACT.email}
              </a>

              <a
                href={CONTACT.phoneHref}
                className="mt-4 block font-mono text-sm text-muted transition-colors hover:text-brand-600"
              >
                {CONTACT.phone}
              </a>
            </div>

            <FooterCol title="Courses" links={COURSE_LINKS} />
            <FooterCol title="Company" links={COMPANY_LINKS} />
            <FooterCol title="Support" links={QUICK_LINKS} />
          </div>

          {/* --- Bottom bar --- */}
          <div className="mt-14 flex flex-col gap-6 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-20">
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} TechCadd. Built in{" "}
              <span className="font-medium text-ink">Jalandhar</span> &{" "}
              <span className="font-medium text-ink">Mohali</span>.
            </p>

            <div className="flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="grid size-9 place-items-center rounded-full bg-ink/[0.06] text-ink transition-colors duration-300 hover:bg-ink hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: readonly NavLink[] }) {
  return (
    <div>
      <p className="font-display text-lg font-semibold tracking-tight text-ink">
        {title}
      </p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="text-sm text-muted transition-colors duration-200 hover:text-brand-600"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
