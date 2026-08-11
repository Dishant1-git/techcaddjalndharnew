# TechCadd CMS — Complete Frontend Build Prompt

> **How to use this document.** It is the full brief for finishing the TechCadd CMS
> frontend. Read §1–§5 before writing any code — they define the stack, the conventions and
> the architecture everything else assumes. §6–§10 are the specifications. §11–§13 are the
> plan and the bar for "done".
>
> Work **phase by phase** (§12). Do not start a module until Phase 0 is complete and Phase 1
> has been reviewed. Every phase must end with `npm run build` and `npm run lint` passing.
>
> §14 lists the assumptions I made on your behalf. If any is wrong, correct it there first —
> several of them cascade through the whole document.

---

## 1. Mission

Complete the admin CMS for **TechCadd**, a computer-training institute. The CMS manages the
public institute website: courses, categories, pages, banners, blogs, faculty, branches,
testimonials, gallery, enquiries, media, SEO and settings.

**This is a frontend-only build.** No backend exists yet (see §14.1). You will build against
a typed mock API with a single, clearly-marked swap point, so that replacing it with real
HTTP calls later touches exactly one directory.

**Scope:** 13 unbuilt modules, the auth flow, ~30 missing UI primitives, and the entire data
and state layer. The app shell and the dashboard are already done — do not rebuild them.

---

## 2. Stack and locked decisions

### 2.1 Already installed — do not swap

| Concern | Choice |
| --- | --- |
| Build | Vite 8 |
| Language | TypeScript 6, strict |
| UI | React 19 |
| Routing | react-router-dom 7 |
| Styling | Tailwind CSS v4 — CSS-first `@theme` in `src/index.css`, **no `tailwind.config.js`** |
| Icons | lucide-react |

Commands: `npm run dev` · `npm run build` (runs `tsc -b` first) · `npm run lint`.

### 2.2 Dependencies to add

Each is a resolved decision from the previous audit. Install in Phase 0.

```bash
npm i @tanstack/react-query \
      react-hook-form zod @hookform/resolvers \
      @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image \
      @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
      react-day-picker date-fns \
      clsx tailwind-merge \
      @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip \
      @radix-ui/react-popover @radix-ui/react-tabs @radix-ui/react-accordion \
      @radix-ui/react-switch @radix-ui/react-checkbox @radix-ui/react-radio-group \
      @radix-ui/react-select @radix-ui/react-slider
```

| Library | Why |
| --- | --- |
| **TanStack Query** | Caching, retries, invalidation and request dedupe would otherwise be hand-rolled 13 times. Owns all server state. |
| **react-hook-form + zod** | 13 modules × large forms. Uncontrolled inputs keep re-renders cheap; zod schemas are the single source of truth for both validation and inferred types. |
| **TipTap** | Rich text for Courses, Blogs and Pages. Headless, so it inherits the existing Tailwind styling. |
| **dnd-kit** | Reorderable syllabus modules, categories, banners, gallery images. Keyboard-accessible, which hand-rolled drag never is. |
| **react-day-picker + date-fns** | Date and date-range pickers (publish dates, enquiry filters, banner schedules). |
| **clsx + tailwind-merge** | `src/lib/cn.ts` is a naive joiner today, so `cn('p-2', 'p-4')` emits both and the winner is arbitrary. Upgrade it (§5.7). |
| **Radix primitives** | Focus traps, menu keyboard semantics and `aria-*` wiring are exactly where hand-rolled overlays fail. Unstyled, so all styling stays yours. **Overridable** — see §14.5. |

**Do not add anything else** without stating the reason. In particular: no UI kit
(MUI/AntD/Chakra), no CSS-in-JS, no Redux, no axios, no moment.

---

## 3. What already exists — do not rebuild

### 3.1 App shell — complete
- `src/components/layout/AdminLayout.tsx` — sidebar + header + `<Outlet/>`; mobile drawer
  with Escape-to-close and body scroll lock.
