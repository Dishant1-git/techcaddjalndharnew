import type { Metadata } from "next"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { loadReviews } from "@/lib/content"
import { REVIEW_META, type GoogleReview } from "@/lib/reviews"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Student Reviews — Techcadd Jalandhar",
  description:
    "What students say about training at Techcadd Jalandhar — course reviews covering full stack, data science, AI, cyber security, digital marketing and industrial training.",
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
            <p className="font-mono text-xs text-muted">
              {reviews.length} shown
            </p>
          </div>

          {/* Masonry-ish without the complexity: three CSS columns, so cards of
              different lengths pack tightly instead of every row stretching to
              its tallest card. `break-inside` is what stops a card being split
              across a column boundary. */}
          <div className="mt-8 gap-6 lg:mt-10 lg:columns-3 sm:columns-2">
            {reviews.map((review) => (
              <ReviewCard key={review.name} review={review} />
            ))}
          </div>

          <p className="mt-12 text-center text-xs leading-relaxed text-muted">
            Reviews are shown as written by students on our Google Business
            Profile.
          </p>
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
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-subtle px-2.5 py-1"
          title="Posted on Google"
        >
          <GoogleMark className="size-3.5" />
          <span className="text-[10px] font-semibold tracking-wide text-muted">
            Google
          </span>
        </span>
      </div>

      <Stars rating={review.rating} className="mt-4 text-amber-400" />

      <blockquote className="mt-3 text-sm leading-relaxed text-foreground/85">
        {review.quote}
      </blockquote>

      <p className="mt-4 inline-flex rounded-md bg-brand-600/10 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
        {review.course}
      </p>
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

/** Google's four-colour G, inline so it costs no request and is not subject to
 *  the site's img-src policy. */
function GoogleMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  )
}
