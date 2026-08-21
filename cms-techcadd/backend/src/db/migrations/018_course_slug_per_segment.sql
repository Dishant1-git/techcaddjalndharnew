-- A slug is unique within its segment, not across the whole site.
--
-- The website routes a course page by segment *and* slug — /courses/<slug>,
-- /internship-training/<slug>, /after-12th-courses/<slug> — and migration 013
-- added idx_courses_segment_slug saying exactly that: "The site looks a course
-- up by segment and slug together." The uniqueness constraint never caught up,
-- so it still demanded that a slug be unique across all three.
--
-- That is stricter than the site needs and it rejects real courses. The
-- catalogue legitimately carries two names in two segments:
--
--   /courses/cybersecurity           and  /after-12th-courses/cybersecurity
--   /courses/generative-ai           and  /after-12th-courses/generative-ai
--
-- Both have their own live page. Under the old key only one of each could
-- exist in the CMS, so importing the catalogue failed on the second.
--
-- The narrower key still prevents the collision that actually matters — two
-- courses fighting over one URL.

ALTER TABLE courses
  DROP INDEX uq_courses_slug,
  ADD UNIQUE KEY uq_courses_segment_slug (segment, slug);