- `src/components/layout/Sidebar.tsx` — dark shell, desktop icon-collapse, mobile drawer,
  sections driven by `src/data/navigation.ts`, optional numeric badge per nav item.
- `src/components/layout/Header.tsx` — page title, search field, notification bell, profile
  dropdown with click-outside and Escape handling.
- `src/routes/AppRoutes.tsx` — generates one route per nav item; everything except `/`
  currently renders `Placeholder`.

### 3.2 Dashboard — complete
`src/pages/Dashboard.tsx` composes eight widgets from `src/components/dashboard/`. All
render correct empty states with zero seeded data. **Use these as the reference for tone,
spacing, comment density and structure.** When in doubt about how something should look or
read, open `WebsiteOverview.tsx` or `StatCard.tsx` and match it.

### 3.3 Design tokens — `src/index.css`
`primary-50…900` (brand indigo `#5f6fff`), `canvas`, `surface`, `shell-700/800/900`, the
`--font-sans` stack, and a `scrollbar-slim` utility. Extend this block for any new token;
never introduce raw hex in components.

### 3.4 Existing primitives — `src/components/common/`
`Button` (4 variants × 3 sizes, icon slot, `fullWidth`), `Card` / `CardHeader` / `CardBody`,
`Badge` (+ `EnquiryStatusBadge`, `ContentStatusBadge`), `EmptyState`, `Logo` / `LogoMark`.

Helpers: `src/lib/cn.ts`, `src/lib/format.ts`. Types: `src/types/index.ts`.

### 3.5 Data layer — intentionally empty
`src/data/mockData.ts` exports every collection as `[]` and every counter as `0`. This is
deliberate (§4.4) and must stay true: **the app ships with no sample records.**

---

## 4. Non-negotiable conventions

Extracted from the existing code. Code that ignores these will look foreign and be rejected.

### 4.1 Comments explain *why*, never *what*
Real examples already in the codebase:

```ts
// No content at all yet — an empty bar rather than NaN.
const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
```

Do not narrate the obvious (`// map over the items`). Keep density low — most functions need
no comment at all.

### 4.2 Export style
Named exports for components; `export default` only for page components (matches
`Dashboard.tsx`, `NotFound.tsx`, `Placeholder.tsx`).

### 4.3 Accessibility is not optional
Every existing component does all of this, and so must yours:
- Decorative icons get `aria-hidden="true"`. Icon-only buttons get `aria-label`.
- Tables carry an `sr-only` `<caption>` and `scope` on every header cell.
- Charts carry an `sr-only` `<table>` equivalent of the plotted data.
- Toggles set `aria-expanded` and `aria-controls`.
- Semantic elements (`<section>`, `<nav>`, `<dl>`, `<ol>`, `<figure>`) over `<div>` soup.
- Form controls are label-associated and wire `aria-describedby` / `aria-invalid`.

### 4.4 Never fabricate data
If a value isn't known, make the field optional and render an honest fallback rather than a
plausible-looking number. This rule already shaped `Stat.change?` and `WebsiteStatus.uptime?`
— a brand-new install shows *"No activity recorded yet"*, not `0% vs. last month`.

**Applied to this build:** the mock store starts empty. No lorem ipsum courses, no fake
student names, no seeded enquiries. A demo seed may exist only behind an explicit dev-only
opt-in (§5.3).

### 4.5 Guard empty and degenerate states
`Math.max(...[])` is `-Infinity`; `x / 0` is `NaN`. Both bugs existed here and were fixed.
Every list-backed view renders `<EmptyState>` when empty; every computed ratio guards its
denominator.

### 4.6 Styling
Tailwind only. No inline `style` except genuinely dynamic values (bar heights, progress
widths, drag transforms). Use tokens — `bg-primary-500`, never `bg-[#5f6fff]`. No CSS
modules, no CSS-in-JS.

