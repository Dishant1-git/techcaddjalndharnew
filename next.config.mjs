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
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 'unsafe-eval' is React Fast Refresh in development only.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // ws: is the dev server's hot-reload socket.
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
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
