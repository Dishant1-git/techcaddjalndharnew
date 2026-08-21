-- Removes a course field nothing has ever displayed.
--
-- `course_gallery` was in the schema, in the API payload and in the CMS's
-- validation rules, but it had no form control and the website never read it —
-- `CmsCourse` on the site does not carry the field at all. So it was a required
-- array that an editor could not fill in and a visitor could not see.
--
-- It was not harmless. Because the CMS schema demanded `gallery` while nothing
-- rendered a control for it, a course record that arrived without the key
-- failed validation against a field with no input to highlight — which is what
-- produced "This course could not be saved / check the highlighted fields"
-- with nothing highlighted.
--
-- Media on a course page is now the image block, which can sit anywhere in the
-- page rather than in one fixed strip, so there is nothing to replace this
-- with. Empty at the time of writing, so nothing is lost.

DROP TABLE IF EXISTS course_gallery;
