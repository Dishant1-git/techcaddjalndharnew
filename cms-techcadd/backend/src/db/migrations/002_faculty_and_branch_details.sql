-- Faculty, plus the child tables that carry a branch's repeated fields.
--
-- Faculty and branches reference each other (a trainer belongs to a branch; a
-- branch has a manager who is a trainer), so both tables are created first and
-- the foreign keys added afterwards.

CREATE TABLE IF NOT EXISTS faculty (
  id               CHAR(36)     NOT NULL PRIMARY KEY,
  name             VARCHAR(120) NOT NULL,
  photo_id         CHAR(36)     NULL,
  designation      VARCHAR(120) NOT NULL,
  qualifications   VARCHAR(255) NOT NULL DEFAULT '',
  experience_years TINYINT UNSIGNED NOT NULL DEFAULT 0,
  bio              TEXT         NOT NULL,
  branch_id        CHAR(36)     NULL,
  email            VARCHAR(190) NULL,
  social           JSON         NOT NULL,
  sort_order       INT          NOT NULL DEFAULT 0,
  status           ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  created_at       DATETIME(3)  NOT NULL,
  updated_at       DATETIME(3)  NOT NULL,
  KEY idx_faculty_order  (sort_order),
  KEY idx_faculty_status (status),
  KEY idx_faculty_branch (branch_id),
  FULLTEXT KEY ft_faculty (name, designation, qualifications),
  CONSTRAINT fk_faculty_photo FOREIGN KEY (photo_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A child table rather than JSON: expertise is filtered and searched on.
CREATE TABLE IF NOT EXISTS faculty_expertise (
  faculty_id CHAR(36)     NOT NULL,
  skill      VARCHAR(80)  NOT NULL,
  position   SMALLINT     NOT NULL,
  PRIMARY KEY (faculty_id, position),
  KEY idx_expertise_skill (skill),
  CONSTRAINT fk_expertise_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branch_phones (
  branch_id CHAR(36)    NOT NULL,
  phone     VARCHAR(24) NOT NULL,
  position  SMALLINT    NOT NULL,
  PRIMARY KEY (branch_id, position),
  CONSTRAINT fk_phones_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branch_hours (
  branch_id  CHAR(36) NOT NULL,
  day        ENUM('mon','tue','wed','thu','fri','sat','sun') NOT NULL,
  open_time  TIME     NULL,
  close_time TIME     NULL,
  closed     TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (branch_id, day),
  CONSTRAINT fk_hours_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branch_photos (
  branch_id CHAR(36) NOT NULL,
  media_id  CHAR(36) NOT NULL,
  position  SMALLINT NOT NULL,
  PRIMARY KEY (branch_id, media_id),
  CONSTRAINT fk_bphotos_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_bphotos_media  FOREIGN KEY (media_id)  REFERENCES media(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The branch manager is a trainer, not a CMS login. The original constraint
-- pointed at `users`, which would have rejected every save the UI produced —
-- the manager dropdown lists faculty.
ALTER TABLE branches DROP FOREIGN KEY fk_branches_manager;

ALTER TABLE branches
  ADD CONSTRAINT fk_branches_manager FOREIGN KEY (manager_id)
    REFERENCES faculty(id) ON DELETE SET NULL;

ALTER TABLE faculty
  ADD CONSTRAINT fk_faculty_branch FOREIGN KEY (branch_id)
    REFERENCES branches(id) ON DELETE SET NULL;
