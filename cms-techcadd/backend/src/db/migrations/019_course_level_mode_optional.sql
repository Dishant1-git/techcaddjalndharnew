-- "Not stated" has to be storable for level and mode.
--
-- Both were NOT NULL with no default, so every course had to claim a level and
-- a delivery mode whether anyone had decided one or not. That was survivable
-- while the CMS held two hand-entered courses. It stopped being survivable when
-- the site's full catalogue was imported: fifty-two courses had to be given
-- *something*, and whatever was chosen became a claim on fifty-two live pages —
-- "Beginner" on an AutoCAD course nobody had graded.
--
-- The facts strip already knows how to handle an absent value. Its own comment
-- says so: "Absent unless the CMS has a value, so a course nobody has priced
-- keeps the segment's generic wording." It just had no way to be given one,
-- because the column could not hold the absence.
--
-- Nullable, so an unset course falls back to the segment's generic facts until
-- an editor makes an actual decision.

ALTER TABLE courses
  MODIFY COLUMN level ENUM('beginner','intermediate','advanced') NULL,
  MODIFY COLUMN mode  ENUM('online','offline','hybrid')          NULL;

-- Clear the placeholders the import had to invent. Only rows that still carry
-- the import's defaults and have never been edited are touched: a course whose
-- level someone actually chose is left alone.
UPDATE courses
   SET level = NULL, mode = NULL
 WHERE level = 'beginner'
   AND mode = 'hybrid'
   AND created_at = updated_at;