### 4.7 Responsive, mobile-first
Wide tables scroll inside `.scrollbar-slim.overflow-x-auto`. Grids step
`grid-cols-1 → sm:grid-cols-2 → xl:grid-cols-3`. Every view must work at 360 px.

### 4.8 `navigation.ts` is the single source of truth
Sidebar, routes and header titles all derive from it. Adding a module means adding it there
first.

### 4.9 Definition of "done" for any file
`npm run build` and `npm run lint` both pass. No `any`, no `@ts-ignore`, no `console.log`,
no commented-out code, no TODO left behind without an issue reference.

---

## 5. Architecture to establish (Phase 0)

### 5.1 Target folder structure

```
src/
  api/                  ← the swap point. Everything network-shaped lives here.
    client.ts             HTTP wrapper (base URL, auth header, error normalisation)
    mock/
      store.ts            localStorage-backed in-memory DB
      handlers.ts         per-resource mock implementations
      latency.ts          simulated delay + failure injection for testing states
    resources/
      courses.ts          list/get/create/update/remove — typed, resource by resource
      categories.ts
      ...                 one file per module
    index.ts              chooses mock vs real from VITE_API_MODE
  components/
    common/             ← existing primitives + everything in §6
    form/               ← Input, Select, FormField, … (§6.1)
    data/               ← DataTable, Pagination, FilterBar (§6.3)
    feedback/           ← Toast, Skeleton, ErrorBoundary (§6.4)
    layout/             ← existing shell
    dashboard/          ← existing widgets
    media/              ← MediaPicker, Uploader (§9.1)
  features/             ← one folder per module: pages, forms, columns, schema
    courses/
      CoursesListPage.tsx
      CourseFormPage.tsx
      courseSchema.ts     zod schema — the single source of truth for the form
      courseColumns.tsx   DataTable column config
      useCourses.ts       Query hooks for this resource
    ...
  hooks/                useDebounce, useUrlState, useConfirm, useMediaQuery, …
  lib/                  cn, format, slugify, download-csv, …
  providers/            QueryProvider, AuthProvider, ToastProvider
  routes/               AppRoutes, ProtectedRoute, route constants
  types/                shared domain types
```

Keep `src/data/mockData.ts` only for the dashboard's structural config (stat cards, quick
actions, today panel). All record data moves to `src/api/`.

### 5.2 Data layer contract

Every resource module exposes the same five functions, so 13 modules share one shape:

```ts
export interface ListParams {
  page: number
  pageSize: number
  search?: string
  sort?: { field: string; dir: 'asc' | 'desc' }
  filters?: Record<string, string | string[] | undefined>
}

export interface ListResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

list(params: ListParams): Promise<ListResult<T>>
get(id: string): Promise<T>
create(input: TCreate): Promise<T>
update(id: string, input: TUpdate): Promise<T>
remove(ids: string[]): Promise<void>
```

Errors normalise to a single `ApiError { status, message, fieldErrors?: Record<string,string> }`
so forms can map server-side validation onto fields.

### 5.3 Mock store rules
- Backed by `localStorage` so CRUD genuinely persists across reloads — the CMS must feel real.
- **Starts completely empty.** Every collection is `[]` on first run.
- A demo dataset may exist, but only reachable via an explicit dev-only opt-in
  (`?seed=demo` or a Settings → Developer button) that is a no-op in production builds.
- `latency.ts` injects a configurable delay (default ~400 ms) and a failure-injection flag so
  loading and error states are actually testable rather than theoretical.

### 5.4 Server state — TanStack Query
- Query keys: `['courses', 'list', params]`, `['courses', 'detail', id]`.
- Mutations invalidate the matching list key; detail updates write through with `setQueryData`.
- Defaults: `staleTime` 30 s, one retry, no refetch-on-window-focus (an admin tool re-fetching
  on every alt-tab is noise).
