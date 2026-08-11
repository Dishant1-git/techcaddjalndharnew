-- URL redirects.
--
-- from_path / to_path rather than from / to: `from` is a reserved word in
-- MySQL and would need backticks at every use site.

CREATE TABLE IF NOT EXISTS redirects (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  from_path  VARCHAR(500) NOT NULL,
  to_path    VARCHAR(500) NOT NULL,
  -- 301 is permanent and cached hard by browsers; 302 is temporary.
  type       SMALLINT     NOT NULL DEFAULT 301,
  enabled    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME(3)  NOT NULL,
  updated_at DATETIME(3)  NOT NULL,
  -- 500 chars of utf8mb4 exceeds InnoDB's index limit, so the uniqueness
  -- constraint covers the first 191 — long enough that two real paths cannot
  -- collide, and the repository checks the full string anyway.
  UNIQUE KEY uq_redirects_from (from_path(191)),
  KEY idx_redirects_enabled (enabled),
  KEY idx_redirects_updated (updated_at),
  CONSTRAINT ck_redirects_type CHECK (type IN (301, 302))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site settings: exactly one row, ever.
--
-- A single-row table rather than a key/value store, because the fields are
-- known and typed. The CHECK pins the id so a second row cannot be inserted
-- by accident.

CREATE TABLE IF NOT EXISTS settings (
  id            TINYINT      NOT NULL PRIMARY KEY DEFAULT 1,
  site_name     VARCHAR(120) NOT NULL DEFAULT '',
  tagline       VARCHAR(255) NULL,
  logo_id       CHAR(36)     NULL,
  favicon_id    CHAR(36)     NULL,
  contact_email VARCHAR(190) NULL,
  contact_phone VARCHAR(30)  NULL,
  address       TEXT         NULL,
  social        JSON         NULL,
  robots_txt    TEXT         NOT NULL,
  notifications JSON         NULL,
  integrations  JSON         NULL,
  created_at    DATETIME(3)  NOT NULL,
  updated_at    DATETIME(3)  NOT NULL,
  CONSTRAINT ck_settings_singleton CHECK (id = 1),
  CONSTRAINT fk_settings_logo    FOREIGN KEY (logo_id)    REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_settings_favicon FOREIGN KEY (favicon_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The row has to exist before anything can read it. A permissive robots.txt is
-- the safe default: an accidental Disallow would remove the site from search.
INSERT INTO settings (id, site_name, robots_txt, social, notifications, integrations, created_at, updated_at)
SELECT 1, 'TechCADD', 'User-agent: *\nAllow: /\n', '{}', '{}', '{}', NOW(3), NOW(3)
 WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);
