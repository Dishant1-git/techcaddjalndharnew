# Security posture

What the code enforces, what it deliberately does not, and what only you can do
on the server. Written against the app as it stands: a statically generated
Next.js marketing site with two public API routes, one MySQL database, no
accounts, no sessions, no file uploads, no admin UI.

---

## 1. The attack surface

Everything a stranger can reach:

| Surface | What it does | Controls in front of it |
| --- | --- | --- |
| `GET /api/captcha` | Mints a signed arithmetic challenge | Per-IP rate limit, `no-store` |
| `POST /api/enquiry` | Writes one row to `enquiries` | Origin check → per-IP rate limit → body cap → HMAC captcha → field validation → per-phone/per-IP DB limits → single-use token claim |
| Static pages | Prerendered HTML | CSP and the header set below |

There is no login, no cookie, no session, no upload and no user-generated
content rendered to other visitors. That removes most of the classic web
vulnerability classes outright — the realistic threats here are **form abuse**
(spam, flooding, junk data), **data exposure** (the enquiries table is personal
data), and **infrastructure compromise** (credentials, database privileges).

---

## 2. What was changed

**Security headers and CSP** — `next.config.mjs`
Every response now carries a Content Security Policy, HSTS, `nosniff`,
`frame-ancestors 'none'` / `X-Frame-Options: DENY` (clickjacking on the enquiry
popup was possible before), `Referrer-Policy`, `Permissions-Policy`, COOP and
CORP. `X-Powered-By` is off. `/api/*` is `no-store` so no proxy or browser cache
retains enquiry traffic.

**Origin check on the enquiry endpoint** — `lib/request-guard.ts`
A cross-site page can POST JSON-shaped `text/plain` without triggering a
preflight, so the browser never blocks it. `POST /api/enquiry` now requires an
`Origin` (or `Referer`) matching the site's own host, an entry in
`ALLOWED_ORIGINS`, or localhost in development. This is not CSRF protection —
there is no session to ride — it stops a third-party page filling your table
using its own visitors' browsers.

**Rate limiting ahead of the database** — `lib/rate-limit.ts`
Both routes are capped per address before any parsing or SQL: 30 challenges and
12 enquiry attempts per 10 minutes. The captcha alone never stopped a determined
bot — solving `4 + 7` is free — it only made each attempt cost a round trip. The
existing per-phone (3/day) and per-IP (5/hour) database limits still apply
behind this.

**Trustworthy client addresses** — `lib/request-guard.ts`
The old code read the leftmost `X-Forwarded-For` entry, which is the value a
client writes for itself; every IP-keyed limit was therefore bypassable by
sending one header. Addresses are now resolved by counting back from the right
using `TRUSTED_PROXY_HOPS`, or from a proxy-overwritten header via
`CLIENT_IP_HEADER`, and ignored entirely when the app is exposed directly.

**The captcha secret fails closed** — `lib/captcha.ts`
`CAPTCHA_SECRET` previously fell back to a hardcoded string that lives in this
repository. Anyone reading it could mint tokens and compute their answers — not
a weak captcha, no captcha. Production now refuses to issue or verify a
challenge unless the secret is set and at least 32 characters, and the enquiry
route returns 500 rather than degrading to "no verification".

**Stored-data hygiene** — `app/api/enquiry/route.ts`
Control characters are stripped from every submitted field (newline and tab
survive in the message, which is a textarea). They never occur in typed input,
and one smuggled into a stored value forges lines in any log, CSV export or
admin screen that later reads the table.

**JSON-LD escaping** — `lib/json-ld.ts`
`JSON.stringify` into `<script type="application/ld+json">` leaves `<`
untouched, so a `</script>` inside any value closes the element early and the
rest is parsed as markup. All values are ours today; the escape is what keeps
that true if a course title or testimonial is ever loaded from the database.

**Availability fix** — `lib/enquiries.ts`, `lib/spent-captchas.ts`
A failed schema migration was cached as a rejected promise for the life of the
process: one dropped connection would have left the form broken until the next
deploy. Failures are now cleared and retried.

### Already sound before this pass, and left alone

- Every query uses `?` placeholders (`lib/db.ts`). The only interpolated SQL is
  DDL in `ensureColumn`/`ensureIndex`, whose names are string literals in our
  own source — no injection path.
- The captcha signature comparison is constant-time and length-guarded.
- Solved tokens are single-use via a primary-key insert, so a replay is a
  duplicate-key error rather than a check-then-insert race.
- The course field is validated against the catalogue server-side, so the
  read-only input on course pages is a real lock, not a UI one.
- Request bodies are capped at 4 KB, checked both by `Content-Length` and after
  reading.
- Error responses are generic; the underlying exception stays in server logs.

---

## 3. Accepted risks, stated plainly

