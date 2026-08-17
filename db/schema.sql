-- Schema for the enquiry form (app/api/enquiry/route.ts -> lib/enquiries.ts).
--
-- The app creates this table automatically on first use. Run this by hand
-- instead — and set DB_AUTO_MIGRATE=false — when the application's database
-- user is not permitted to create tables, which is common on shared hosting.

CREATE TABLE IF NOT EXISTS enquiries (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Which form the row came from: "Call Request" (site-wide popup),
  -- "Course Enquiry" (the form on every course page), "Contact Form"
  -- (/contact) or "Brochure Download". Nullable because rows predating the
  -- column cannot be attributed to any of them.
  form_type   VARCHAR(32)  NULL,
  name        VARCHAR(80)  NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  course      VARCHAR(120) NOT NULL,
  -- Only the course-page form asks for this; popup and brochure rows store
  -- NULL.
  message     TEXT         NULL,
  -- Only the brochure form asks for these; every other form's rows store
  -- NULL.
  email       VARCHAR(190) NULL,
  address     VARCHAR(300) NULL,
  source      VARCHAR(255) NULL,
  ip          VARCHAR(45)  NULL,
  user_agent  VARCHAR(255) NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_created_at (created_at),
  -- Both composites back the rate-limit counts in lib/enquiries.ts.
  KEY idx_phone_created (phone, created_at),
  KEY idx_ip_created (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Upgrading a database created before these columns existed. The app applies
-- all of these itself unless DB_AUTO_MIGRATE=false; MySQL has no ADD COLUMN
-- IF NOT EXISTS, so run them once by hand and ignore a duplicate-column error.
-- ALTER TABLE enquiries ADD COLUMN message   TEXT         NULL AFTER course;
-- ALTER TABLE enquiries ADD COLUMN form_type VARCHAR(32)  NULL AFTER id;
-- ALTER TABLE enquiries ADD COLUMN email     VARCHAR(190) NULL AFTER message;
-- ALTER TABLE enquiries ADD COLUMN address   VARCHAR(300) NULL AFTER email;

-- Clearing test enquiries so ids start at 1 again.
--
-- DELETE never moves the AUTO_INCREMENT counter, and InnoDB persists it across
-- a restart, so emptying the table by hand leaves the next row at 11 rather
-- than 1. That is MySQL working as intended: an id that has been handed out
-- once should not be handed out again. Either of these resets it.
--
--   TRUNCATE TABLE enquiries;
--
-- or, when you want the DELETE's WHERE clause or its rollback:
--
--   DELETE FROM enquiries;
--   ALTER TABLE enquiries AUTO_INCREMENT = 1;
--
-- TRUNCATE is the one to reach for. It drops and recreates the table rather
-- than deleting row by row, so it is far faster and resets the counter as part
-- of the same statement. It is also DDL: it commits immediately and cannot be
-- rolled back, which is exactly why it belongs on a development database and
-- not on live enquiry data.
--
-- DEVELOPMENT ONLY. Never reset the counter on a table that has had real
-- enquiries in it. Ids are what a counsellor quotes and what the CSV export
-- carries, and reusing one silently re-points every earlier reference at a
-- different student.

-- Spent captcha nonces (lib/spent-captchas.ts). Rows live only until the
-- token they represent would have expired on its own.
CREATE TABLE IF NOT EXISTS spent_captchas (
  nonce      VARCHAR(32) NOT NULL,
  expires_at DATETIME    NOT NULL,
  PRIMARY KEY (nonce),
  KEY idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
