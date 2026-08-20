import type { Metadata } from "next"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { GoogleBadge, GoogleMark } from "@/components/google-mark"
import { loadReviews } from "@/lib/content"
import { REVIEW_META, type GoogleReview } from "@/lib/reviews"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Student Reviews — techcadd Jalandhar",
  description:
    "What students say about training at techcadd Jalandhar — course reviews covering full stack, data science, AI, cyber security, digital marketing and industrial training.",
  alternates: { canonical: `${SITE.url}/reviews` },
}

export default async function ReviewsPage() {
  const reviews = await loadReviews()

  return (
    <main>
      <section
        data-cursor="light"
        className="bg-ink pt-32 pb-14 text-white lg:pt-40 lg:pb-16"
      >
        <Container>
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md">
            Reviews
          </span>

          <h1
            data-reveal
            className="mt-7 max-w-3xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-white/40 text-balance sm:text-5xl lg:text-6xl"
          >
            <span className="text-white">In their words,</span> not ours.
          </h1>

          {/* The rating band. Reads as social proof only because the numbers
              are checkable against the Google profile they came from. */}
          <div
            data-reveal
            className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5"
          >
            <div className="flex items-center gap-3">
              <GoogleMark className="size-8 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl leading-none font-bold">
                    {REVIEW_META.rating}
                  </span>
                  <Stars rating={5} className="text-amber-400" />
                </div>
                <p className="mt-1 text-xs text-white/60">
                  {REVIEW_META.count} reviews on Google
                </p>
              </div>
            </div>

            <span aria-hidden="true" className="hidden h-10 w-px bg-white/20 sm:block" />

            <div>
              <span className="font-display text-2xl leading-none font-bold">
                {REVIEW_META.placed}
              </span>
              <p className="mt-1 text-xs text-white/60">Students trained</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-mono text-xs tracking-[0.22em] text-brand-600 uppercase">
              Recent reviews
            </p>
            {/* Hidden at zero: "0 shown" beside the notice below only says the
                same thing twice. */}
            {reviews.length > 0 && (
              <p className="font-mono text-xs text-muted">
                {reviews.length} shown
              </p>
            )}
          </div>

          {/* None to show.

              The cards come from the CMS and have no checked-in stand-ins,
              because a review is somebody's words and the Google mark on a card
              says a visitor can go and check them. So this points at the
              profile itself rather than apologising: the reviews are real and
              readable, they are simply not reproduced here yet. */}
          {reviews.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-subtle/50 px-6 py-16 text-center lg:mt-10">
              <GoogleMark className="mx-auto size-8" />
              <p className="mt-5 font-display text-xl font-bold tracking-tight">
                Reviews are on our Google profile.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                We have not reproduced them here yet. In the meantime they are
                readable in full, and unedited, on Google.
              </p>
            </div>
          )}

          {/* Masonry-ish without the complexity: three CSS columns, so cards of
              different lengths pack tightly instead of every row stretching to
              its tallest card. `break-inside` is what stops a card being split
              across a column boundary. */}
          <div className="mt-8 gap-6 lg:mt-10 lg:columns-3 sm:columns-2">
            {reviews.map((review) => (
              <ReviewCard key={review.name} review={review} />
            ))}
          </div>

          {/* Only true when there are cards above it to describe. */}
          {reviews.length > 0 && (
            <p className="mt-12 text-center text-xs leading-relaxed text-muted">
              Reviews are shown as written by students on our Google Business
              Profile.
            </p>
          )}
        </Container>
      </section>

      <Cta />
    </main>
  )
}

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <article className="mb-6 break-inside-avoid rounded-2xl border border-line bg-white p-6 transition-shadow duration-500 hover:shadow-[0_22px_50px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-600 to-accent-500 font-display text-xs font-bold text-white"
          >
            {review.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">
              {review.name}
            </p>
            <p className="text-xs text-muted">{review.date}</p>
          </div>
        </div>

        {/*
          The Google mark, marking where the review was left.

          Sized and placed as an attribution rather than a logo: it tells a
          visitor this came from a profile they can go and check, which is the
          only reason it earns its place. It must never appear on a review that
          was not actually left on Google.
        */}
        <GoogleBadge />
      </div>

      <Stars rating={review.rating} className="mt-4 text-amber-400" />

      <blockquote className="mt-3 text-sm leading-relaxed text-foreground/85">
        {review.quote}
      </blockquote>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {review.course && (
          <p className="inline-flex rounded-md bg-brand-600/10 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
            {review.course}
          </p>
        )}

        {/*
          Only rendered when the CMS holds an address for this exact review.

          The alternative — always showing the button and sending everyone to
          the business profile — makes the same promise for a link that does
          not keep it: a visitor who clicks "Read on Google" under a particular
          review expects to land on it, not on a list of several hundred.
        */}
        {review.googleUrl && (
          <a
            href={review.googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-600/10"
          >
            Read on Google
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-3"
              aria-hidden="true"
            >
              <path
                d="M7 17 17 7m0 0h-7m7 0v7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sr-only">, opens in a new tab</span>
          </a>
        )}
      </div>
    </article>
  )
}

/** Filled stars up to `rating`, hollow after — five marks either way, so the
 *  score is readable at a glance rather than counted. */
function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div
      className={`flex gap-0.5 ${className}`}
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`size-4 ${i < rating ? "fill-current" : "fill-line"}`}
          aria-hidden="true"
        >
          <path d="m12 17.27 5.18 3.13-1.37-5.89 4.57-3.96-6.02-.52L12 4.5 9.64 10.03l-6.02.52 4.57 3.96-1.37 5.89L12 17.27Z" />
        </svg>
      ))}
    </div>
  )
}