**`script-src 'unsafe-inline'`.** Next.js emits inline hydration scripts on
every page. Removing `'unsafe-inline'` requires per-request nonces, which
requires middleware and forces every page to render dynamically — a real cost
for a site whose pages are all static. The CSP still blocks loading foreign
script, which is the exploitable half; React escapes everything it renders, so
there is no inline-injection route in today's code. Revisit if user-generated
content is ever displayed.

**In-memory rate limiting.** Counters live in the process: they reset on deploy,
and behind multiple app instances each holds its own, multiplying the effective
limit. Fine for one Node process; put the real limit at Cloudflare or Nginx if
you scale out. It is also no defence against a volumetric DDoS — that has to be
absorbed upstream.

**`X-Forwarded-For` is still a header.** With `TRUSTED_PROXY_HOPS` set
correctly it cannot be forged. Set it too high and it can. Verify it (§5).

**Unattributed traffic shares one bucket.** When no address can be trusted, all
callers fall into a single counter set 25× higher — a flood ceiling, not a
per-person limit, since a shared limit of 12 would lock out the whole site. It
is the weakest configuration; prefer a correct `TRUSTED_PROXY_HOPS`.

---

## 4. Do these on the server — code cannot

1. **Set `CAPTCHA_SECRET` before the next deploy.** Production now returns 500
   from `/api/captcha` without it. Generate:
   `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
2. **Rotate anything that was ever committed.** `.env.example` previously held
   `DB_PASSWORD=root123` and a real-looking `CAPTCHA_SECRET`. Committed values
   are public forever, including in history — change them at the source rather
   than editing the file.
3. **Least-privilege database user.** The app needs `SELECT`, `INSERT` and
   `DELETE` on two tables and nothing more. Apply `db/schema.sql` by hand and
   set `DB_AUTO_MIGRATE=false`; a runtime that cannot run DDL cannot be made to
   drop your tables.
   ```sql
   CREATE USER 'techcadd_app'@'localhost' IDENTIFIED BY '<long random>';
   GRANT SELECT, INSERT, DELETE ON techcaddjal.enquiries TO 'techcadd_app'@'localhost';
   GRANT SELECT, INSERT, DELETE ON techcaddjal.spent_captchas TO 'techcadd_app'@'localhost';
   ```
   No `DROP`, no `GRANT`, no `FILE`, and never the `root` account.
4. **TLS everywhere.** Redirect `http` → `https` at the proxy; the HSTS header
   the app sends is ignored over plain http. Set `DB_SSL=true` for any database
   reached over a network you do not own.
5. **Set `TRUSTED_PROXY_HOPS` to match reality** (§5), or the per-IP limits are
   theatre.
6. **Put Cloudflare (or equivalent) in front.** It is the only practical answer
   to volumetric attacks, and it gives you bot filtering the app cannot do. If
   you do, set `CLIENT_IP_HEADER=cf-connecting-ip`.
7. **Lock down the admin path.** phpMyAdmin/cPanel is now the softest target on
   the box: the enquiries table is reachable there in plaintext. MFA, IP
   allowlist, and no shared logins.
8. **Back up, and treat the table as personal data.** Names and phone numbers of
   prospective students are personal data under the DPDP Act. Encrypt backups,
   restrict who can export, and agree a retention period — delete enquiries once
   they are past use rather than keeping them indefinitely.
9. **Watch dependencies.** `npm audit` currently reports 3 high-severity issues,
   all transitive through `next` (`postcss` source-map disclosure, `sharp`/libvips
   CVEs). Neither is reachable from user input here — no CSS is compiled at
   runtime and no user-supplied image is processed — so this is not an emergency,
   but the fix is a Next.js major upgrade and should be scheduled deliberately,
   not run as `npm audit fix --force` on a Friday.

---

## 5. Verify it

Headers, against the deployed site:

```bash
curl -sSI https://techcadd.com | findstr /i "content-security-policy strict-transport x-frame x-content-type referrer permissions"
```

Proxy hops — submit the form normally, then check what landed:

```sql
SELECT id, form_type, ip, created_at FROM enquiries ORDER BY id DESC LIMIT 5;
```

The `ip` column must show *your* public address (`curl ifconfig.me`). If it
shows a proxy's address or `NULL`, `TRUSTED_PROXY_HOPS` is too low; if a value
you can change by sending `X-Forwarded-For: 1.2.3.4` appears, it is too high.

Origin check — this must return 403:

```bash
curl -i -X POST https://techcadd.com/api/enquiry -H "Origin: https://evil.example" -H "Content-Type: application/json" -d "{}"
```

If your *own* form starts getting that 403 — most likely when the site is served
on a domain other than the one in `lib/site.ts` and the proxy rewrites `Host` —
add the live origin to `ALLOWED_ORIGINS`.

Rate limit — the 13th enquiry attempt inside 10 minutes must return 429 with a
`Retry-After` header.
