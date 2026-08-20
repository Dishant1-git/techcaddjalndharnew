-- Blocks an editor can add to a course page, and switches for the ones that
-- are generated.
--
-- The course template renders about fifteen sections from a small spec. That
-- covers the common shape well and covers nothing else at all: a course that
-- needs a walkthrough video, a placement-partner logo strip or one more
-- paragraph between two existing sections had no way to get one short of a
-- developer editing course-pages.ts.
--
-- Two mechanisms, deliberately separate:
--
--   course_sections   blocks the editor writes, each anchored to a generated
--                     section so "where does this go" is answered by picking
--                     a place on the page rather than by guessing a number.
--
--   hidden_sections   which generated sections to leave out. A list of ids on
--                     the course rather than a row per section, because the
--                     absence of a section is not a record with a lifecycle —
--                     nobody drafts, schedules or reorders "no reviews here".

CREATE TABLE IF NOT EXISTS course_sections (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  course_id   CHAR(36)      NOT NULL,
  -- What the block is. The website renders each kind with its own component,
  -- so this is a closed set rather than free text.
  type        ENUM('rich-text','image','video','cta') NOT NULL,
  title       VARCHAR(200)  NULL,
  -- Rich text for 'rich-text', a caption for 'image', a lead line for 'cta'.
  body        LONGTEXT      NULL,
  media_id    CHAR(36)      NULL,
  -- 'video' stores its embed here; 'cta' its destination.
  link_url    VARCHAR(500)  NULL,
  link_label  VARCHAR(120)  NULL,
  -- Whether the link leaves the site. Stored rather than guessed from the URL
  -- so an editor can send an internal link to a new tab if they mean to.
  link_target ENUM('same','new') NOT NULL DEFAULT 'same',
  -- The id of the generated section this block sits against, e.g. 'overview'.
  anchor      VARCHAR(40)   NOT NULL,
  placement   ENUM('before','after') NOT NULL DEFAULT 'after',
  -- Off keeps the block in the CMS but takes it off the website, which is what
  -- an editor wants for something seasonal. Deleting is the other button.
  visible     TINYINT(1)    NOT NULL DEFAULT 1,
  position    INT           NOT NULL DEFAULT 0,
  created_at  DATETIME(3)   NOT NULL,
  updated_at  DATETIME(3)   NOT NULL,
  KEY idx_course_sections_course (course_id, anchor, position),
  CONSTRAINT fk_course_sections_course FOREIGN KEY (course_id)
    REFERENCES courses(id) ON DELETE CASCADE,
  -- SET NULL, not CASCADE: deleting a photograph should not silently delete
  -- the paragraph that was written to sit beside it.
  CONSTRAINT fk_course_sections_media FOREIGN KEY (media_id)
    REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE courses
  -- Overrides the generated overview. One paragraph per line.
  ADD COLUMN overview        TEXT          NULL AFTER description,
  -- A walkthrough, shown in the overview section.
  ADD COLUMN video_url       VARCHAR(500)  NULL AFTER overview,
  ADD COLUMN video_title     VARCHAR(200)  NULL AFTER video_url,
  -- Ids of generated sections to leave off this course's page.
  ADD COLUMN hidden_sections JSON          NULL AFTER video_title;
