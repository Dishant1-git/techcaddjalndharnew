import Image from "next/image"

export type TeamMember = {
  name: string
  /** Designation shown under the name. */
  role: string
  photo: string
  /**
   * True when `photo` is a headshot of this person rather than a stand-in.
   * Drives `alt`: only a real portrait may be named to a screen reader.
   */
  isPortrait?: boolean
}

/**
 * The team as a grid of square portrait cards.
 *
 * This replaced two auto-scrolling marquee lanes. A marquee is right for
 * material nobody needs to read in full — reviews, gallery frames — but a team
 * is a list of people, and a moving list cannot be scanned: the face you want
 * is always on its way off the edge, and reading a name means chasing it. A
 * grid holds still, shows everyone at once, and puts the rows in the order the
 * page declares them.
 *
 * Nothing here is a client component — no state, no effects, no JS.
 */
export function TeamGrid({ members }: { members: TeamMember[] }) {
  if (!members.length) return null

  return (
    /*
      Column counts are chosen so the last row is rarely a lonely orphan: 12
      members give 6/4/3 full rows at 2/3/4 columns. `auto-rows-fr` keeps every
      cell the same height even when a name wraps to two lines, so the squares
      stay square across a row.
    */
    <ul
      data-reveal
      suppressHydrationWarning
      className="mt-10 grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 lg:mt-14 lg:grid-cols-4 lg:gap-6"
    >
      {members.map((member) => (
        <Card key={member.name} member={member} />
      ))}
    </ul>
  )
}

function Card({ member }: { member: TeamMember }) {
  return (
    <li className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-subtle shadow-[0_14px_36px_-24px_rgba(15,23,42,0.45)] transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-brand-600/35 hover:shadow-[0_22px_50px_-26px_rgba(37,99,235,0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* A stand-in gets an empty alt on purpose — it is not a picture of the
          person it sits under, so naming it would tell a screen reader
          something untrue, and the visible name below is read anyway. A real
          headshot is named. */}
      <Image
        src={member.photo}
        alt={member.isPortrait ? member.name : ""}
        fill
        /* Two columns of a full-width grid on a phone, four of a 1304px
           container above `lg` — roughly 46vw and 300px respectively. */
        sizes="(min-width: 1024px) 300px, (min-width: 640px) 30vw, 46vw"
        /*
          A headshot is taller than the square card, so a centred cover crop
          eats the same amount off the top and the bottom — and the top is
          where the head is. Anchoring the crop and the hover zoom to the top
          edge spends the whole overflow on the shoulders instead, which is
          what a portrait can afford to lose. The stand-ins are rooms, not
          faces, and stay centred.
        */
        className={`object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none ${
          member.isPortrait ? "origin-top object-top" : ""
        }`}
      />

      {/* The scrim is what makes the name legible: these photographs are
          rooms and laptops, not studio headshots on a flat ground, so text
          laid straight onto them lands on whatever happens to be there. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/85 via-black/45 to-transparent"
      />

      <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <span className="block truncate font-display text-sm font-bold tracking-tight text-white sm:text-base">
          {member.name}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-white/70 sm:text-xs">
          {member.role}
        </span>
      </span>
    </li>
  )
}