- **Never** duplicate server data into `useState`. Local state is for UI only (open menus,
  drafts, selections).

### 5.5 Auth
- `AuthProvider` holds `{ user, status, login, logout }`; session persisted to `localStorage`.
- `ProtectedRoute` wraps the `AdminLayout` route; unauthenticated users redirect to `/login`
  with a `?next=` return path.
- `currentAdmin` in `mockData.ts` is deleted — the header and dashboard read the real user
  from context. Keep `techcadd-team` / `Super Admin` as the mock user's identity.
- Roles: `super-admin` | `admin` | `editor`. Gate destructive actions and Settings → Users
  behind a `useCan(permission)` hook. Never rely on hiding UI alone for security — note in
  code that the real check belongs on the server.
- Logout clears session and query cache, then redirects to `/login`.

### 5.6 Routing
- Keep the `navigation.ts`-driven generation, but replace the `Placeholder` element per module
  as it is built. Add nested routes: `/courses`, `/courses/new`, `/courses/:id/edit`.
- Route-level code splitting with `React.lazy` + a `<Suspense>` fallback that renders the
  page-level skeleton, not a bare spinner.
- Add `/login`, `/forgot-password`, `/reset-password` outside the admin layout, plus `/403`
  and an error-boundary-backed 500 view.
- Breadcrumbs derived from the route tree, rendered in the header beneath the title.

### 5.7 URL-driven list state
Page, page size, search, sort and every filter live in the query string via a `useUrlState`
hook. List views must be shareable and survive back/forward. Search is debounced ~300 ms and
`replace`s history rather than pushing an entry per keystroke.

