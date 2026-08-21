-- A destination for a gallery photograph.
--
-- Some photographs are worth clicking: a campus shot that should open the
-- branch page, an award that should open the certificate, a batch photo that
-- should open the course it belongs to. There was nowhere to put that, so the
-- wall was decorative and nothing more.
--
-- Nullable, because most photographs are not links and should not pretend to
-- be — the website only makes a tile clickable when this is set.
--
-- 500 to match the other link columns in the schema. Validated in the API as a
-- path beginning with "/" or a full http(s) address, the same rule content
-- blocks use, so `javascript:` cannot reach an href.

ALTER TABLE gallery_images
  ADD COLUMN link_url VARCHAR(500) NULL AFTER caption;
