-- Blog posts.
--
-- The author is a CMS user rather than a faculty member: it records who wrote
-- the post in the CMS, and survives as NULL if that account is later removed.

CREATE TABLE IF NOT EXISTS blogs (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  title            VARCHAR(200)  NOT NULL,
  slug             VARCHAR(220)  NOT NULL,
  author_id        CHAR(36)      NULL,
  category_id      CHAR(36)      NULL,
  cover_image_id   CHAR(36)      NULL,
  excerpt          VARCHAR(300)  NOT NULL,
  body             LONGTEXT      NOT NULL,
  publish_date     DATE          NULL,
  status           ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  meta_title       VARCHAR(120)  NULL,
  meta_description VARCHAR(255)  NULL,
  meta_keywords    JSON          NULL,
  og_image_id      CHAR(36)      NULL,
  canonical_url    VARCHAR(500)  NULL,
  created_at       DATETIME(3)   NOT NULL,
  updated_at       DATETIME(3)   NOT NULL,
  UNIQUE KEY uq_blogs_slug (slug),
  KEY idx_blogs_status   (status),
  KEY idx_blogs_updated  (updated_at),
  KEY idx_blogs_category (category_id),
  KEY idx_blogs_author   (author_id),
  KEY idx_blogs_publish  (publish_date),
  FULLTEXT KEY ft_blogs (title, excerpt),
  CONSTRAINT fk_blogs_author   FOREIGN KEY (author_id)      REFERENCES users(id)      ON DELETE SET NULL,
  CONSTRAINT fk_blogs_category FOREIGN KEY (category_id)    REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_blogs_cover    FOREIGN KEY (cover_image_id) REFERENCES media(id)      ON DELETE SET NULL,
  CONSTRAINT fk_blogs_og_image FOREIGN KEY (og_image_id)    REFERENCES media(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags are free text, so they live in a child table rather than an enum.
-- `position` keeps the order the author typed them in.

CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id  CHAR(36)     NOT NULL,
  tag      VARCHAR(60)  NOT NULL,
  position INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (blog_id, tag),
  KEY idx_blog_tags_tag (tag),
  CONSTRAINT fk_blog_tags_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