### 5.8 Upgrade `cn`
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Joins class names and resolves conflicting Tailwind utilities (last wins). */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}
```
This is a drop-in replacement — the existing signature is a subset.

---

## 6. UI primitives to build

Nothing in this section exists yet. Build all of it in Phase 0. Every component: forwards
`className`, spreads remaining props to the root element, and is keyboard-operable.

### 6.1 Form primitives — `components/form/`

| Component | Requirements |
| --- | --- |
| `FormField` | Wrapper owning label, required marker, description, error text. Generates ids and wires `aria-describedby` / `aria-invalid`. Every control below composes with it. |
| `Input` | text / email / tel / number / password / search. Optional leading + trailing icon slots, error state, disabled, readonly. Password gets a show/hide toggle. |
| `Textarea` | Auto-grow option, optional character counter with limit. |
| `Select` | Single-select, searchable when > 10 options, grouped options, clearable. |
| `MultiSelect` | Chips for selected values, search, "select all", max-items cap. |
| `TagInput` | Free-text tags with Enter/comma to commit, Backspace to remove, duplicate guard. |
| `Checkbox`, `Radio`, `RadioGroup`, `Switch` | Label-associated; indeterminate state on Checkbox for table select-all. |
| `DatePicker`, `DateRangePicker` | Calendar popover, typed input, min/max, clearable. |
| `FileUpload` | Drag-and-drop + click, image previews, per-file progress, type and size validation, multi-file, remove-before-submit. |
| `ImageField` | Single image with preview, replace, remove — opens the **MediaPicker** (§9.1) rather than a raw file input. |
| `RichTextEditor` | TipTap. Toolbar: bold, italic, underline, H2/H3, bullet + ordered list, link, image (via MediaPicker), quote, code, undo/redo, clear formatting. Output HTML. Must be reachable and operable by keyboard. |
| `SlugInput` | Derives from a source field until manually edited, then stops tracking. Shows the resulting URL preview and a "regenerate" action. |
| `NumberInput` | Step buttons, min/max, optional currency or unit prefix. |
| `ColorInput` | Swatch + hex entry (banners, category accents). |

**Validation:** zod schema per module in `features/<module>/<module>Schema.ts`, resolved
through `@hookform/resolvers/zod`. Errors render inline beneath the field, are announced to
screen readers, and the first invalid field receives focus on failed submit.

### 6.2 Overlays — `components/common/`

| Component | Requirements |
| --- | --- |
| `Modal` | Radix Dialog. Sizes sm/md/lg/xl. Focus trap, Escape, scroll lock, restore focus on close. Header/body/footer slots. Optional "confirm before closing when dirty". |
| `Drawer` | Right-hand panel, same guarantees. Used for enquiry detail and quick preview. |
| `ConfirmDialog` | Title, body, destructive/neutral tone, confirm + cancel labels, pending state. Exposed through a `useConfirm()` hook returning a promise — no per-call boilerplate. |
| `DropdownMenu` | Radix. Replaces the hand-rolled menu in `Header.tsx`. Items, separators, destructive variant, disabled items, icon slot. |
| `Tooltip`, `Popover` | Radix. Tooltips never carry information available nowhere else. |
| `Sheet` (mobile) | Bottom sheet variant of Drawer for filter panels under `sm`. |

### 6.3 Data display — `components/data/`

**`DataTable` is the highest-leverage component in this build** — 13 list views depend on it.
Extract it from the bespoke table in `RecentEnquiries.tsx`.

Requirements:
- Column config: `{ id, header, accessor, cell?, sortable?, width?, align?, hideBelow? }`
- Sorting (server-driven, reflected in the URL), multi-column not required
- Row selection with header select-all (indeterminate) + a bulk-action bar that appears when
  a selection exists
- Sticky header; horizontal scroll via `.scrollbar-slim`
- Row actions column (DropdownMenu: view / edit / duplicate / delete)
- Loading → skeleton rows, error → inline retry, empty → `EmptyState`
- **Responsive fallback:** below `md`, render each row as a stacked card rather than forcing
  a horizontal scroll on a phone
- `sr-only` caption; `scope` on header cells; sort state announced via `aria-sort`

Also: `Pagination` (page numbers, prev/next, page-size selector, "showing X–Y of Z"),
`FilterBar` (search + filter controls + active-filter chips + "clear all"), `Tabs`,
`Accordion`, `Avatar` (initials fallback), `StatusPill` (extend the existing `Badge`),
`SortableList` (dnd-kit wrapper, keyboard-operable, used by syllabus/categories/gallery).

### 6.4 Feedback — `components/feedback/`

| Component | Requirements |
| --- | --- |
| `Toast` | Provider + `useToast()`. Variants success/error/info/warning. Auto-dismiss (errors persist), manual dismiss, optional action button, stacked, `role="status"` / `role="alert"`, respects `prefers-reduced-motion`. |
| `Skeleton` | Composable blocks; per-view skeletons that mirror real layout (table rows, card grid, form). Never a bare centred spinner for a full page. |
| `Spinner` | Inline only — buttons, small async regions. |
| `ErrorBoundary` | Wraps the router. Friendly message, "try again" (reset boundary), "back to dashboard". Logs to console in dev. |
| `Alert` | Page-level inline banner: info / warning / error / success, optional dismiss. |
| `ProgressBar` | Upload progress; reuse the bar styling from `WebsiteOverview.tsx`. |

---

## 7. Shared module pattern

All 13 modules follow one recipe. Build it once in Phase 1 (Courses) and copy it.

### 7.1 List page shell
```
Page header    — title, record count, primary "Add X" button, optional export
FilterBar      — debounced search, module filters, active-filter chips
DataTable      — columns, sort, selection, row actions, bulk bar
Pagination     — page size 10/25/50/100, default 25
```
All list state in the URL (§5.7). Deep-linking `/courses?status=draft&page=2` must work.

### 7.2 Form page shell
```
Page header      — breadcrumb, title ("Add Course" / "Edit Course"), Cancel + Save
Two-column grid  — main fields left (2/3), sidebar right (1/3: status, visibility,
                   thumbnail, category, SEO accordion). Single column below `lg`.
