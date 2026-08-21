-- Removes a banner placement the website has no way to render.
--
-- The site has no sidebar. "Sidebar" sat in the CMS's placement menu labelled
-- "not built yet", and LIVE_PLACEMENTS already excluded it — so an editor could
-- upload artwork, set a schedule, press Publish and reach nobody, with the only
-- clue being a parenthetical in a dropdown.
--
-- Safe to narrow: no banner has ever used it.

ALTER TABLE banners
  MODIFY COLUMN placement ENUM('home-hero','course-page','popup')
    NOT NULL DEFAULT 'home-hero';
