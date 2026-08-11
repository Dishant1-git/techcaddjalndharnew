-- Promotional banners.
--
-- Desktop and mobile artwork are separate columns rather than a child table:
-- there are exactly two, and the form treats them as distinct slots.

CREATE TABLE IF NOT EXISTS banners (
  id                CHAR(36)     NOT NULL PRIMARY KEY,
  title             VARCHAR(120) NOT NULL,
  desktop_image_id  CHAR(36)     NULL,
  mobile_image_id   CHAR(36)     NULL,
  alt_text          VARCHAR(255) NOT NULL,
  link_url          VARCHAR(500) NULL,
  cta_text          VARCHAR(80)  NULL,
  placement         ENUM('home-hero','course-page','sidebar','popup') NOT NULL DEFAULT 'home-hero',
  sort_order        INT          NOT NULL DEFAULT 0,
  -- A schedule window, inclusive at both ends. DATE rather than DATETIME:
  -- the editor picks days, and the public site compares against today.
  starts_at         DATE         NULL,
  ends_at           DATE         NULL,
  status            ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  created_at        DATETIME(3)  NOT NULL,
  updated_at        DATETIME(3)  NOT NULL,
  KEY idx_banners_placement (placement, sort_order),
  KEY idx_banners_status    (status),
  KEY idx_banners_updated   (updated_at),
  KEY idx_banners_window    (starts_at, ends_at),
  CONSTRAINT fk_banners_desktop FOREIGN KEY (desktop_image_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_banners_mobile  FOREIGN KEY (mobile_image_id)  REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
