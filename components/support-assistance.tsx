"use client"

import { useState } from "react"
import { SITE } from "@/lib/site"

/**
 * Support & Assistance — pick who you need, get that person's details.
 *
 * The desk is chosen on the left and the panel on the right swaps to match.
 * It is a tablist rather than two cards side by side because the second half
 * is one person's contact details: showing every desk at once would put three
 * phone numbers on screen and leave the visitor to work out which is theirs.
 *
 * Client-side for the selection only. Every destination underneath is a plain
 * `tel:`, `https://wa.me/` or `mailto:` link, so the whole thing still works
 * with the panel it happens to open on if the JavaScript never arrives.
 */

export type SupportDesk = {
  id: string
  /** The desk, as named on the left. */
  label: string
  blurb: string
  icon: "student" | "college"
  /** Who answers it. */
  name: string
  phone: string
  email: string
  location: string
}

export function SupportAssistance({ desks }: { desks: SupportDesk[] }) {
  const [activeId, setActiveId] = useState(desks[0]?.id)
  const active = desks.find((d) => d.id === activeId) ?? desks[0]

  if (!active) return null

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] lg:grid lg:grid-cols-[minmax(0,22rem)_1fr]">
      {/* --- Desk picker --- */}
      <div
        role="tablist"
        aria-label="Support desks"
        className="flex flex-col gap-4 bg-linear-to-br from-brand-600 via-brand-500 to-accent-500 p-5 sm:p-7"
      >
        {desks.map((desk) => {
          const selected = desk.id === active.id
          return (
            <button
              key={desk.id}
              type="button"
              role="tab"
              id={`support-tab-${desk.id}`}
              aria-selected={selected}
              aria-controls={`support-panel-${desk.id}`}
              onClick={() => setActiveId(desk.id)}
              className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors duration-300 sm:p-5 ${
                selected
                  ? "border-white/70 bg-white/25"
                  : "border-white/25 bg-white/10 hover:bg-white/20"
              }`}
            >
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/20 text-white"
              >
                {desk.icon === "student" ? <StudentIcon /> : <CollegeIcon />}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base font-bold tracking-tight text-white">
                  {desk.label}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-white/80">
                  {desk.blurb}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* --- The person on that desk --- */}
      <div
        role="tabpanel"
        id={`support-panel-${active.id}`}
        aria-labelledby={`support-tab-${active.id}`}
        className="flex flex-col items-center gap-7 p-6 text-center sm:p-10 md:flex-row md:items-center md:gap-10 md:text-left"
      >
        {/*
          Initials, not a photograph.

          There is no headshot for these desks in the repo, and a stock portrait
          under a real colleague's name would be a picture of someone else.
          Swap this for their own photo when one exists.
        */}
        <span
          aria-hidden="true"
          className="grid size-28 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-600 to-accent-500 font-display text-3xl font-bold text-white ring-8 ring-brand-600/10 sm:size-32"
        >
          {initials(active.name)}
        </span>

        <div className="min-w-0">
          <p className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {active.name}
          </p>
          <p className="mt-1 font-semibold text-brand-600">{active.label}</p>

          <dl className="mt-5 space-y-2.5">
            <Detail icon={<PhoneIcon />} label="Phone">
              <a
                href={`tel:${active.phone.replace(/[^+\d]/g, "")}`}
                className="transition-colors hover:text-brand-600"
              >
                {active.phone}
              </a>
            </Detail>
            <Detail icon={<MailIcon />} label="Email">
              <a
                href={`mailto:${active.email}`}
                className="break-all transition-colors hover:text-brand-600"
              >
                {active.email}
              </a>
            </Detail>
            <Detail icon={<PinIcon />} label="Location">
              {active.location}
            </Detail>
          </dl>

          <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
            <a
              href={`tel:${active.phone.replace(/[^+\d]/g, "")}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-700"
            >
              <PhoneIcon />
              Call Now
            </a>
            <a
              /* wa.me wants digits only, country code included and no plus. */
              href={`https://wa.me/${active.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#1da851]"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
            <a
              href={`mailto:${active.email}`}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-amber-600"
            >
              <MailIcon />
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-center gap-3 md:justify-start">
      <dt className="shrink-0 text-brand-600">
        <span className="sr-only">{label}</span>
        <span aria-hidden="true">{icon}</span>
      </dt>
      <dd className="min-w-0 text-sm text-foreground/85 sm:text-base">
        {children}
      </dd>
    </div>
  )
}

/** First letters of the first two words — "Anita Sharma" → "AS". */
function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function StudentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M12 4 2 9l10 5 10-5-10-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 11.5V16c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5v-4.5M20 10v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CollegeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M3 10h18M12 3 3 8h18l-9-5ZM5 10v8m4-8v8m6-8v8m4-8v8M3 21h18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M16.9 21c-1.9 0-3.9-.5-5.9-1.6a20.6 20.6 0 0 1-6.4-5.4A19.5 19.5 0 0 1 1.5 7c-.2-1 0-1.9.6-2.6l2-2.1c.5-.5 1.3-.5 1.8 0l2.6 2.7c.5.5.5 1.3 0 1.8L7.1 8.3c.5 1 1.2 2 2 2.9.9.9 1.9 1.6 3 2.2l1.4-1.5c.5-.5 1.3-.5 1.8 0l2.6 2.7c.5.5.5 1.3 0 1.8l-2 2.1c-.5.4-1.2.6-1.9.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0" aria-hidden="true">
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m3 7 9 6 9-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.53 3.7-8.22 8.23-8.22a8.23 8.23 0 0 1 0 16.46Z" />
    </svg>
  )
}