Sticky footer    — Cancel, Save as draft, Publish; disabled + spinner while pending
```
Requirements: unsaved-changes guard on navigate away; server field errors mapped back onto
inputs; success toast then redirect to the list; failure keeps the form intact with an
`Alert` at the top.

### 7.3 Standard actions
Every module supports: create, edit, delete (via `ConfirmDialog`), bulk delete, bulk status
change, and duplicate where it makes sense (courses, pages, banners, blogs).

---

## 8. Module specifications

Route table and field lists. Every module needs the §7 shells unless noted.

### 8.1 Courses — `/courses`
The reference implementation. Build this first and completely.

**Fields:** title, slug, category (ref), short description, full description (rich text),
duration, fee + discounted fee, level (beginner/intermediate/advanced), mode
(online/offline/hybrid), thumbnail (image), gallery (multi-image), **syllabus modules**
(repeatable, reorderable: module title + topics list + hours), highlights (tag list),
eligibility, certification, branches offered (multi-select), featured flag, SEO block (§9.2),
status (`published` | `draft` | `review`).

**List columns:** thumbnail + title, category, duration, fee, mode, status, updated, actions.
**Filters:** category, status, mode, level, branch, featured.

### 8.2 Categories — `/categories`
name, slug, parent (nested, max 2 levels), icon (lucide picker), accent colour, description,
display order, status. Tree/list view with **drag-reorder**; show course count per category
and block deletion of a category that still has courses (explain why in the dialog).

### 8.3 Pages — `/pages`
title, slug, template, rich content, SEO block, publish date, status. Row action: preview in
new tab. Protect system pages (home/contact) from deletion.

### 8.4 Banners — `/banners`
title, desktop image, mobile image, alt text, link URL, CTA text, placement (home-hero /
course-page / sidebar / popup), display order, schedule start + end, status.
**Card grid with live preview**, drag-reorder, and a visible "scheduled / expired / live"
indicator computed from the date range.

### 8.5 Blogs — `/blogs`
title, slug, author (ref faculty or user), category, tags, cover image, excerpt, rich body,
publish date, reading time (derived, read-only), status, SEO block.
Tabs: All / Published / Draft / Scheduled.

### 8.6 Faculty — `/faculty`
name, photo, designation, qualifications, expertise tags, years of experience, bio, branch
(ref), social links (LinkedIn/X/GitHub), email, display order, status.
**Card grid** (not a table), drag-reorder, search by name/expertise.

### 8.7 Branches — `/branches`
name, code, address lines, city, state, pincode, phone numbers (repeatable), email, map
coordinates or embed URL, opening hours (per-day), photos, manager (ref), status.
Card list with a map thumbnail; validate pincode and phone formats.

### 8.8 Testimonials — `/testimonials`
student name, photo, course (ref), batch/year, rating 1–5 (star input), quote, optional video
URL, featured flag, status. Card grid; filter by rating, course, featured.

### 8.9 Gallery — `/gallery`
Two levels. **Albums:** title, cover, event date, description, status. **Images within an
album:** file, caption, alt text, order. Bulk upload with per-file progress, drag-reorder,
lightbox preview, bulk delete.

### 8.10 Enquiries — `/enquiries`
**The highest-value module.** Read-mostly — enquiries arrive from the public site.

**Fields (read):** id, student name, phone, email, course, branch, source
(website/walk-in/phone/referral/social), message, created date.
**Fields (editable):** status (`new` → `contacted` → `follow-up` → `converted` | `closed`),
assignee, follow-up date, internal notes.

**List:** columns per the existing dashboard table; filters for status, branch, course, source
and date range; bulk status update and bulk assign; **CSV export** of the current filtered set.
**Detail drawer:** full enquiry, contact actions (`tel:`, `mailto:`, WhatsApp deep link),
status pipeline control, assignee, follow-up date, and an append-only notes timeline.
Reuse `EnquiryStatusBadge` — do not invent a second status vocabulary.

### 8.11 Media Library — `/media`
Grid and list toggle; drag-drop upload with progress; folders; filters by type and date;
search; preview modal with metadata; editable alt text; copy-URL; bulk select and delete;
storage-usage indicator.
**Must also work in picker mode** (§9.1) — this is the harder requirement of the two.

### 8.12 SEO — `/seo`
Per-page meta title / description / keywords / OG image with **character counters and
limits**, a Google SERP preview and a social-card preview, robots.txt editor, sitemap view +
regenerate, and a redirect manager (from → to, type 301/302, enabled).

### 8.13 Settings — `/settings`
Tabbed: **General** (site name, logo, favicon, contact details, social links, address),
**Profile** (own name, email, avatar), **Security** (change password with strength meter +
confirmation), **Users & Roles** (list, invite, change role, deactivate — `super-admin` only),
**Notifications** (per-event email/in-app toggles), **Integrations** (WhatsApp number,
analytics ID, reCAPTCHA key — mask secrets, reveal on demand).

### 8.14 Auth and error pages
`/login` (email + password, show/hide, remember me, inline error on bad credentials),
`/forgot-password` (email → confirmation state), `/reset-password` (token from URL, new +
confirm, strength meter), `/403`, and the error-boundary 500 view. Auth pages use a centred
split layout with the `Logo` — not the admin shell.

---

## 9. Cross-cutting features

### 9.1 MediaPicker
A `Modal` wrapping the Media Library grid, opened from every image field in every module.
Supports single and multi select, inline upload, search and type filter, returns
`{ id, url, alt, width, height }`. **Build the library and the picker as one component with
two modes** — do not fork them, or they will drift.

### 9.2 SEO block
A reusable `<SeoFields>` accordion (meta title, meta description, keywords, OG image, canonical
URL) embedded in the sidebar of Courses, Pages, Blogs. Character counters warn past the
recommended length rather than hard-blocking.

### 9.3 Status workflow
One shared control for `published | draft | review`, reusing `ContentStatusBadge`. Same
semantics and colours in all modules.

### 9.4 Global search
Wire the existing header search: debounced, queries across courses/blogs/pages/faculty/
enquiries, results grouped by type with keyboard navigation, `⌘K` / `Ctrl+K` to open, Escape
to close, empty and no-results states. **If this is cut from scope, remove the input** — dead
UI is worse than no UI.

### 9.5 Notifications panel
Popover behind the bell: recent enquiries and system events, unread state, mark-all-read,
"view all". The `UNREAD_NOTIFICATIONS` constant in `Header.tsx` is replaced by real data.
Same rule as above — wire it or remove the bell.

### 9.6 Dashboard activation
Once modules exist, the dashboard's zeroes become real: stat cards read live counts, the
enquiries chart reads the last 7 days, Recent Enquiries / Popular Courses / Recent Activity
read real records. **The empty states must survive** — a fresh install still shows them.

---

## 10. Accessibility and performance bar

**Accessibility**
- Full keyboard operation, no traps, visible focus everywhere (`:focus-visible` is already
  styled globally).
- Skip-to-content link; route changes announced via a live region.
- Modals and drawers trap focus and restore it on close.
- Colour is never the sole carrier of meaning — status pills pair colour with text.
- Text contrast ≥ 4.5:1; interactive targets ≥ 44 px on touch.
- Forms: label-associated controls, `aria-invalid`, errors announced, focus moves to the
  first invalid field on failed submit.
- Respect `prefers-reduced-motion` for toasts, drawers and skeleton shimmer.

**Performance**
- Route-level code splitting; TipTap and the chart loaded lazily.
- Lists virtualised only if a page can exceed ~200 rows (pagination should prevent it).
- Images lazy-loaded with explicit width/height to avoid layout shift.
- No unnecessary re-renders: uncontrolled form inputs, memoised table columns.

---

## 11. Definition of done — per module

- [ ] List, create, edit, delete and bulk actions all work against the mock API
- [ ] Loading (skeleton), error (retry) and empty (`EmptyState`) states all implemented
- [ ] Validation with inline accessible errors; submit disabled and spinning while pending
- [ ] Destructive actions confirm first; every outcome raises a toast
- [ ] Search, filters, sort and pagination all reflected in the URL and shareable
- [ ] Unsaved-changes guard on the form
- [ ] Responsive at 360 / 768 / 1440 px, including the table's card fallback
- [ ] Keyboard-operable end to end; correct ARIA; screen-reader pass
- [ ] Zero hardcoded sample records
- [ ] `npm run build` and `npm run lint` pass

---

## 12. Phase plan

| Phase | Deliverable | Gate |
| --- | --- | --- |
| **0 — Foundations** | Deps installed; folder structure; `cn` upgraded; mock API + store + latency; QueryProvider; ToastProvider; ErrorBoundary; all §6 primitives; DataTable; form primitives | Primitives demoable in isolation; build + lint green |
| **1 — Reference module** | **Courses**, complete, to the §11 bar | **Stop and get this reviewed.** It becomes the template for 12 more modules — mistakes here multiply |
| **2 — Content** | Categories, Blogs, Pages, Banners | |
| **3 — Institute** | Faculty, Branches, Testimonials, Gallery | |
| **4 — Enquiries** | List, filters, detail drawer, pipeline, notes, CSV export | |
| **5 — System** | Media Library + MediaPicker, then retrofit the picker into every image field built in phases 1–4; SEO; Settings | |
| **6 — Auth and wiring** | Login / forgot / reset, ProtectedRoute, real logout, roles, global search, notifications panel, 403/500, breadcrumbs, code splitting, README rewrite | |
| **7 — Hardening** | Keyboard pass, screen-reader pass, focus-trap audit, 360 px pass, reduced-motion, dashboard activation (§9.6), delete unused Vite template assets (`src/assets/react.svg`, `vite.svg`, `hero.png`) | |

---

## 13. Housekeeping to fold in
- `README.md` is still the stock Vite template — replace with real setup, structure and
  conventions documentation.
- `dist/` is checked into the working tree; add a `.gitignore` (the project is not yet a git
  repo).
- Delete `src/assets/react.svg`, `vite.svg` and `hero.png` if genuinely unused.
- Persist the sidebar collapse state to `localStorage` — it currently resets on reload.
- Remove `currentAdmin` from `mockData.ts` once `AuthProvider` lands.

---

## 14. Assumptions made on your behalf

Each was an open question in the previous audit. I picked a default so work can start. If one
is wrong, correct it **before Phase 0** — several cascade.

1. **No backend exists.** Building against a typed mock with one swap point (`src/api/`). If
   an API does exist, its contract replaces §5.2 and the mock layer is skipped entirely.
2. **Server state → TanStack Query.** Alternative: hand-rolled fetch hooks, at the cost of
   re-implementing caching and invalidation per module.
3. **Forms → react-hook-form + zod.**
4. **Rich text → TipTap.** If rich text is not actually needed, a plain `Textarea` removes
   four dependencies.
5. **Overlays → Radix primitives.** This is the most reversible call — the alternative is
   hand-rolled overlays plus a focus-trap utility, which is more code and more risk but zero
   new dependencies. Say so if you would rather stay dependency-free.
6. **Dark mode is out of scope for v1.** Tokens are structured so a second palette can be
   added later without touching components.
7. **The logo stays as SVG paths** (`Logo.tsx`). If official brand artwork exists, supply it
   and swap the component to an `<img>` — the file already documents this.
8. **Roles are `super-admin` / `admin` / `editor`.** Adjust if the real hierarchy differs.
9. **English only** — no i18n layer.
