import { ScrollHeading } from "./scroll-heading"
import { TestimonialSlider } from "./testimonial-slider"
import {
  TESTIMONIALS,
  TESTIMONIAL_META,
  type Testimonial,
} from "@/lib/testimonials"

/**
 * Cards sit on `/assets/texture.svg` — a generated grain-and-horizon backdrop
 * rather than a bitmap, so it scales cleanly and costs a few KB.
 *
 * The track auto-slides (see TestimonialSlider) and is padded to the same
 * gutter the header uses, which keeps the first card flush with the heading
 * while the rest bleed off the right edge exactly like the reference.
 */
const GUTTER = "px-[max(1rem,calc((100%-1240px)/2))] lg:px-[max(2rem,calc((100%-1240px)/2))]"

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative isolate overflow-hidden bg-[url('/assets/texture.svg')] bg-cover bg-center py-20 lg:py-28"
    >
      {/* Keeps the heading legible wherever the texture lands. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2/3 bg-linear-to-b from-white/85 to-transparent"
      />

      <div className={GUTTER}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <ScrollHeading
              lines={["What our students say", "about TechCadd"]}
              className="font-display text-4xl leading-[1.05] font-bold tracking-tight lg:text-5xl"
            />

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <Meta icon={<StarIcon className="size-4 text-amber-400" />}>
                {TESTIMONIAL_META.rating}
              </Meta>
              <Divider />
              <Meta icon={<HeartIcon className="size-4 text-rose-500" />}>
                {TESTIMONIAL_META.count}
              </Meta>
              <Divider />
              <Meta icon={<UsersIcon className="size-4 text-brand-600" />}>
                {TESTIMONIAL_META.community}
              </Meta>
            </div>
          </div>

          <a
            href="/contact"
            className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full bg-ink py-2 pr-2 pl-7 text-sm font-semibold text-white shadow-[0_14px_34px_-14px_rgba(42,44,94,0.9)] transition-colors duration-300 hover:bg-brand-600 lg:self-auto"
          >
            Get started today
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
          </a>
        </div>
      </div>

      <TestimonialSlider
        className={`mt-12 gap-5 pb-4 lg:mt-16 ${GUTTER}`}
        listClassName="flex shrink-0 gap-5"
      >
        {TESTIMONIALS.map((t) => (
          <Card key={t.name} testimonial={t} />
        ))}
      </TestimonialSlider>
    </section>
  )
}

function Card({ testimonial }: { testimonial: Testimonial }) {
  return (
    <li className="flex w-[19rem] shrink-0 flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_24px_50px_-24px_rgba(15,23,42,0.45)] sm:w-[21rem]">
      <div>
        <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} className="size-4 text-amber-400" />
          ))}
        </div>

        <blockquote className="mt-5 text-sm leading-relaxed text-foreground/85">
          {testimonial.quote}
        </blockquote>
      </div>

      <figcaption className="mt-8 flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br ${testimonial.from} ${testimonial.to} font-display text-xs font-bold text-white`}
        >
          {testimonial.initials}
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-tight">
            {testimonial.name}
          </span>
          <span className="block text-xs text-muted">{testimonial.role}</span>
        </span>
      </figcaption>
    </li>
  )
}

function Meta({ icon, children }: { icon: React.ReactNode; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {children}
    </span>
  )
}

function Divider() {
  return (
    <span aria-hidden="true" className="h-4 w-px bg-foreground/15" />
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="m12 17.27 5.18 3.13-1.37-5.89 4.57-3.96-6.02-.52L12 4.5 9.64 10.03l-6.02.52 4.57 3.96-1.37 5.89L12 17.27Z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 20.7 3.9 12.9a5 5 0 0 1 7.07-7.07L12 6.86l1.03-1.03A5 5 0 0 1 20.1 12.9L12 20.7Z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.87 0-7 1.94-7 4.33V20h14v-2.67C16 14.94 12.87 13 9 13Zm8.5-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm.5 2c-.83 0-1.6.12-2.3.34A6.3 6.3 0 0 1 18 17.33V20h4v-2.4C22 15.2 20.2 13 18 13Z" />
    </svg>
  )
}
