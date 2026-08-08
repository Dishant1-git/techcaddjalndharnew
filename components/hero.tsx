"use client"

import { useRef, useState } from "react"

const FEATURES = [
  {
    title: "Industry Mentors",
    body: "Taught by working engineers",
    icon: (
      <path
        d="M12 3 3 7.5 12 12l9-4.5L12 3ZM6 10v5.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Done For You",
    body: "Live projects, end to end",
    icon: (
      <path
        d="M4 5.5h16v13H4v-13Zm0 3.5h16M8.5 13l1.8 1.8-1.8 1.8M12.5 16.6H15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "The Best Placements",
    body: "500+ active hiring partners",
    icon: (
      <path
        d="M12 3.5 3.5 8 12 12.5 20.5 8 12 3.5ZM3.5 12 12 16.5 20.5 12M3.5 16 12 20.5 20.5 16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
]

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  // The preview button turns the ambient background loop into a watchable clip.
  const togglePreview = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
    void video.play()
  }

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0e14] pt-20 text-white">
      {/* --- Background loop --- */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        /* Scaled up so the blur's soft edges never reveal the backdrop. */
        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover blur-[3px]"
      >
        <source src="/assets/video/bg.mp4" type="video/mp4" />
      </video>

      {/* Legibility scrim: dark on the left where the copy sits, and a heavier
          floor under the feature cards. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/55" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 pt-10 pb-10 lg:px-12 lg:pt-14 lg:pb-12">
          {/* --- Eyebrow pill --- */}
          <div className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-mono text-[10px] tracking-[0.18em] text-white/80 uppercase backdrop-blur-md sm:text-[11px]">
              TechCadd Jalandhar
              <span className="size-1 rounded-full bg-white/40" />
              AI &amp; Software Training
            </span>
          </div>

          <div className="flex flex-1 items-center py-14 lg:py-20">
            <div className="grid w-full items-end gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
              <div>
                <h1 className="reveal font-display text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[1.06] font-normal tracking-tight text-white/45 [animation-delay:100ms]">
                  <span className="block">Build The Skills That Turn</span>
                  <span className="block">
                    You Into A{" "}
                    <em className="font-semibold text-white italic">Job-Ready</em>{" "}
                    <span className="text-white">Engineer</span>
                  </span>
                  <span className="block text-white">
                    In AI &amp; Software
                    <span
                      className="mx-3 inline-flex h-[0.78em] w-[1.5em] translate-y-[0.08em] items-center justify-center rounded-[0.28em] bg-gradient-to-br from-brand-400 via-brand-600 to-accent-500 align-middle font-mono text-[0.34em] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.9)]"
                      aria-hidden="true"
                    >
                      &lt;/&gt;
                    </span>
                    Engineering
                  </span>
                </h1>

                <p className="reveal mt-7 max-w-xl text-sm leading-relaxed text-white/75 [animation-delay:250ms] sm:text-base">
                  Learn the AI, cloud and full-stack systems businesses actually
                  run on. TechCadd handles the curriculum, the live projects and
                  the placement drives — so you only have to show up and build.
                </p>

                <div className="reveal mt-9 flex flex-col items-start gap-4 [animation-delay:350ms] sm:flex-row">
                  <a
                    href="/enquiry"
                    className="group inline-flex h-13 items-center justify-center rounded-full bg-white px-8 text-base font-medium text-[#0a0e14] transition-colors duration-300 hover:bg-brand-500 hover:text-white"
                  >
                    Start your career
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14m-7-7 7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                  <a
                    href="/courses"
                    className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/15"
                  >
                    Explore courses
                  </a>
                </div>
              </div>

              {/* --- See Preview --- */}
              <div className="reveal flex items-start gap-3 [animation-delay:450ms] lg:justify-end">
                <button
                  type="button"
                  onClick={togglePreview}
                  aria-label={
                    muted ? "Play campus preview with sound" : "Mute preview"
                  }
                  className="group grid size-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-colors duration-300 hover:bg-white/25"
                >
                  {muted ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3.5 translate-x-[1px] fill-white"
                      aria-hidden="true"
                    >
                      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3.5 fill-white"
                      aria-hidden="true"
                    >
                      <path d="M8 5.5h3v13H8v-13Zm5 0h3v13h-3v-13Z" />
                    </svg>
                  )}
                </button>
                <div className="max-w-[190px]">
                  <p className="text-sm font-medium text-white">See Preview</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    A quick look inside the labs, the mentors and a live batch in
                    session.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- Feature cards --- */}
          <div className="reveal grid shrink-0 gap-4 [animation-delay:550ms] sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-4 rounded-2xl border border-white/20 bg-black/45 p-4 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-colors duration-300 hover:bg-black/60 sm:p-5"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/15 text-white">
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
                    {f.icon}
                  </svg>
                </span>
                <span>
                  <span className="block text-base font-semibold text-white">
                    {f.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-white/75">
                    {f.body}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
