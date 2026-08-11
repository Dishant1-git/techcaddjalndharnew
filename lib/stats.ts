/**
 * Headline numbers for the orbit-ring stats band.
 *
 * `duration` and `offset` stagger each ring's travelling dot so the four never
 * line up; `lift` is the alternating vertical offset that gives the row its
 * zig-zag on wide screens.
 */

export type Stat = {
  value: string
  label: string
  /** Orbit period for this ring's dot. */
  duration: string
  /** Negative animation-delay — starts the dot mid-orbit. */
  offset: string
  /** Tailwind translate applied from `lg` up. */
  lift: string
  /** Ring diameter cap, so the row breathes like the reference. */
  size: string
}

export const STATS: Stat[] = [
  {
    value: "15+",
    label: "Years of Excellence",
    duration: "16s",
    offset: "-2s",
    lift: "lg:translate-y-16",
    size: "max-w-[16rem]",
  },
  {
    value: "15k+",
    label: "Students Trained",
    duration: "13s",
    offset: "-7s",
    lift: "lg:-translate-y-8",
    size: "max-w-[17.5rem]",
  },
  {
    value: "120+",
    label: "Certified Courses",
    duration: "18s",
    offset: "-11s",
    lift: "lg:translate-y-16",
    size: "max-w-[16rem]",
  },
  {
    value: "98%",
    label: "Placement Success",
    duration: "14s",
    offset: "-4s",
    lift: "lg:-translate-y-8",
    size: "max-w-[17.5rem]",
  },
]
