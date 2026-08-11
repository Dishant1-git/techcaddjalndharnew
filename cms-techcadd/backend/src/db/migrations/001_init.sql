-- TechCadd CMS — initial schema
-- Ordered so foreign keys always point at tables that already exist.

CREATE TABLE IF NOT EXISTS media (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
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
  KEY idx_media_folder  (folder),
  KEY idx_media_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  -- 190 chars, not 255: utf8mb4 uses 4 bytes per char and InnoDB caps a single
  -- index column at 767 bytes on older row formats.
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('super-admin','admin','editor') NOT NULL DEFAULT 'editor',
  avatar_id     CHAR(36)     NULL,
  active        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME(3)  NOT NULL,
  updated_at    DATETIME(3)  NOT NULL,
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  expires_at DATETIME(3)  NOT NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME(3)  NOT NULL,
  KEY idx_sessions_user    (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  -- The hash is the key: a leaked database must not yield working reset links.
  token_hash CHAR(64)    NOT NULL PRIMARY KEY,
  user_id    CHAR(36)    NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  used_at    DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL,
  KEY idx_resets_user (user_id),
  CONSTRAINT fk_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  slug         VARCHAR(160) NOT NULL,
  parent_id    CHAR(36)     NULL,
  icon         VARCHAR(60)  NULL,
  accent_color CHAR(7)      NULL,
  description  TEXT         NULL,
  sort_order   INT          NOT NULL DEFAULT 0,
  status       ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  created_at   DATETIME(3)  NOT NULL,
  updated_at   DATETIME(3)  NOT NULL,
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  KEY idx_categories_order  (sort_order),
  -- RESTRICT mirrors the UI, which refuses to delete a category still in use.
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
    REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branches (
  id             CHAR(36)     NOT NULL PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  code           VARCHAR(20)  NOT NULL,
  address_line1  VARCHAR(200) NOT NULL,
  address_line2  VARCHAR(200) NULL,
  city           VARCHAR(80)  NOT NULL,
  state          VARCHAR(80)  NOT NULL,
  pincode        CHAR(6)      NOT NULL,
  email          VARCHAR(190) NULL,
  map_embed_url  VARCHAR(500) NULL,
  latitude       DECIMAL(10,7) NULL,
  longitude      DECIMAL(10,7) NULL,
  manager_id     CHAR(36)     NULL,
  status         ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  created_at     DATETIME(3)  NOT NULL,
  updated_at     DATETIME(3)  NOT NULL,
  UNIQUE KEY uq_branches_code (code),
  KEY idx_branches_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id                CHAR(36)      NOT NULL PRIMARY KEY,
  title             VARCHAR(200)  NOT NULL,
  slug              VARCHAR(220)  NOT NULL,
  category_id       CHAR(36)      NULL,
  short_description VARCHAR(255)  NOT NULL,
  description       LONGTEXT      NOT NULL,
  duration          VARCHAR(80)   NOT NULL,
  -- DECIMAL, never FLOAT: binary floats cannot represent money exactly.
  fee               DECIMAL(10,2) NOT NULL,
  discounted_fee    DECIMAL(10,2) NULL,
  level             ENUM('beginner','intermediate','advanced') NOT NULL,
  mode              ENUM('online','offline','hybrid')          NOT NULL,
  thumbnail_id      CHAR(36)      NULL,
  eligibility       VARCHAR(255)  NULL,
  certification     VARCHAR(255)  NULL,
  featured          TINYINT(1)    NOT NULL DEFAULT 0,
  status            ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  meta_title        VARCHAR(120)  NULL,
  meta_description  VARCHAR(255)  NULL,
  meta_keywords     JSON          NULL,
  og_image_id       CHAR(36)      NULL,
  canonical_url     VARCHAR(500)  NULL,
  created_at        DATETIME(3)   NOT NULL,
  updated_at        DATETIME(3)   NOT NULL,
  UNIQUE KEY uq_courses_slug (slug),
  KEY idx_courses_status   (status),
  KEY idx_courses_updated  (updated_at),
  KEY idx_courses_category (category_id),
  KEY idx_courses_featured (featured),
  FULLTEXT KEY ft_courses (title, short_description),
  CONSTRAINT fk_courses_category  FOREIGN KEY (category_id)  REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_courses_thumbnail FOREIGN KEY (thumbnail_id) REFERENCES media(id)      ON DELETE SET NULL,
  CONSTRAINT fk_courses_og_image  FOREIGN KEY (og_image_id)  REFERENCES media(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Child rows carry `position` so drag-reorder survives a save/reload cycle.

CREATE TABLE IF NOT EXISTS course_syllabus (
  id        CHAR(36)     NOT NULL PRIMARY KEY,
  course_id CHAR(36)     NOT NULL,
  title     VARCHAR(200) NOT NULL,
  hours     SMALLINT UNSIGNED NULL,
  topics    JSON         NOT NULL,
  position  SMALLINT     NOT NULL,
  KEY idx_syllabus_course (course_id, position),
  CONSTRAINT fk_syllabus_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_highlights (
  course_id CHAR(36)     NOT NULL,
  value     VARCHAR(160) NOT NULL,
  position  SMALLINT     NOT NULL,
  PRIMARY KEY (course_id, position),
  CONSTRAINT fk_highlights_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_branches (
  course_id CHAR(36) NOT NULL,
  branch_id CHAR(36) NOT NULL,
  PRIMARY KEY (course_id, branch_id),
  KEY idx_cb_branch (branch_id),
  CONSTRAINT fk_cb_course FOREIGN KEY (course_id) REFERENCES courses(id)  ON DELETE CASCADE,
  CONSTRAINT fk_cb_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_gallery (
  course_id CHAR(36) NOT NULL,
  media_id  CHAR(36) NOT NULL,
  position  SMALLINT NOT NULL,
  PRIMARY KEY (course_id, media_id),
  CONSTRAINT fk_cg_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_cg_media  FOREIGN KEY (media_id)  REFERENCES media(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE branches
  ADD CONSTRAINT fk_branches_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;
