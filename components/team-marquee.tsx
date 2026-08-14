import Image from "next/image"

export type TeamMember = {
  name: string
  /** Designation shown under the name. */
  role: string
  photo: string
}

/**
 * The team as two opposing lanes of portrait pills.
 *
 * Built on the same CSS-only loop as ReviewMarquee and GalleryMarquee
 * (`marquee-left` / `marquee-right` / `marquee-fade` in globals.css): the track
 * holds each lane exactly twice, so translating -50% lands copy two where copy
 * one began and the seam is invisible. Spacing lives on the cards (`mr-*`)
 * rather than a flex `gap`, because a gap would also fall between the two
 * copies and throw that -50% off by half a gap.
 *
 * Nothing here is a client component — no state, no effects, no JS. The rows
 * move on a compositor-only `transform` animation, so twelve portraits cost the
 * page nothing beyond the images themselves.
 */

/** Cards per copy before a lane reliably outruns a wide viewport. */
const MIN_PER_COPY = 6

function fill(items: TeamMember[]): TeamMember[] {
  if (!items.length) return items
  const out = [...items]
  while (out.length < MIN_PER_COPY) out.push(...items)
  return out
}

export function TeamMarquee({ members }: { members: TeamMember[] }) {
  const split = Math.ceil(members.length / 2)

  return (
    /* Deliberately not `.marquee-row` — that class exists only to hang the
       hover-pause off the wrapper shared by both lanes, which means pointing at
       any one portrait would freeze the whole section. Each card pauses its own
       lane instead, via `hover:[animation-play-state:paused]` on the track. */
    <div className="mt-10 space-y-4 lg:mt-14 lg:space-y-6">
      <Lane items={members.slice(0, split)} />
      <Lane items={members.slice(split)} reverse />
    </div>
  )
}

function Lane({
  items,
  reverse = false,
}: {
  items: TeamMember[]
  reverse?: boolean
}) {
  const copy = fill(items)
  if (!copy.length) return null

  return (
    <div className="marquee-fade overflow-hidden py-2">
      <ul
        className={`flex w-max hover:[animation-play-state:paused] ${
          reverse ? "marquee-right" : "marquee-left"
        }`}
        style={
          { "--marquee-duration": `${copy.length * 7}s` } as React.CSSProperties
        }
      >
        {[0, 1].map((pass) => (
          <li key={pass} className="flex" aria-hidden={pass === 1}>
            {copy.map((member, i) => (
              <Card
                key={`${pass}-${i}-${member.name}`}
                member={member}
                /* The portrait swaps sides down the lane, so a row reads as a
                   scatter of pills rather than a column of identical ones. */
                flip={i % 2 === 1}
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Card({ member, flip }: { member: TeamMember; flip: boolean }) {
  return (
    <div
      className={`group mr-4 flex w-[15rem] shrink-0 items-center gap-3 rounded-full border border-line bg-background p-2 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.45)] transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-brand-600/35 hover:shadow-[0_22px_50px_-26px_rgba(37,99,235,0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:mr-6 sm:w-[17.5rem] sm:gap-4 sm:p-2.5 ${
        flip ? "flex-row-reverse text-right" : ""
      }`}
    >
      {/* alt is empty on purpose — these are placeholder photographs, not
          pictures of the people they sit under, so naming them would tell a
          screen reader something untrue. The name below is the visible label
          and is what gets read. */}
      <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-subtle ring-1 ring-line sm:size-16">
        <Image
          src={member.photo}
          alt=""
          fill
          sizes="64px"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
        />
      </span>

      <span className="min-w-0 flex-1 px-1">
        <span className="block truncate font-display text-sm font-bold tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-600 sm:text-base">
          {member.name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted">
          {member.role}
        </span>
      </span>
    </div>
  )
}
