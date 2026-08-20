import Image from "next/image"
import { loadContact } from "@/lib/content"
import Link from "next/link"
import { Container } from "./container"
import { PrefetchLink } from "./prefetch-link"
import { siFacebook, siInstagram, siX, siYoutube } from "simple-icons"
import {
  COURSE_GROUPS,
  groupSlug,
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
  href: `/courses#${groupSlug(g.title)}`,
}))

/** Everything in the top nav except Home and the mega menus (Courses has its
 *  own column). Dropdown items collapse back to their top-level link. */
const COMPANY_LINKS: NavLink[] = NAV_ITEMS.filter(
  (i) => i.href !== "/" && !i.groups,
).map(({ label, href }) => ({ label, href }))

export async function Footer() {
  const contact = await loadContact()

  return (
    /* Flat surface by design — the blue wash belongs to the CTA directly
       above, so the footer stays quiet and doesn't compete with it. */
    <footer className="relative overflow-hidden border-t border-line bg-subtle pt-20 pb-8 lg:pt-28 lg:pb-10">
      {/* --- Oversized wordmark background ---
          Drawn as SVG text rather than a CSS font-size: `textLength` forces the
          word to exactly the viewBox width, so it fills the footer edge to edge
          and can never be clipped by `overflow-hidden`, which is what a `vw`
          size did, because the word's real width depends on font metrics no
          `clamp()` can know. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 190"
        /* Height follows the width so the letterforms keep their proportions —
           forcing a fixed height with preserveAspectRatio="none" would squash
           them. */
        className="pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full select-none"
      >
        <defs>
          <linearGradient id="footer-wordmark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.13" />
            <stop offset="100%" stopColor="var(--color-brand-600)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <text
          x="500"
          y="176"
          textAnchor="middle"
          textLength="980"
          /* `spacing` tightens the gaps only — `spacingAndGlyphs` would stretch
             the letterforms and the wordmark would stop being the wordmark. */
          lengthAdjust="spacing"
          className="font-display"
          style={{ fontSize: 200, fontWeight: 700 }}
          fill="url(#footer-wordmark)"
        >
          techcadd.
        </text>
      </svg>

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-10">
            {/* --- Brand --- */}
            <div className="max-w-sm">
              <Link href="/" className="block" aria-label="techcadd home">
                <Image
                  src="/assets/icon/tce.png"
                  alt="techcadd — Your Skill & Technology Partner"
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
                href={contact.emailHref}
                className="mt-7 inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold tracking-wide text-white shadow-[0_14px_34px_-14px_rgba(42,44,94,0.9)] transition-colors duration-300 hover:bg-brand-600"
              >
                {contact.email}
              </a>

              <a
                href={contact.phoneHref}
                className="mt-4 block font-mono text-sm text-muted transition-colors hover:text-brand-600"
              >
                {contact.phone}
              </a>
            </div>

            <FooterCol title="Courses" links={COURSE_LINKS} />
            <FooterCol title="Company" links={COMPANY_LINKS} />
            <FooterCol title="Support" links={QUICK_LINKS} />
          </div>

          {/* --- Bottom bar --- */}
          <div className="mt-14 flex flex-col gap-6 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-20">
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} techcadd computer education. Built in{" "}
              <span className="font-medium text-ink">Jalandhar</span>.
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
      </Container>
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
        {/* Hover-prefetched. The footer is on every page and holds a dozen
            links; eagerly warming them all meant a stack of RSC payloads
            downloaded the moment someone scrolled to the bottom. */}
        {links.map((l) => (
          <li key={l.href}>
            <PrefetchLink
              href={l.href}
              className="text-sm text-muted transition-colors duration-200 hover:text-brand-600"
            >
              {l.label}
            </PrefetchLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
