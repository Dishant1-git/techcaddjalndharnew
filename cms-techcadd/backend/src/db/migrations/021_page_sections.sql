-- Turns a CMS page from one blob of HTML into a list of blocks.
--
-- `pages.content` is a single LONGTEXT rendered into one column of prose. That
-- is fine for a privacy notice and useless for anything else: an editor writing
-- a landing page could not place an image between two paragraphs, drop in a
-- video, or finish with a call to action, because the page had exactly one
-- shape and no way to express another.
--
-- Same columns as course_sections, deliberately. Both are "content an editor
-- added", both render through the same component, and giving pages their own
-- slightly-different block model would guarantee the two drift the first time
-- one gained a field. The only difference is what positions a block: a course
-- block is anchored to a generated section, a page is a flat ordered list, so
-- there is no anchor here.
--
-- `pages.content` is left in place and still renders when a page has no blocks.
-- Existing pages keep working untouched, and nothing has to be migrated by
-- hand before this ships.

CREATE TABLE IF NOT EXISTS page_sections (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  page_id     CHAR(36)      NOT NULL,
  -- 'blogs' renders recent posts, which is why pages have one type more than
  -- courses do — a course page already ends in its own related-courses strip.
  type        ENUM('rich-text','image','video','cta','blogs') NOT NULL,
  title       VARCHAR(200)  NULL,
  body        LONGTEXT      NULL,
  media_id    CHAR(36)      NULL,
  link_url    VARCHAR(500)  NULL,
  link_label  VARCHAR(120)  NULL,
  link_target ENUM('same','new') NOT NULL DEFAULT 'same',
  -- Off keeps the block in the CMS but takes it off the website, which is what
  -- an editor wants for something seasonal. Deleting is the other button.
  visible     TINYINT(1)    NOT NULL DEFAULT 1,
  position    INT           NOT NULL DEFAULT 0,
  created_at  DATETIME(3)   NOT NULL,
  updated_at  DATETIME(3)   NOT NULL,
  KEY idx_page_sections_page (page_id, position),
  CONSTRAINT fk_page_sections_page FOREIGN KEY (page_id)
    REFERENCES pages(id) ON DELETE CASCADE,
  -- SET NULL, not CASCADE: deleting a photograph should not silently delete
  -- the paragraph that was written to sit beside it.
  CONSTRAINT fk_page_sections_media FOREIGN KEY (media_id)
    REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
