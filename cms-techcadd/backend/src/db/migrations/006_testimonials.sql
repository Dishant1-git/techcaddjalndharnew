-- Student testimonials.
--
-- The course link is ON DELETE SET NULL rather than RESTRICT: a testimonial is
-- still worth showing after a course is retired, it just loses the attribution.

CREATE TABLE IF NOT EXISTS testimonials (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  student_name VARCHAR(120) NOT NULL,
  photo_id     CHAR(36)     NULL,
  course_id    CHAR(36)     NULL,
  batch        VARCHAR(60)  NULL,
  -- 1..5, enforced here as well as in the schema so a direct write cannot
  -- store a rating the star display has no way to render.
  rating       TINYINT      NOT NULL DEFAULT 5,
  quote        VARCHAR(500) NOT NULL,
  video_url    VARCHAR(500) NULL,
  featured     TINYINT(1)   NOT NULL DEFAULT 0,
  status       ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  created_at   DATETIME(3)  NOT NULL,
  updated_at   DATETIME(3)  NOT NULL,
  KEY idx_testimonials_status   (status),
  KEY idx_testimonials_course   (course_id),
  KEY idx_testimonials_featured (featured),
  KEY idx_testimonials_updated  (updated_at),
  FULLTEXT KEY ft_testimonials (student_name, quote),
  CONSTRAINT ck_testimonials_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_testimonials_photo  FOREIGN KEY (photo_id)  REFERENCES media(id)   ON DELETE SET NULL,
  CONSTRAINT fk_testimonials_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
