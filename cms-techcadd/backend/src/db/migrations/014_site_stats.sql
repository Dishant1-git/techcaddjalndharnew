-- The headline numbers on the homepage and the about page.
--
-- Four figures — years running, students trained, courses offered, placement
-- rate — that go stale quietly. They are site-wide singular facts rather than
-- records with their own lifecycle, so they sit on the settings row instead of
-- getting a table: nobody drafts a stat, schedules one, or searches for one.
--
-- JSON rather than four pairs of columns because the count is editorial. A
-- fifth figure should be an editor adding a row, not a migration.

ALTER TABLE settings
  ADD COLUMN stats JSON NULL AFTER address;
