-- Two content types the website carried in code.
--
-- Both are ordinary editorial content — someone answers a new question, or a
-- student leaves a review — so they belong with the rest of the CMS rather
-- than in a TypeScript file only a developer can change.

CREATE TABLE IF NOT EXISTS faqs (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  question   VARCHAR(300) NOT NULL,
  answer     TEXT         NOT NULL,
  -- Free text rather than an enum: the site groups by whatever categories
  -- exist, and adding "Hostel" should not need a migration.
  category   VARCHAR(80)  NOT NULL DEFAULT 'General',
  -- Ordering is by hand: the first question in a section opens by default, so
  -- it should be the one most people ask.
  sort_order INT          NOT NULL DEFAULT 0,
  /* The homepage shows a short selection rather than every question. */
  featured   TINYINT(1)   NOT NULL DEFAULT 0,
  status     ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  created_at DATETIME(3)  NOT NULL,
  updated_at DATETIME(3)  NOT NULL,
  KEY idx_faqs_category (category, sort_order),
  KEY idx_faqs_status   (status),
  KEY idx_faqs_featured (featured),
  FULLTEXT KEY ft_faqs (question, answer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews are distinct from testimonials: those are marketing quotes chosen
-- for the homepage band, these carry the shape a review actually has — a star
-- rating, a date and the place it was left.

CREATE TABLE IF NOT EXISTS reviews (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  author_name  VARCHAR(120) NOT NULL,
  rating       TINYINT      NOT NULL DEFAULT 5,
  quote        TEXT         NOT NULL,
  -- Month precision, as displayed ("March 2026"). Kept as text because that
  -- is how the source shows it and inventing a day would be a fabrication.
  reviewed_on  VARCHAR(40)  NULL,
  course_name  VARCHAR(200) NULL,
  /*
    Where the review was left.

    Only reviews genuinely left on Google may carry 'google' — the card shows
    the Google mark, which tells a visitor something specific about where it
    came from.
  */
  source       ENUM('google','website','walk-in') NOT NULL DEFAULT 'google',
  sort_order   INT          NOT NULL DEFAULT 0,
  status       ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  created_at   DATETIME(3)  NOT NULL,
  updated_at   DATETIME(3)  NOT NULL,
  KEY idx_reviews_status (status),
  KEY idx_reviews_order  (sort_order),
  FULLTEXT KEY ft_reviews (author_name, quote),
  CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
