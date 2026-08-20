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
 * The embedded location map (components/contact-map.tsx).
 *
 * The `output=embed` form of Google Maps needs no API key and loads nothing of
 * ours, so only `frame-src` is involved — everything inside the frame runs
 * under Google's policy rather than ours. Listed explicitly rather than as a
 * wildcard.
 *
 * The captcha is our own (lib/captcha.ts, GET /api/captcha): a signed question
 * rendered as text, no third-party script and no iframe, which is why nothing
 * here has to be opened up for it.
 */
const MAPS_FRAME = "https://www.google.com"

/**
 * The course-page walkthrough popup (components/video-dialog.tsx).
 *
 * `frame-src` once listed only third-party origins the site no longer uses, so
 * the player it actually embeds was blocked by our own policy — the dialog
 * opened onto an empty black box on every course page carrying a video.
 *
 * The `-nocookie` host is the one the component embeds, and it is the whole
 * point of using it: no tracking cookie is set unless the visitor presses
 * play. Only `frame-src` is needed — everything the player itself loads runs
 * inside the iframe, under YouTube's policy rather than ours.
 */
const YOUTUBE_FRAME = "https://www.youtube-nocookie.com"

/**
 * The CMS, which serves the images editors upload.
 *
 * Derived from the same variable lib/cms.ts reads, so moving the CMS to
 * another host is one change rather than three. Two things have to know about
 * it: `img-src` below, or the browser blocks every uploaded photograph under a
 * policy pinned to 'self', and `images.remotePatterns`, or next/image refuses
 * the URL before it is ever requested.
 */
const CMS_ORIGIN = (process.env.CMS_API_URL ?? "http://localhost:4000/api").replace(
  /\/api\/?$/,
  "",
)

/**
 * Where the CMS admin UI is served from — the one origin allowed to frame the
 * preview route, and the only origin its postMessage handler will trust.
 *
 * Separate from CMS_API_URL: that is the Express API on :4000, this is the
 * admin SPA on :5173 (or cms.<domain> in production). They are different
 * origins and conflating them would let the API host frame the site.
 */
const CMS_ADMIN_ORIGIN = (
  process.env.CMS_ADMIN_ORIGIN ?? "http://localhost:5173"
).replace(/[/]+$/, "")

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 'unsafe-eval' is React Fast Refresh in development only.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${CMS_ORIGIN}`,
  "font-src 'self' data:",
  // ws: is the dev server's hot-reload socket. The captcha is fetched from
  // /api/captcha, which 'self' already covers.
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  // Without this the map's iframe falls back to default-src and is blocked.
  `frame-src 'self' ${MAPS_FRAME} ${YOUTUBE_FRAME}`,
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
  output: "standalone",
  reactStrictMode: true,

  /** Announcing the framework and its version only helps someone shopping for a CVE. */
  poweredByHeader: false,

  images: {
    /*
      Only the CMS, and only its uploads path.

      next/image fetches whatever `src` it is given and re-serves it from this
      origin, so an unrestricted pattern turns the optimiser into an open
      proxy: any URL that reached a component would be fetched by our server
      and cached under our domain.
    */
    remotePatterns: [
      {
        protocol: new URL(CMS_ORIGIN).protocol.replace(":", ""),
        hostname: new URL(CMS_ORIGIN).hostname,
        ...(new URL(CMS_ORIGIN).port ? { port: new URL(CMS_ORIGIN).port } : {}),
        pathname: "/uploads/**",
      },
    ],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        /*
          The CMS live preview, and the only route on the site that may be
          framed.

          Everything else keeps `frame-ancestors 'none'` from securityHeaders
          above; this narrows the exception to one path and one origin rather
          than relaxing the site-wide policy. /preview renders only what its
          parent frame posts into it — it reads no draft from the database and
          has no session — so the worst a wrongly-allowed framer could do is
          look at content it supplied itself.

          X-Frame-Options cannot express "one specific other origin", and per
          CSP it is ignored whenever frame-ancestors is present. It is set to
          an invalid value here purely to stop the inherited DENY from the
          block above reaching browsers that check it first; frame-ancestors
          is what actually enforces the rule.
        */
        source: "/preview/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp.replace(
              "frame-ancestors 'none'",
              `frame-ancestors 'self' ${CMS_ADMIN_ORIGIN}`,
            ),
          },
          { key: "X-Frame-Options", value: "ALLOWALL" },
          // A preview is per-editor and never shared; no cache may hold it.
          { key: "Cache-Control", value: "no-store" },
        ],
      },
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
