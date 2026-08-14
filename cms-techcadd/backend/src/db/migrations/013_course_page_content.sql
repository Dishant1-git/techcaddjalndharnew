-- The copy a course page is built from.
--
-- The website generates each course page from a small spec — a tagline, who
-- hires for it, the job titles it leads to, the tools taught and a salary band
-- — and wraps that in template copy. Those six fields are the part a person
-- actually rewrites, so they belong in the CMS; the page layout does not.
--
-- careers and tools are JSON rather than child tables. They are short, flat
-- lists edited as a whole by a tag input, with no ordering to preserve beyond
-- array order and nothing else referencing them — the same reasoning as
-- meta_keywords. Highlights and syllabus modules stay child tables because
-- they carry their own fields and are reordered independently.

ALTER TABLE courses
  -- Which part of the site the course belongs to. Together with the slug this
  -- is the key the website looks its page up by.
  ADD COLUMN segment  VARCHAR(40)  NOT NULL DEFAULT 'courses' AFTER slug,
  -- One line: what the course actually is.
  ADD COLUMN tagline  VARCHAR(300) NULL AFTER short_description,
  -- One sentence on who in the region hires for it.
  ADD COLUMN demand   TEXT         NULL AFTER tagline,
  -- Job titles this course leads to.
  ADD COLUMN careers  JSON         NULL AFTER demand,
  -- Software and frameworks taught.
  ADD COLUMN tools    JSON         NULL AFTER careers,
  -- Realistic fresher band for the local market.
  ADD COLUMN salary   VARCHAR(120) NULL AFTER tools;

-- The site looks a course up by segment and slug together.
CREATE INDEX idx_courses_segment_slug ON courses (segment, slug);
