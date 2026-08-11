-- Photo albums and their images.

CREATE TABLE IF NOT EXISTS gallery_albums (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  title       VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL,
  cover_id    CHAR(36)     NULL,
  event_date  DATE         NULL,
  description TEXT         NULL,
  status      ENUM('published','draft','review') NOT NULL DEFAULT 'draft',
  created_at  DATETIME(3)  NOT NULL,
  updated_at  DATETIME(3)  NOT NULL,
  UNIQUE KEY uq_gallery_albums_slug (slug),
  KEY idx_gallery_albums_status  (status),
  KEY idx_gallery_albums_event   (event_date),
  KEY idx_gallery_albums_updated (updated_at),
  FULLTEXT KEY ft_gallery_albums (title, description),
  CONSTRAINT fk_gallery_albums_cover FOREIGN KEY (cover_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- An image row is the album's own entry, not the media file: the same upload
-- can appear in two albums with different captions and positions.
--
-- media_id is ON DELETE CASCADE, unlike the SET NULL used for cover art: an
-- entry whose file is gone has nothing left to show, so the row goes with it.

CREATE TABLE IF NOT EXISTS gallery_images (
  id       CHAR(36)     NOT NULL PRIMARY KEY,
  album_id CHAR(36)     NOT NULL,
  media_id CHAR(36)     NOT NULL,
  caption  VARCHAR(255) NULL,
  position INT          NOT NULL DEFAULT 0,
  KEY idx_gallery_images_album (album_id, position),
  CONSTRAINT fk_gallery_images_album FOREIGN KEY (album_id) REFERENCES gallery_albums(id) ON DELETE CASCADE,
  CONSTRAINT fk_gallery_images_media FOREIGN KEY (media_id) REFERENCES media(id)          ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
