const isDev = process.env.NODE_ENV !== "production"

/**
 * Content Security Policy.
 *
 * Every asset this site loads is its own: local video, next/font self-hosts the
 * three Google fonts at build time, and there is no analytics, tag manager or
 * embed. So everything is pinned to 'self' — an injected <script src> pointing
 * anywhere else simply does not execute.
 *
 * script-src keeps 'unsafe-inline' because Next.js hydration ships inline
 * bootstrap scripts on every page, and the pages here are statically generated.
 * Removing it means per-request nonces, which requires middleware and forces
 * every page to render dynamically — a real cost for a marketing site whose
 * pages are all static. The trade is deliberate: this policy stops an attacker
 * *loading* foreign script, not one who can already inject inline markup.
 * React escapes everything it renders, and the two inline scripts we control
 * are static strings, so that second case has no route in today's code.
 */
/**
 * Google reCAPTCHA hosts.
 *
 * The only exception to the 'self' rule above, and a deliberate one: the
 * "I'm not a robot" widget is a Google-hosted script inside a Google-hosted
 * iframe, so it cannot run under a policy pinned to this origin. Listed
 * explicitly rather than as a wildcard, and only on the four directives the
 * widget actually needs — an injected script pointing anywhere else still does
 * not execute.
 *
 * `recaptcha.google.com` is the alternate origin the widget falls back to in
 * regions where `google.com` is unreachable.
 */
const RECAPTCHA_SCRIPT = "https://www.google.com https://www.gstatic.com https://recaptcha.google.com"
const RECAPTCHA_FRAME = "https://www.google.com https://recaptcha.google.com"

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 'unsafe-eval' is React Fast Refresh in development only.
  `script-src 'self' 'unsafe-inline' ${RECAPTCHA_SCRIPT}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.gstatic.com https://www.google.com",
  "font-src 'self' data:",
  // ws: is the dev server's hot-reload socket.
  `connect-src 'self' ${RECAPTCHA_SCRIPT}${isDev ? " ws: wss:" : ""}`,
  // Without this the widget's iframe falls back to default-src and is blocked.
  `frame-src 'self' ${RECAPTCHA_FRAME}`,
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  // Skipped in development, where the site is served over plain http.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Ignored over plain http, so it costs nothing in development. Two years and
  // includeSubDomains is the preload-list requirement; add `; preload` and
  // submit the domain only once every subdomain is on HTTPS for good.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // frame-ancestors already covers this; kept for browsers and scanners that
  // still look for the legacy header.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Nothing here uses these, so no page may ask for them.
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=(self)",
      "camera=()",
      "display-capture=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "browsing-topics=()",
    ].join(", "),
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /** Announcing the framework and its version only helps someone shopping for a CVE. */
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        /*
          Everything under public/assets — the two hero loops at 5.5 MB and
          2.3 MB, the photographs, the logo.

          Next serves public/ with `max-age=0`, so every one of those was
          revalidated on every visit while the hashed build chunks beside them
          were cached for a year. A returning visitor re-fetched megabytes of
          video to be told it had not changed.

          Thirty days rather than a year with `immutable`, because these paths
          are not content-hashed: a cached copy cannot be invalidated by a
          rebuild, only by changing the filename. `stale-while-revalidate`
          means a swapped file is picked up in the background on the next
          visit rather than blocking it.
        */
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Enquiry traffic is personal data; no shared cache may hold it, and
        // no other origin may read a response even if one is cached locally.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ]
  },
}

export default nextConfig
