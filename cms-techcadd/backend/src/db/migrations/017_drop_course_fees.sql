-- Takes the fee off the course record.
--
-- Fees are not published on this site and are not the CMS's to hold. What a
-- student actually pays depends on the track, the batch, the instalment plan
-- and whatever a counsellor agrees on the day — none of which a single DECIMAL
-- can carry. The course pages already say so in their FAQs ("ask a counsellor
-- for the current fee sheet") and deliberately print no figure, so the column
-- was feeding a facts strip entry that contradicted the answer below it.
--
-- A field the CMS asks an editor to fill in, and which then either goes
-- nowhere or states a price the institute does not stand behind, is worse than
-- no field at all.
--
-- Destructive and there is no down-migration. Take a dump first if the figures
-- are wanted for reference elsewhere:
--
--   mysqldump -u root -p techcadd_cms_jal courses > courses-before-017.sql

ALTER TABLE courses
  DROP COLUMN fee,
  DROP COLUMN discounted_fee;
