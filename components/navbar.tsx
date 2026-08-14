"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Logo } from "./logo"
import Image from "next/image"
import Link from "next/link"
import { PrefetchLink } from "./prefetch-link"
import { ENQUIRY_EVENT } from "./enquiry-popup"
import {
  AI_MENU,
  CONTACT,
  NAV_ITEMS,
  QUICK_LINKS,
  type AiColumn,
  type NavItem,
} from "@/lib/navigation"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Lock body scroll while the full-screen mobile menu is open.
  //
  // Only ever written while the menu is actually open. The preloader and the
  // enquiry popup lock the same one property, and this effect used to run on
  // mount with the menu closed — writing "" and tearing down whichever of them
  // was holding the lock. The preloader lost it on every single page load, so
  // the page scrolled freely behind the splash screen.
  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpenMenu(null)
      setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  /** Shuts every menu and cancels a pending close. */
  const closeMenus = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenMenu(null)
    setMobileOpen(false)
    setMobileSection(null)
  }, [])

  // The navbar lives in the layout, so a client-side navigation never remounts
  // it and every menu stays exactly as it was. Clicking a course inside the
  // mega menu would leave the panel hanging over the new page until the pointer
  // happened to leave it. Closing on pathname change fires once the route has
  // committed, so the menu disappears with the page it belongs to.
  useEffect(() => {
    closeMenus()
  }, [pathname, closeMenus])

  // A small grace period keeps the mega menu open while the pointer
  // travels from the trigger down into the panel.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  // Unscrolled, the bar floats over the dark hero video and has to invert.
  const onDark = !scrolled && !mobileOpen

  // The popup lives in the root layout, so it is reached by event rather than
  // by lifting its open state up through the tree.
  const openEnquiry = () => window.dispatchEvent(new Event(ENQUIRY_EVENT))

  return (
    /* The scrolled pill needs breathing room from the viewport edge; the
       unscrolled bar must not, or it would sit 12px inside the content line. */
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "px-3" : "px-0"
      }`}
    >
      <nav
        onMouseLeave={scheduleClose}
        /* Closing on pathname change is not enough on its own: several menu
           entries are same-page anchors (/#faq, /#testimonials), where the
           pathname never changes and the panel would hang over the section it
           just scrolled to. Any link click inside the bar closes the menu —
           capture phase, so it still runs if a child stops propagation.

           Deferred by a task, and that is the whole point. Closing here
           synchronously unmounts the panel — and with it the very anchor being
           clicked — while the event is still in its capture phase. React's
           handler for that <Link> then never runs, so preventDefault() is
           never called and the browser follows the href natively: a full page
           reload. It was visible on every dropdown that closes (Courses,
           Internship, After 12th, About) and absent from the AI panel, which
           stays mounted and toggles by class. Letting the click finish first
           keeps the navigation client-side. */
        onClickCapture={(e) => {
          if (!(e.target as Element | null)?.closest?.("a")) return
          window.setTimeout(closeMenus, 0)
        }}
        className={`mx-auto transition-all duration-500 ${
          scrolled
            ? "mt-3 max-w-[1240px] rounded-full border border-line/80 bg-white/75 shadow-[0_8px_40px_-16px_rgba(15,23,42,0.28)] backdrop-blur-xl"
            /* 1304px + the same px-4/lg:px-8 gutter Container uses, so the
               logo sits exactly on the page's content edge when unscrolled. */
            : "mt-0 max-w-[1304px] border border-transparent bg-transparent"
        } ${onDark ? "text-white" : ""}`}
      >
        <div
          /* px-4/lg:px-8 unscrolled matches the page gutter so the logo sits
             on the same line as section headings; the scrolled pill keeps a
             slightly tighter inset because it has its own rounded edge. */
          className={`flex items-center justify-between transition-all duration-500 ${
            scrolled ? "h-16 px-4 sm:px-6 lg:px-8" : "h-20 px-4 lg:px-8"
          }`}
        >
          <Logo compact={scrolled} onDark={onDark} />

          {/* --- Desktop links --- */}
          <div className="hidden items-center gap-5 self-stretch xl:flex 2xl:gap-7">
            {NAV_ITEMS.map((item) => (
              <DesktopNavLink
                key={item.label}
                item={item}
                onDark={onDark}
                open={openMenu === item.label}
                onOpen={() => {
                  cancelClose()
                  setOpenMenu(
                    item.groups || item.links || item.variant
                      ? item.label
                      : null,
                  )
                }}
                onLeave={scheduleClose}
              />
            ))}
          </div>

          {/* --- Desktop actions --- */}
          <div className="hidden items-center gap-4 xl:flex">
            <button
              type="button"
              onClick={openEnquiry}
              /* Over the hero video the button stays white: the logo navy is
                 as dark as the footage behind it, and a button that has to be
                 hunted for is not a call to action. Once the bar is a white
                 pill it carries the wordmark's own colour. */
              className={`inline-flex h-9 items-center justify-center rounded-full px-6 text-sm font-medium transition-all duration-500 ${
                onDark
                  ? "bg-white text-[#0a0e14] hover:bg-brand-500 hover:text-white"
                  : "bg-logo text-background hover:bg-brand-600"
              }`}
            >
              Book Demo
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="relative z-50 p-2 xl:hidden"
          >
            <span className="sr-only">Menu</span>
            <span className="flex h-6 w-6 flex-col items-center justify-center gap-1.5">
              <span
                className={`block h-px w-6 transition-all duration-300 ${
                  onDark ? "bg-white" : "bg-foreground"
                } ${mobileOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-px w-6 transition-all duration-300 ${
                  onDark ? "bg-white" : "bg-foreground"
                } ${mobileOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>

        <MegaMenu
          item={NAV_ITEMS.find((i) => i.label === openMenu) ?? null}
          onEnter={cancelClose}
          onLeave={scheduleClose}
        />

        <FeaturedMenu
          item={NAV_ITEMS.find((i) => i.label === openMenu) ?? null}
          onEnter={cancelClose}
          onLeave={scheduleClose}
        />

        <AiMenu
          open={openMenu === "AI"}
          onEnter={cancelClose}
          onLeave={scheduleClose}
        />
      </nav>

      {/* --- Mobile full-screen menu --- */}
      <div
        className={`fixed inset-0 z-40 bg-background transition-all duration-500 xl:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 pt-24 pb-8 sm:px-8">
          <div className="flex flex-1 flex-col justify-center gap-1">
            {NAV_ITEMS.map((item, i) => (
              <div key={item.label} className="border-b border-foreground/5">
                {item.groups || item.links ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSection((v) =>
                          v === item.label ? null : item.label,
                        )
                      }
                      className="flex w-full items-center justify-between py-4 text-left font-display text-3xl tracking-tight transition-colors duration-300 hover:text-brand-600 sm:text-4xl"
                      style={{ transitionDelay: `${i * 40}ms` }}
                    >
                      {item.label}
                      <span
                        className={`font-mono text-base text-muted transition-transform duration-300 ${
                          mobileSection === item.label ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {mobileSection === item.label && (
                      <div className="animate-menu-in grid grid-cols-2 gap-x-6 gap-y-2 pb-6">
                        {(item.groups?.flatMap((g) => g.items) ?? item.links ?? []).map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            className="text-sm text-muted transition-colors hover:text-brand-600"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : item.variant === "ai" ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSection((v) =>
                          v === item.label ? null : item.label,
                        )
                      }
                      className="flex w-full items-center justify-between py-3 text-left"
                    >
                      <span className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-brand-600 to-brand-500 px-5 py-2 font-display text-2xl font-bold tracking-tight text-white shadow-[0_10px_28px_-10px_rgba(37,99,235,0.95)] sm:text-3xl">
                        {item.label}
                        <SparkIcon />
                      </span>
                      <span
                        className={`font-mono text-base text-muted transition-transform duration-300 ${
                          mobileSection === item.label ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {mobileSection === item.label && (
                      <div className="animate-menu-in grid grid-cols-2 gap-x-6 gap-y-2 pb-6">
                        {AI_MENU.columns
                          .flatMap((c) => c.items)
                          .map((c) => (
                            <Link
                              key={c.href}
                              href={c.href}
                              className="text-sm text-muted transition-colors hover:text-brand-600"
                            >
                              {c.label}
                            </Link>
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-4 font-display text-3xl tracking-tight transition-colors duration-300 hover:text-brand-600 sm:text-4xl"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-foreground/10 pt-6">
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="font-mono text-xs tracking-wide text-muted uppercase transition-colors hover:text-foreground"
              >
                {q.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <a
              href={CONTACT.phoneHref}
              className="flex h-14 flex-1 items-center justify-center rounded-full border border-foreground/20 text-base font-medium transition-colors hover:bg-foreground/5"
            >
              Call us
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                openEnquiry()
              }}
              className="flex h-14 flex-1 items-center justify-center rounded-full bg-logo text-base font-medium text-background transition-colors hover:bg-brand-600"
            >
              Book Demo
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function DesktopNavLink({
  item,
  open,
  onOpen,
  onLeave,
  onDark,
}: {
  item: NavItem
  open: boolean
  onOpen: () => void
  onLeave: () => void
  onDark: boolean
}) {
  const idle = onDark
    ? "text-white/75 hover:text-white"
    : "text-foreground/70 hover:text-foreground"

  // AI is the promoted item: a filled pill with a light running its border.
  if (item.variant === "ai") {
    return (
      /* Hover-prefetched like the rest of the bar: this pill points at the AI
         course page, whose payload is 34 KB, and it is on every page. */
      <PrefetchLink
        href={item.href}
        onMouseEnter={onOpen}
        onFocus={onOpen}
        aria-expanded={open}
        className={`spin-border group/ai inline-block rounded-full p-[1.5px] shadow-[0_10px_28px_-10px_rgba(37,99,235,0.95)] transition-shadow duration-300 hover:shadow-[0_12px_34px_-8px_rgba(34,211,238,0.8)] ${
          open ? "[--spin-duration:1.6s]" : ""
        }`}
      >
        <span className="spin-border__face inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-brand-700 via-brand-600 to-brand-500 px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 group-hover/ai:from-brand-600 group-hover/ai:to-brand-500">
          {item.label}
          {/* fill-white explicitly: passing a className replaces SparkIcon's
              default, which is where `fill-current` lives — without it the
              star falls back to black on the blue pill. */}
          <SparkIcon className="animate-twinkle size-4 fill-white [--twinkle-duration:2.2s]" />
        </span>
      </PrefetchLink>
    )
  }

  const expandable = Boolean(item.groups || item.links)

  /* Hover-prefetched rather than eager. These seven sit in the bar on every
     page, and one of them is Home — whose RSC payload is 117 KB, fetched from
     every other page whether or not anyone was going there. Hovering the item
     is also what opens its menu, so the warm-up starts on the same gesture. */
  const link = (
    <PrefetchLink
      href={item.href}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      aria-expanded={expandable ? open : undefined}
      className={`group relative text-sm transition-colors duration-300 ${
        open ? (onDark ? "text-white" : "text-foreground") : idle
      }`}
    >
      <span className="flex items-center gap-1.5">
        {item.label}
        {expandable && (
          <svg
            viewBox="0 0 12 12"
            className={`size-2.5 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m2.5 4.5 3.5 3.5 3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className={`absolute -bottom-1 left-0 h-px transition-all duration-300 group-hover:w-full ${
          onDark ? "bg-white" : "bg-foreground"
        } ${open ? "w-full" : "w-0"}`}
      />
    </PrefetchLink>
  )

  // Items carrying featured cards open the full-width panel from the nav
  // instead, exactly as the groups-driven mega menu does — so they take the
  // same early return rather than growing a dropdown of their own.
  if (!item.links || item.featured) return link

  // Short flat menus hang off the trigger itself; the wrapper stretches to the
  // full bar height so the panel drops from the bottom edge, not the label.
  return (
    <div
      className="relative flex items-center self-stretch"
      onMouseEnter={onOpen}
      onMouseLeave={onLeave}
    >
      {link}
      <div
        className={`absolute top-full left-1/2 w-56 -translate-x-1/2 pt-2 transition-all duration-300 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <ul className="overflow-hidden rounded-2xl border border-line/80 bg-white/90 p-2 text-foreground shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35)] backdrop-blur-3xl">
          {item.links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group/link flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground/70 transition-colors duration-200 hover:bg-subtle hover:text-brand-600"
              >
                <span className="h-px w-0 shrink-0 bg-brand-600 transition-all duration-300 group-hover/link:w-3" />
                <span className="leading-snug">{l.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Looked up rather than interpolated — Tailwind only sees static class names. */
const MEGA_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
}

function MegaMenu({
  item,
  onEnter,
  onLeave,
}: {
  item: NavItem | null
  onEnter: () => void
  onLeave: () => void
}) {
  if (!item?.groups) return null

  const cta = item.cta ?? { label: "Browse all courses", href: "/courses" }

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="animate-menu-in absolute inset-x-0 top-full hidden px-3 pt-2 xl:block"
    >
      <div className="mx-auto max-w-[1240px] overflow-hidden rounded-3xl border border-line/80 bg-white/90 text-foreground shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35)] backdrop-blur-3xl">
        {/* Menus carry two to four groups, so the track count follows the data
            rather than being pinned at Courses' four. */}
        <div className={`grid ${MEGA_COLUMNS[item.groups.length] ?? "grid-cols-4"} gap-8 p-8`}>
          {item.groups.map((group) => (
            <div key={group.title}>
              <div className="mb-4 border-b border-foreground/10 pb-3">
                <span className="font-mono text-xs text-muted">{group.index}</span>
                <h3 className="mt-1 font-display text-lg tracking-tight">
                  {group.title}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  {group.blurb}
                </p>
              </div>
              <ul className="space-y-1.5">
                {group.items.map((c) => (
                  <li key={c.href}>
                    {/* A mega menu holds ~26 links, so viewport prefetching
                        them all floods the network the moment it opens.
                        PrefetchLink warms only the one being hovered. */}
                    <PrefetchLink
                      href={c.href}
                      className="group/link flex items-start gap-2 text-sm text-foreground/70 transition-colors duration-200 hover:text-brand-600"
                    >
                      <span className="mt-2.5 h-px w-0 shrink-0 bg-brand-600 transition-all duration-300 group-hover/link:w-3" />
                      <span className="leading-snug">{c.label}</span>
                      {c.badge && (
                        <span className="mt-0.5 shrink-0 rounded-full bg-brand-600/10 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                          {c.badge}
                        </span>
                      )}
                    </PrefetchLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-foreground/10 bg-subtle px-8 py-4">
          {/* A line worth reading beats four links nobody clicks from a course
              menu — the same destinations live in the footer's Support column. */}
          <figure className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="font-display text-3xl leading-none font-bold text-brand-600/25"
            >
              &ldquo;
            </span>
            <blockquote className="text-sm leading-snug text-muted italic">
              Everybody should learn to program a computer, because it teaches
              you how to think.
              <cite className="ml-1.5 font-medium text-foreground not-italic">
                — Steve Jobs
              </cite>
            </blockquote>
          </figure>
          <Link
            href={cta.href}
            className="group/all inline-flex items-center gap-2 text-sm font-medium text-brand-600"
          >
            {cta.label}
            <span className="transition-transform duration-300 group-hover/all:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * The two-part dropdown used by About Us and Resources.
 *
 * A flat list of three to five links is too thin to fill a mega menu's columns
 * and too important to bury in a 224px dropdown, so the links become a single
 * tall column and the space beside them carries picture-led cards for the
 * destinations worth showing rather than merely naming.
 *
 * Neither column is titled. "Categories" and "Featured" were labelling a menu
 * that has exactly two visible parts — a list of words and a row of pictures —
 * which no reader needs told apart. The links carry the item's `cta` beneath
 * them, and both columns centre, so the two halves balance whatever the link
 * count.
 *
 * Rendered from the nav rather than from the trigger, like MegaMenu, so it
 * spans the full bar instead of hanging off one label.
 */
function FeaturedMenu({
  item,
  onEnter,
  onLeave,
}: {
  item: NavItem | null
  onEnter: () => void
  onLeave: () => void
}) {
  // Both halves are required — one without the other is a different menu.
  if (!item?.links || !item.featured) return null

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="animate-menu-in absolute inset-x-0 top-full hidden px-3 pt-2 xl:block"
    >
      <div className="mx-auto max-w-[1240px] overflow-hidden rounded-3xl border border-line/80 bg-white/90 text-foreground shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35)] backdrop-blur-3xl">
        {/* The category column is capped rather than fractional: it holds a few
            short words, and letting it take a third of a 1240px panel would
            strand the labels in whitespace. */}
        <div className="grid gap-10 p-8 lg:grid-cols-[minmax(180px,240px)_1fr] lg:gap-12">
          {/*
            Both columns centre their content. They are wildly different
            heights — a handful of link labels against a row of picture cards —
            and top-aligning left whichever was shorter trailing off into
            whitespace. Which one that is flips between the two menus, since
            About Us carries three links and Resources five, so centring is
            what makes them balance the same way.
          */}
          <div className="flex flex-col justify-center lg:border-r lg:border-foreground/10 lg:pr-12">
            {/* The links and their closing link are one block: the CTA follows
                the last label, rather than being pushed to the foot of a column
                whose height is set by the pictures in the next one. */}
            <div>
              <ul className="space-y-0.5">
                {item.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="block py-1.5 font-display text-xl leading-snug tracking-tight text-foreground/85 transition-colors duration-300 hover:text-brand-600"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {item.cta && (
                <Link
                  href={item.cta.href}
                  className="group/cta mt-14 inline-flex items-center gap-2 text-sm font-medium text-brand-600"
                >
                  {item.cta.label}
                  <span className="transition-transform duration-300 group-hover/cta:translate-x-1">
                    →
                  </span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <ul className="grid gap-6 sm:grid-cols-3">
              {item.featured.map((card) => (
                <li key={`${card.href}-${card.tag}`}>
                  <Link
                    href={card.href}
                    /* The panel opens on hover, so eager prefetching would fire
                       three requests every time the pointer crossed the label. */
                    prefetch={false}
                    className="group/card block"
                  >
                    {/* Decorative: the title beneath is the accessible name, so
                        alt text here would only repeat it to a screen reader. */}
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-subtle">
                      <Image
                        src={card.image}
                        alt=""
                        fill
                        sizes="240px"
                        className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      />
                    </span>

                    <span className="mt-3 block font-display text-[15px] leading-snug font-bold tracking-tight text-balance transition-colors duration-300 group-hover/card:text-brand-600">
                      {card.title}
                    </span>

                    <span className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <span className="rounded-md bg-brand-600/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-700 uppercase">
                        {card.tag}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                        {card.meta}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * The AI panel.
 *
 * Frosted dark glass rather than the white MegaMenu — AI is the promoted
 * track, and the tonal break is what makes the pill above it read as special.
 * Kept mounted and toggled by class so it can transition out as well as in.
 */
function AiMenu({
  open,
  onEnter,
  onLeave,
}: {
  open: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`absolute inset-x-0 top-full hidden px-3 pt-2 transition-all duration-300 xl:block ${
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      {/* Outer ring carries the travelling border light; the face inside is the
          actual glass panel. */}
      <div className="spin-border mx-auto max-w-[1240px] rounded-[1.75rem] p-px shadow-[0_40px_90px_-30px_rgba(6,10,35,0.85)] [--spin-duration:6s] [--spin-from:#2563eb] [--spin-to:#22d3ee]">
        <div
          data-cursor="light"
          className="spin-border__face relative overflow-hidden rounded-[1.7rem] bg-ink/70 text-white backdrop-blur-3xl backdrop-saturate-150"
        >
          <StarField />

          {/* Sheen sweeping the top edge — the tell that sells it as glass. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
          >
            <span className="animate-edge-sweep block h-full w-1/3 bg-linear-to-r from-transparent via-white to-transparent" />
          </span>

          <div className="relative grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight">
              {AI_MENU.title}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
              {AI_MENU.blurb}
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {AI_MENU.columns.map((column) => (
                <AiColumnBlock key={column.title} column={column} />
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {/* Featured course. Same reason as the column links above: this
                panel is always in the document, so an eager prefetch here is
                paid by every visitor. */}
            <PrefetchLink
              href={AI_MENU.featured.href}
              className="group/f flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/5"
            >
              <span className="relative block aspect-[16/10] overflow-hidden">
                <Image
                  src={AI_MENU.featured.image}
                  alt=""
                  fill
                  sizes="260px"
                  className="object-cover transition-transform duration-700 group-hover/f:scale-105"
                />
              </span>
              <span className="bg-white p-3.5 text-foreground">
                <span className="inline-flex rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
                  {AI_MENU.featured.badge}
                </span>
                <span className="mt-2 block text-sm leading-snug font-bold tracking-tight">
                  {AI_MENU.featured.title}
                </span>
              </span>
            </PrefetchLink>

            {/* CTA */}
            <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-brand-500 via-brand-400 to-accent-400 p-5">
              <p className="text-lg leading-snug font-bold tracking-tight text-white">
                {AI_MENU.cta.text}
              </p>
              <PrefetchLink
                href={AI_MENU.cta.href}
                className="group/cta mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-ink"
              >
                {AI_MENU.cta.label}
                <svg viewBox="0 0 24 24" fill="none" className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" aria-hidden="true">
                  <path
                    d="M5 12h14m-7-7 7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </PrefetchLink>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Deterministic star field — fixed positions rather than Math.random, which
 * would produce different markup on the server and client.
 */
const STARS = [
  { top: "14%", left: "4%", size: 9, delay: 0, duration: 3.2 },
  { top: "62%", left: "9%", size: 6, delay: 900, duration: 2.6 },
  { top: "28%", left: "22%", size: 5, delay: 1800, duration: 3.6 },
  { top: "82%", left: "31%", size: 8, delay: 400, duration: 2.9 },
  { top: "8%", left: "44%", size: 6, delay: 2300, duration: 3.4 },
  { top: "70%", left: "52%", size: 10, delay: 1200, duration: 2.4 },
  { top: "36%", left: "61%", size: 5, delay: 2800, duration: 3.8 },
  { top: "88%", left: "68%", size: 7, delay: 600, duration: 3.1 },
  { top: "18%", left: "78%", size: 8, delay: 1600, duration: 2.7 },
  { top: "54%", left: "91%", size: 6, delay: 2100, duration: 3.5 },
  { top: "92%", left: "96%", size: 5, delay: 300, duration: 3.9 },
]

function StarField() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((star) => (
        <SparkIcon
          key={`${star.top}-${star.left}`}
          className="animate-twinkle absolute fill-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            "--twinkle-delay": `${star.delay}ms`,
            "--twinkle-duration": `${star.duration}s`,
          } as React.CSSProperties}
        />
      ))}
    </span>
  )
}

function AiColumnBlock({ column }: { column: AiColumn }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-500 to-accent-500 text-white">
          {column.icon === "spark" ? <SparkIcon /> : <RocketIcon />}
        </span>
        <h4 className="font-display text-base font-bold tracking-tight">
          {column.title}
        </h4>
      </div>

      <ul className="mt-4 space-y-2.5">
        {column.items.map((item) => (
          <li key={item.href}>
            {/* The AI panel is kept mounted so it can transition out as well
                as in, which meant Next treated all eight of these as visible
                and prefetched every one — ~240 KB of RSC payloads on every
                page load, for a menu most visitors never open. */}
            <PrefetchLink
              href={item.href}
              className="group/link inline-flex items-start gap-2 text-sm font-semibold text-white/80 transition-colors duration-200 hover:text-white"
            >
              <span className="leading-snug">{item.label}</span>
              {item.hot && (
                <span className="mt-0.5 shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  Hot
                </span>
              )}
            </PrefetchLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SparkIcon({
  className = "size-4 fill-current",
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M12 2c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" />
    </svg>
  )
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M13.9 2.6c-4.9.7-8 4.2-9.4 6.9l3.4.8 2.8 2.8.8 3.4c2.7-1.4 6.2-4.5 6.9-9.4l1.9-1.9-4.5-4.5-1.9 1.9ZM15.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
      <path d="M6.6 14.2c-1.4 1.4-1.6 4.2-1.6 4.2s2.8-.2 4.2-1.6a1.85 1.85 0 0 0-2.6-2.6Z" />
    </svg>
  )
}
