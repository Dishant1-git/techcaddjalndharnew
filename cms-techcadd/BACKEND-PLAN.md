# TechCadd CMS — Backend & MySQL Plan

What to build to replace the browser mock with a real API and database, and the
(small) set of frontend changes that go with it.

**The key point:** the frontend was built against a single contract in
`src/api/types.ts`. If the backend matches that contract, **only `src/api/`
changes** — no component, page or hook is touched.

---

## 1. The contract the backend must satisfy

Every collection already implements this:

```ts
list(params: ListParams): Promise<ListResult<T>>
get(id: string): Promise<T>
create(input: TCreate): Promise<T>
update(id: string, input: TUpdate): Promise<T>
remove(ids: string[]): Promise<void>
```

```ts
interface ListParams {
  page: number
  pageSize: number
  search?: string
  sort?: { field: string; dir: 'asc' | 'desc' }
  filters?: Record<string, string | string[] | undefined>
}

interface ListResult<T> { items: T[]; total: number; page: number; pageSize: number }
```

### REST mapping

| Method | Path | Maps to |
| --- | --- | --- |
| `GET` | `/api/courses?page=1&pageSize=25&search=&sort=updatedAt&dir=desc&status=draft` | `list` |
| `GET` | `/api/courses/:id` | `get` |
| `POST` | `/api/courses` | `create` |
| `PATCH` | `/api/courses/:id` | `update` |
| `DELETE` | `/api/courses` — body `{ "ids": ["…"] }` | `remove` (bulk) |

Same shape for: `categories`, `pages`, `banners`, `blogs`, `faculty`,
`branches`, `testimonials`, `gallery`, `enquiries`, `media`, `redirects`,
`users`.

**Range filters** already exist in the UI: `createdAtFrom` / `createdAtTo` on
enquiries. Support `<field>From` / `<field>To` generically.

### Response envelopes

List responses must return exactly `{ items, total, page, pageSize }` — the
frontend reads `total` to drive pagination.

Errors must be JSON with the right HTTP status, so they map onto the existing
`ApiError`:

```json
{ "message": "Please fix the highlighted fields.",
  "fieldErrors": { "slug": "This slug is already in use." } }
```

`fieldErrors` keys must match form field names — the forms map them straight
back onto inputs. Slug uniqueness, duplicate emails and duplicate redirect
sources all rely on this.

### Non-CRUD endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Sets the session cookie |
| `POST` | `/api/auth/logout` | Clears it |
| `GET` | `/api/auth/me` | Current user; called on app boot |
| `POST` | `/api/auth/forgot-password` | Always 204, even for unknown emails |
| `POST` | `/api/auth/reset-password` | `{ token, password }` |
| `POST` | `/api/auth/change-password` | `{ currentPassword, newPassword }` |
| `POST` | `/api/media` | `multipart/form-data` upload → `MediaItem` |
| `GET` | `/api/settings` · `PATCH /api/settings` | Singleton |
| `GET` | `/api/search?q=` | Global search (grouped by type) |
| `GET` | `/api/dashboard/summary` | Counts + 7-day enquiry trend |

The dashboard currently fires ~12 count queries. One summary endpoint replaces
them all.

---

## 2. Recommended stack

| Concern | Choice | Why |
| --- | --- | --- |
| Runtime | Node 20+ | Same language as the frontend |
| Framework | Express or Fastify | Either is fine; Fastify is faster and has schema validation built in |
| ORM | Prisma | Generates TypeScript types that can be shared with the frontend, so the contract stays honest |
| DB | MySQL 8 | Required. Needs `utf8mb4` for correct Unicode |
| Validation | zod | The frontend schemas already exist — reuse them server-side |
| Auth | httpOnly cookie session | See §5 |
| Uploads | multer → local disk or S3 | Removes the 512 KB data-URL cap |

MySQL 8 specifically: it has CTEs, window functions and proper JSON support.
MySQL 5.7 will work but makes several queries harder.

---

## 3. MySQL schema

### Conventions

- **IDs**: `CHAR(36)` UUIDs. The frontend already treats ids as opaque strings,
  so this needs no translation. (`BINARY(16)` is faster but needs conversion at
  the edges — only worth it at much larger scale.)
- **Charset**: `utf8mb4` / `utf8mb4_unicode_ci` on every table.
- **Timestamps**: `created_at`, `updated_at` as `DATETIME(3)`, returned as ISO
  strings — the frontend sorts and range-filters on them.
