-- Schema for the enquiry form (app/api/enquiry/route.ts -> lib/enquiries.ts).
--
-- The app creates this table automatically on first use. Run this by hand
-- instead — and set DB_AUTO_MIGRATE=false — when the application's database
-- user is not permitted to create tables, which is common on shared hosting.

CREATE TABLE IF NOT EXISTS enquiries (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(80)  NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  course      VARCHAR(120) NOT NULL,
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

-- Spent captcha nonces (lib/spent-captchas.ts). Rows live only until the
-- token they represent would have expired on its own.
CREATE TABLE IF NOT EXISTS spent_captchas (
  nonce      VARCHAR(32) NOT NULL,
  expires_at DATETIME    NOT NULL,
  PRIMARY KEY (nonce),
  KEY idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
