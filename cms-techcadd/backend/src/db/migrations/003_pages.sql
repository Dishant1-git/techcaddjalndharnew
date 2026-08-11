-- Static content pages (Home, About, Contact and so on).
--
-- `system` marks the pages the public site routes to by name. They can be
-- edited but not deleted, so a deploy can never end up with a dead /contact.

CREATE TABLE IF NOT EXISTS pages (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  title            VARCHAR(200)  NOT NULL,
  slug             VARCHAR(220)  NOT NULL,
  template         VARCHAR(60)   NOT NULL DEFAULT 'default',
  content          LONGTEXT      NOT NULL,
  -- Null until scheduled or published; stored as a date, not a timestamp,
  -- because the editor picks a day rather than a moment.
  publish_date     DATE          NULL,
  status           ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  -- Not `system`: that is a reserved word in MySQL 8 and would need quoting
  -- at every use site.
  is_system        TINYINT(1)    NOT NULL DEFAULT 0,
  meta_title       VARCHAR(120)  NULL,
  meta_description VARCHAR(255)  NULL,
  meta_keywords    JSON          NULL,
  og_image_id      CHAR(36)      NULL,
  canonical_url    VARCHAR(500)  NULL,
  created_at       DATETIME(3)   NOT NULL,
  updated_at       DATETIME(3)   NOT NULL,
  UNIQUE KEY uq_pages_slug (slug),
  KEY idx_pages_status  (status),
  KEY idx_pages_updated (updated_at),
  KEY idx_pages_system  (is_system),
  FULLTEXT KEY ft_pages (title, content),
  CONSTRAINT fk_pages_og_image FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