- **Naming**: `snake_case` in SQL, mapped to `camelCase` in the API response.
  Do the mapping in one place (Prisma `@map`), not per query.
- **Soft delete**: not currently modelled. If you want restore, add
  `deleted_at DATETIME NULL` and filter it in every list query.

### Core tables

```sql
CREATE TABLE users (
  id            CHAR(36)     PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,          -- bcrypt/argon2, never plaintext
  role          ENUM('super-admin','admin','editor') NOT NULL DEFAULT 'editor',
  avatar_id     CHAR(36)     NULL,
  active        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    DATETIME(3)  NOT NULL,
  updated_at    DATETIME(3)  NOT NULL,
  UNIQUE KEY uq_users_email (email),            -- 190 chars: utf8mb4 index limit
  CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE media (
  id         CHAR(36)     PRIMARY KEY,
  filename   VARCHAR(255) NOT NULL,
  url        VARCHAR(500) NOT NULL,
  mime_type  VARCHAR(100) NOT NULL,
  size       INT UNSIGNED NOT NULL,
  width      INT UNSIGNED NULL,
  height     INT UNSIGNED NULL,
  alt        VARCHAR(255) NOT NULL DEFAULT '',
  folder     VARCHAR(120) NULL,
  created_at DATETIME(3)  NOT NULL,
  updated_at DATETIME(3)  NOT NULL,
  KEY idx_media_folder (folder),
  KEY idx_media_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
  id            CHAR(36)     PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  slug          VARCHAR(160) NOT NULL,
  parent_id     CHAR(36)     NULL,
  icon          VARCHAR(60)  NULL,
  accent_color  CHAR(7)      NULL,
  description   TEXT         NULL,
  sort_order    INT          NOT NULL DEFAULT 0,
  status        ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  created_at    DATETIME(3)  NOT NULL,
  updated_at    DATETIME(3)  NOT NULL,
  UNIQUE KEY uq_categories_slug (slug),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
    REFERENCES categories(id) ON DELETE RESTRICT   -- mirrors the UI's delete guard
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE courses (
  id               CHAR(36)     PRIMARY KEY,
  title            VARCHAR(200) NOT NULL,
  slug             VARCHAR(220) NOT NULL,
  category_id      CHAR(36)     NULL,
  short_description VARCHAR(255) NOT NULL,
  description      LONGTEXT     NOT NULL,        -- rich text HTML
  duration         VARCHAR(80)  NOT NULL,
  fee              DECIMAL(10,2) NOT NULL,       -- never FLOAT for money
  discounted_fee   DECIMAL(10,2) NULL,
  level            ENUM('beginner','intermediate','advanced') NOT NULL,
  mode             ENUM('online','offline','hybrid')          NOT NULL,
  thumbnail_id     CHAR(36)     NULL,
  eligibility      VARCHAR(255) NULL,
  certification    VARCHAR(255) NULL,
  featured         BOOLEAN      NOT NULL DEFAULT FALSE,
  status           ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  meta_title       VARCHAR(120) NULL,
  meta_description VARCHAR(255) NULL,
  meta_keywords    JSON         NULL,
  og_image_id      CHAR(36)     NULL,
  canonical_url    VARCHAR(500) NULL,
  created_at       DATETIME(3)  NOT NULL,
  updated_at       DATETIME(3)  NOT NULL,
  UNIQUE KEY uq_courses_slug (slug),
  KEY idx_courses_status  (status),
  KEY idx_courses_updated (updated_at),
  FULLTEXT KEY ft_courses (title, short_description),   -- powers ?search=
  CONSTRAINT fk_courses_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

`pages`, `blogs`, `banners`, `testimonials`, `gallery_albums`, `redirects`
follow the same pattern — see §3.3 for the fields each one needs.

### Child tables (the arrays)

The frontend entities contain arrays. Each becomes a child table with a
`position` column so drag-reorder survives a round trip:

```sql
CREATE TABLE course_syllabus (
  id        CHAR(36)     PRIMARY KEY,
  course_id CHAR(36)     NOT NULL,
  title     VARCHAR(200) NOT NULL,
  hours     SMALLINT UNSIGNED NULL,
  topics    JSON         NOT NULL,   -- short, always read whole: JSON is fine
  position  SMALLINT     NOT NULL,
  CONSTRAINT fk_syllabus_course FOREIGN KEY (course_id)
    REFERENCES courses(id) ON DELETE CASCADE,
  KEY idx_syllabus_course_pos (course_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE course_branches (            -- many-to-many
  course_id CHAR(36) NOT NULL,
  branch_id CHAR(36) NOT NULL,
  PRIMARY KEY (course_id, branch_id),
  CONSTRAINT fk_cb_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_cb_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE course_gallery (
  course_id CHAR(36) NOT NULL,
  media_id  CHAR(36) NOT NULL,
  position  SMALLINT NOT NULL,
  PRIMARY KEY (course_id, media_id),
  CONSTRAINT fk_cg_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_cg_media  FOREIGN KEY (media_id)  REFERENCES media(id)   ON DELETE CASCADE
);
```

Same treatment for:

| Array on the entity | Child table |
| --- | --- |
| `Course.highlights` | `course_highlights(course_id, value, position)` |
| `Branch.phones` | `branch_phones(branch_id, phone, position)` |
| `Branch.hours` | `branch_hours(branch_id, day, open_time, close_time, closed)` |
| `Branch.photos` | `branch_photos(branch_id, media_id, position)` |
| `Faculty.expertise` | `faculty_expertise(faculty_id, skill)` |
| `Blog.tags` | `blog_tags(blog_id, tag)` — index `tag` for filtering |
| `GalleryAlbum.images` | `gallery_images(id, album_id, media_id, caption, position)` |
| `EnquiryRecord.notes` | `enquiry_notes(id, enquiry_id, author_id, body, created_at)` |

**JSON vs child table:** use a child table when you filter, sort or join on the
values (tags, expertise, branches). Use JSON only for data always read as a
whole and never queried (`syllabus.topics`, `social` links, `meta_keywords`).

### Enquiries

```sql
CREATE TABLE enquiries (
  id             CHAR(36)     PRIMARY KEY,
  student_name   VARCHAR(120) NOT NULL,
  phone          VARCHAR(24)  NOT NULL,
  email          VARCHAR(190) NULL,
  course_id      CHAR(36)     NULL,
  course_name    VARCHAR(200) NOT NULL,   -- denormalised on purpose, see below
  branch_id      CHAR(36)     NULL,
  branch_name    VARCHAR(120) NOT NULL,
  source         ENUM('website','walk-in','phone','referral','social') NOT NULL,
  message        TEXT         NULL,
  status         ENUM('new','contacted','follow-up','converted','closed') NOT NULL DEFAULT 'new',
  assignee_id    CHAR(36)     NULL,
  follow_up_date DATE         NULL,
  created_at     DATETIME(3)  NOT NULL,
  updated_at     DATETIME(3)  NOT NULL,
  KEY idx_enq_status  (status),
  KEY idx_enq_created (created_at),
  KEY idx_enq_assignee(assignee_id),
  FULLTEXT KEY ft_enq (student_name, course_name, message),
  CONSTRAINT fk_enq_course   FOREIGN KEY (course_id)   REFERENCES courses(id)  ON DELETE SET NULL,
  CONSTRAINT fk_enq_branch   FOREIGN KEY (branch_id)   REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_enq_assignee FOREIGN KEY (assignee_id) REFERENCES users(id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

`course_name` and `branch_name` are stored as text **as well as** the foreign
key. That is deliberate: an enquiry is a historical record. If a course is
renamed or deleted two years later, the enquiry should still say what the
student actually asked about. The FK is for filtering; the text is the record.

### Settings

A single-row table is simplest and keeps types honest:

```sql
CREATE TABLE settings (
  id          TINYINT      PRIMARY KEY DEFAULT 1,
  site_name   VARCHAR(120) NOT NULL,
  tagline     VARCHAR(200) NULL,
  logo_id     CHAR(36)     NULL,
  favicon_id  CHAR(36)     NULL,
  contact_email VARCHAR(190) NULL,
  contact_phone VARCHAR(24)  NULL,
  address     TEXT         NULL,
  social      JSON         NOT NULL,
  robots_txt  TEXT         NOT NULL,
  notifications JSON       NOT NULL,
  integrations  JSON       NOT NULL,   -- encrypt recaptcha_secret at rest
  updated_at  DATETIME(3)  NOT NULL,
  CONSTRAINT chk_settings_single CHECK (id = 1)
);
```

### Auth support tables

```sql
CREATE TABLE sessions (
  id         CHAR(36)    PRIMARY KEY,
  user_id    CHAR(36)    NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME(3) NOT NULL,
  KEY idx_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_resets (
  token_hash CHAR(64)    PRIMARY KEY,   -- store the HASH, never the token
  user_id    CHAR(36)    NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  used_at    DATETIME(3) NULL,
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 4. Search, sorting and filtering

The UI puts sort and filter state in the URL, so those values arrive from the
client and **must be treated as untrusted**.

- **Whitelist sortable columns per resource.** Never interpolate `sort` into
  SQL. `ORDER BY ${req.query.sort}` is an injection hole.
- **Search**: `FULLTEXT` indexes with `MATCH … AGAINST` on the columns each
  module searches. `LIKE '%term%'` works but cannot use an index and will crawl
  once tables grow.
- **Pagination**: `LIMIT ?, ?` plus a `COUNT(*)` for `total`. For large tables,
  `SQL_CALC_FOUND_ROWS` is deprecated — run two queries.
- **Reordering** (categories, banners, faculty, gallery): the UI currently sends
  one `PATCH` per row. Add `PATCH /api/categories/reorder` taking
  `[{ id, order }]` and write it in a single transaction.

---

## 5. Authentication

The current mock compares a trivial digest **in the browser**. That must be
replaced entirely.

- **Hash with argon2id or bcrypt** (cost ≥ 12). Never store or log plaintext.
- **Prefer httpOnly, `Secure`, `SameSite=Lax` cookies over a JWT in
  localStorage.** A token in localStorage is readable by any XSS; an httpOnly
  cookie is not. This is the one place I would not compromise.
- **Keep the identical error message** for unknown email and wrong password.
  The frontend already does this — distinguishing them lets an attacker
  enumerate registered addresses.
- **`/forgot-password` must always return 204**, even for unknown emails, for
  the same reason. The UI already assumes this.
- **Store a hash of the reset token**, not the token. A leaked database should
  not hand over working reset links.
- **Rate-limit** `/auth/login` and `/auth/forgot-password` by IP and by account.
- **Enforce roles server-side.** `useCan()` in the frontend only hides UI. Every
  mutating route needs its own permission check.

---

## 6. Frontend changes

Small, and confined to `src/api/` plus auth.

**1. Environment**

```
# .env.development
VITE_API_URL=http://localhost:4000/api
```

**2. `src/api/client.ts`** — one fetch wrapper:

- prefixes `VITE_API_URL`
- sends `credentials: 'include'` so the session cookie travels
- parses `{ message, fieldErrors }` on non-2xx and throws the existing `ApiError`
- on `401`, clears auth state and redirects to `/login`

**3. `createHttpResource`** mirroring `createMockResource` — builds the five
methods from a base path and serialises `ListParams` into a query string. The
thirteen resource files then change one line each: swap the factory.

**4. Auth** — `AuthProvider` stops reading `localStorage`. On mount it calls
`GET /api/auth/me`; a `401` means signed out. Add a brief `status: 'loading'`
so the app doesn't flash the login screen while that request is in flight.

**5. Media** — `useUploadMedia` posts `FormData` to `/api/media` instead of
building data URLs. Delete `MOCK_UPLOAD_LIMIT` and the notice in `MediaBrowser`.

**6. Delete `src/api/mock/`** once cut over — or keep it behind
`VITE_API_MODE=mock` so the UI can still be developed offline.

**Nothing else changes.** No component, page, hook or form is touched.

---

## 7. Suggested build order

1. **Schema + migrations.** Prisma schema, `prisma migrate`, seed one super-admin.
2. **Auth** — login/logout/me first. Nothing else is testable without it.
3. **One resource end to end: Courses.** Prove list + filters + pagination +
   search + validation errors against the real UI before writing twelve more.
4. **Remaining CRUD resources** — they are near-identical once Courses works.
5. **Media upload** with real storage.
6. **Enquiries extras** — notes, bulk status, CSV export.
7. **Dashboard summary + global search** endpoints.
8. **Hardening** — rate limits, CORS allowlist, request logging, backups.

---

## 8. Things not to skip

- **CORS**: allowlist the CMS origin explicitly and enable credentials. `*` will
  not work with cookies.
- **CSRF**: cookie sessions need a token or strict `SameSite` on state-changing
  routes.
- **Validate on the server.** The zod schemas in `src/features/*/…Schema.ts` are
  the source of truth for shape — reuse them; client validation is a convenience,
  not a guarantee.
- **Transactions** for anything writing a parent plus its children (a course and
  its syllabus, an album and its images). A half-written course is worse than a
  rejected one.
- **Backups** before go-live, and confirm a restore actually works.
