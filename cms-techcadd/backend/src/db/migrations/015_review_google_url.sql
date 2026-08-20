-- The address a review can actually be checked at.
--
-- The reviews page already carries the Google mark on every card, which tells
-- a visitor "this was left on a profile you can go and read". Until now that
-- claim was only backed by a link to the business profile as a whole, so a
-- visitor could not get from a specific review to the specific review. The
-- mark was doing more work than the data behind it supported.
--
-- Nullable, because it is genuinely optional: a review typed up from a walk-in
-- has no Google address and inventing one would be a fabrication. The website
-- shows the "Read on Google" button only on the reviews that carry one.
--
-- 500 to match canonical_url elsewhere in the schema. Google's share links are
-- short (g.page, maps.app.goo.gl) but a full maps URL with a place id and a
-- review anchor is long, and truncating a URL silently is worse than storing a
-- generous column.

ALTER TABLE reviews
  ADD COLUMN google_url VARCHAR(500) NULL AFTER source;
