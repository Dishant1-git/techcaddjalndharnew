-- Student enquiries and their note timeline.
--
-- course_name and branch_name are stored alongside the ids on purpose. They
-- are a snapshot of what the student actually enquired about: renaming or
-- retiring a course later must not rewrite history, and the enquiry still
-- reads correctly once the id is nulled out.

CREATE TABLE IF NOT EXISTS enquiries (
  id             CHAR(36)     NOT NULL PRIMARY KEY,
  student_name   VARCHAR(120) NOT NULL,
  phone          VARCHAR(30)  NOT NULL,
  email          VARCHAR(190) NULL,
  course_id      CHAR(36)     NULL,
  course_name    VARCHAR(200) NOT NULL DEFAULT '',
  branch_id      CHAR(36)     NULL,
  branch_name    VARCHAR(120) NOT NULL DEFAULT '',
  source         ENUM('website','walk-in','phone','referral','social') NOT NULL DEFAULT 'website',
  message        TEXT         NULL,
  status         ENUM('new','contacted','follow-up','converted','closed') NOT NULL DEFAULT 'new',
  assignee_id    CHAR(36)     NULL,
  follow_up_date DATE         NULL,
  created_at     DATETIME(3)  NOT NULL,
  updated_at     DATETIME(3)  NOT NULL,
  KEY idx_enquiries_status    (status),
  KEY idx_enquiries_source    (source),
  KEY idx_enquiries_course    (course_id),
  KEY idx_enquiries_branch    (branch_id),
  KEY idx_enquiries_assignee  (assignee_id),
  KEY idx_enquiries_followup  (follow_up_date),
  KEY idx_enquiries_created   (created_at),
  KEY idx_enquiries_phone     (phone),
  FULLTEXT KEY ft_enquiries (student_name, message),
  CONSTRAINT fk_enquiries_course   FOREIGN KEY (course_id)   REFERENCES courses(id)  ON DELETE SET NULL,
  CONSTRAINT fk_enquiries_branch   FOREIGN KEY (branch_id)   REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_enquiries_assignee FOREIGN KEY (assignee_id) REFERENCES users(id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The note timeline. `author` is the name as it was at the time, not a user id:
-- the record of who said what should survive that account being removed.

CREATE TABLE IF NOT EXISTS enquiry_notes (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  enquiry_id  CHAR(36)     NOT NULL,
  author      VARCHAR(120) NOT NULL,
  body        TEXT         NOT NULL,
  created_at  DATETIME(3)  NOT NULL,
  KEY idx_enquiry_notes_enquiry (enquiry_id, created_at),
  CONSTRAINT fk_enquiry_notes_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
