# How the website reads the CMS

Two processes and one database each:

| | Runs | Port | Database |
| --- | --- | --- | --- |
| Website | `npm run dev` (repo root) | 3000 | `TechcaddJal` |
| CMS API | `npm run dev` in `cms-techcadd/backend` | 4000 | `techcadd_cms` |
| CMS admin UI | `npm run dev` in `cms-techcadd/frontend` | 5173 | — (talks to :4000) |

**The two databases must stay separate.** Both schemas define a table called
`enquiries` and the shapes are incompatible — the website's has an `INT` id with
`name`/`course`, the CMS's a `CHAR(36)` id with `student_name`/`course_name`.
Pointed at one database, whichever created the table first wins and the other's
inserts fail at runtime. On Windows MySQL folds database names to lower case, so
`techcaddjal` resolves to the website's `TechcaddJal` rather than to a new
database; `techcadd_cms` is named so it cannot collide by casing either.

## Wiring

`CMS_API_URL` in `.env.local` is the only address the website has. Three things
derive from it, which is why moving the CMS is one edit rather than three:

- `lib/cms.ts` — the fetch base for every read and for enquiry submission
- `middleware.ts` — the redirect rules, fetched once a minute
- `next.config.mjs` — the image origin, in both the CSP `img-src` and
  `images.remotePatterns`. Without it every uploaded photograph is blocked by
  our own policy and refused by `next/image` before it is requested.

`REVALIDATE_SECRET` must be **identical** in `.env.local` and
`cms-techcadd/backend/.env`. The CMS pings `POST /api/revalidate` after any
successful save; the website drops every cached CMS response in one call. If the
two secrets differ the ping is rejected with a 401 and a published change waits
out `CMS_CACHE_SECONDS` instead — which to an editor is indistinguishable from
the save not having worked.

## What comes from the CMS

Everything below is read through `lib/content.ts`, never from `lib/cms.ts`
directly. That indirection is the point: each loader falls back to the
checked-in constants when the CMS is empty or unreachable, so the site renders
either way.

| Content | Loader | Falls back to |
| --- | --- | --- |
| Blog cards + article pages | `loadPosts` | `lib/blogs.ts` |
| Google reviews | `loadReviews` | `lib/reviews.ts` |
| Homepage testimonials | `loadTestimonials` | `lib/testimonials.ts` |
| Gallery photographs | `loadGalleryTiles` | `lib/gallery.ts` |
| FAQs, and the homepage selection | `loadFaqs`, `loadHomepageFaqs` | `lib/faqs.ts` |
| The stats band | `loadStats` | `lib/stats.ts` |
| Course category cards | `loadCourseCategories` | `lib/categories.ts` |
| Course page copy | `loadCourseSpecs` | `lib/course-specs.ts` |
| Courses with no menu entry | `loadCourseCatalogue` | nothing — they simply do not exist |
| Standalone pages (`/[slug]`) | `getPage` | 404 |
| Redirects | `middleware.ts` | no redirects this minute |

Only `loadReviews` filters: a card carrying the Google mark is telling a visitor
where the review was left, so `source: 'walk-in'` records are dropped rather
than relabelled.

**Not from the CMS, deliberately:** `lib/site.ts`. The CMS settings row holds a
strict subset — name, tagline, contact email and phone, address, socials — and
none of the geo coordinates, the Maps `cid`, or `areasServed` that the
structured data depends on. It is also read synchronously by every page's
`export const metadata`. Moving it would lose precision in exchange for a large
refactor. The stats array is the one part of that row the site does read.

## First run

```powershell
# 1. The CMS database
mysql -u root -p -e "CREATE DATABASE techcadd_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. The API
cd cms-techcadd\backend
npm install
npm run db:migrate
npm run db:seed        # creates the first admin — the command prints the credentials
npm run dev            # :4000

# 3. The admin UI, in another terminal
cd cms-techcadd\frontend
npm install
npm run dev            # :5173

# 4. The website, in a third
npm run dev            # :3000
```

`npm install` in the backend needs a C++ toolchain on Windows, because `argon2`
has no prebuilt binary for this platform and is compiled from source. Without
Visual Studio Build Tools ("Desktop development with C++") the install fails at
`node-gyp`.

## Checking the connection

With the CMS down, every page still renders its built-in content and the server
log carries a `[content] <label>: using built-in content` line per section. That
is the healthy failure, not an error to chase.

With the CMS up, publish something and it should appear on the next reload —
`CMS_CACHE_SECONDS=0` in development, and the revalidate ping covers production.
If a change does not appear, check the two `REVALIDATE_SECRET` values match
before looking anywhere else.
