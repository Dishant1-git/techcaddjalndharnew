-- Removes two modules that manage nothing.
--
-- Branches
-- --------
-- The CMS carried branches, their phone numbers, opening hours, photographs and
-- a course-to-branch mapping. The website reads none of it — siteMap.ts has
-- said so in writing since the module was built ("Nothing on the website reads
-- branches yet — it has no locations section"). Jalandhar is one campus, so
-- there is nothing for the module to describe, and every table below is empty.
--
-- `enquiries.branch_id` and `branch_name` go with it. `branch_name` was never
-- written by anything: the enquiry schema has no such field, so the value the
-- public endpoint accepted was discarded on the way to the INSERT.
--
-- Faculty
-- -------
-- Also unread by the website, and replaced rather than simply deleted. The
-- people it described are the ones who sign in and publish, so they belong in
-- `users` with a role — not in a content table with a bio nobody renders. See
-- migration 024, which adds the editor role that gives them an account.
--
-- Every table dropped here is empty.
--
-- On the shape of this file
-- ------------------------
-- Two things force it to be written defensively rather than as a plain list of
-- DROPs.
--
-- The foreign keys are circular: `branches.manager_id` points at `faculty` and
-- `faculty.branch_id` points back at `branches`, so neither can be dropped
-- first. FOREIGN_KEY_CHECKS is turned off for the duration, which is the only
-- way through a cycle.
--
-- And DDL in MySQL does not roll back. A first attempt at this migration failed
-- partway on the cycle above, leaving the child tables dropped, the enquiries
-- columns gone, and the migration unrecorded — so re-running it had to be safe.
-- Hence the guarded ALTER: MySQL has no DROP COLUMN IF EXISTS, so the statement
-- is built only when the column is actually there.

SET FOREIGN_KEY_CHECKS = 0;

-- Drop the enquiries foreign key only if it still exists.
SET @sql := (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE enquiries DROP FOREIGN KEY fk_enquiries_branch',
    'DO 0'
  )
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'enquiries'
    AND CONSTRAINT_NAME = 'fk_enquiries_branch'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Same for each column, so a partial run can be finished by a second one.
SET @sql := (
  SELECT IF(COUNT(*) > 0, 'ALTER TABLE enquiries DROP COLUMN branch_id', 'DO 0')
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enquiries' AND COLUMN_NAME = 'branch_id'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(COUNT(*) > 0, 'ALTER TABLE enquiries DROP COLUMN branch_name', 'DO 0')
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enquiries' AND COLUMN_NAME = 'branch_name'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DROP TABLE IF EXISTS course_branches;
DROP TABLE IF EXISTS branch_photos;
DROP TABLE IF EXISTS branch_hours;
DROP TABLE IF EXISTS branch_phones;
DROP TABLE IF EXISTS faculty_expertise;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS faculty;

SET FOREIGN_KEY_CHECKS = 1;
