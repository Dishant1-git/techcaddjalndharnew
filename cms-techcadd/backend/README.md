# TechCadd CMS — API

Express + MySQL backend for the CMS in `../frontend`.

## Setup

**1. MySQL.** Have MySQL 8 running locally (or point at a remote server).
Nothing needs creating by hand — the migration creates the database.

**2. Environment.**

```bash
cp .env.example .env
```

Fill in `DB_USER` / `DB_PASSWORD`, and generate a real cookie secret:

```bash
node -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

**3. Schema and first user.**

```bash
npm run db:migrate     # creates the database, applies migrations
npm run db:seed        # creates the first Super Admin
```

The seed prints the credentials it created. Override them if you like:

```bash
SEED_EMAIL=you@techcadd.com SEED_PASSWORD='YourStrongPass1' npm run db:seed
```

**4. Run.**

```bash
npm run dev            # http://localhost:4000
```

Check it: `curl http://localhost:4000/api/health`

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch mode via tsx |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Types only, no emit |
| `npm run db:migrate` | Apply pending migrations (safe to re-run) |
| `npm run db:seed` | Create the first Super Admin (idempotent) |

## Structure

```
src/
  config.ts              env parsed and validated at boot
  app.ts                 middleware + route wiring
  server.ts              entry, startup checks, graceful shutdown
  db/
    pool.ts              connection pool, query/execute/transaction helpers
    migrate.ts           migration runner
    seed.ts              first Super Admin
    migrations/*.sql     schema, applied in filename order
  http/
    errors.ts            HttpError + the error shape the CMS expects
    listParams.ts        query-string parsing, sort/filter whitelisting
    params.ts            route-param access
  middleware/auth.ts     session resolution, requireAuth, requireRole
  modules/
    auth/                login, logout, me, password reset/change
    courses/             the reference resource — routes, repo, schema
```

## The contract

Every resource exposes the same five operations, matching
`frontend/src/api/types.ts`:

| Method | Path | |
| --- | --- | --- |
| `GET` | `/api/courses?page=1&pageSize=25&q=&sort=updatedAt&dir=desc&status=draft` | list |
| `GET` | `/api/courses/:id` | get |
| `POST` | `/api/courses` | create |
| `PATCH` | `/api/courses/:id` | update |
| `DELETE` | `/api/courses` — body `{ "ids": [...] }` | bulk remove |

Lists return `{ items, total, page, pageSize }`.

Errors return `{ message, fieldErrors? }` with a matching HTTP status. The
`fieldErrors` keys are form field names — the CMS maps them straight back onto
inputs, which is how "This slug is already in use." lands on the slug field.

## Adding a resource

Copy `src/modules/courses/`. Each module is three files:

- **`*.schema.ts`** — zod, mirroring the frontend schema. Client validation is a
  convenience; this is the guarantee.
- **`*.repo.ts`** — SQL. Declare `SORTABLE` and `FILTERABLE` column maps;
  anything not in them is ignored rather than interpolated.
- **`*.routes.ts`** — the five endpoints plus role checks.

Then mount it in `app.ts`.

## Security notes

These are deliberate, not incidental:

- Passwords are **argon2id**. Login compares against a dummy hash when the user
  does not exist, so response timing does not reveal which emails are registered.
- Unknown email and wrong password return the **same message**, for the same reason.
- `/auth/forgot-password` **always returns 204**, even for unknown addresses.
- Password reset stores a **SHA-256 hash of the token**, never the token. A
  leaked database yields no working reset links.
- Sessions are **httpOnly, SameSite=Lax, signed cookies** — not a JWT in
  localStorage, which any XSS could read. `secure` turns on in production.
- Changing a password **revokes other sessions** but keeps the current one.
- `requireRole()` enforces permissions **server-side**. `useCan()` in the CMS
  only hides buttons.
- Sort and filter columns are **whitelisted**. Column names cannot be
  parameterised, so nothing from the query string ever reaches SQL directly.
- Rate limits on `/auth/login` and `/auth/forgot-password`.

## Still to build

- Remaining resources: categories, pages, banners, blogs, faculty, branches,
  testimonials, gallery, enquiries, media, redirects, users, settings.
- `POST /api/media` — multipart upload with real file storage.
- `GET /api/dashboard/summary` — counts + 7-day enquiry trend in one request.
- `GET /api/search` — global search across modules.
- A mailer, so password reset actually sends a link. The token is currently
  logged in development only.
- CSRF tokens if you later relax `SameSite`.
- A scheduled job calling `purgeExpired()` to clear stale sessions and tokens.
