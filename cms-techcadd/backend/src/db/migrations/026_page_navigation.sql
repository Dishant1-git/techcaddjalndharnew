-- Gives a CMS page a way to be found.
--
-- A page could be written, published and reachable at its own address, and
-- still be invisible: nothing on the website linked to it. The only way to a
-- new page was to know its URL and type it, which is not something a visitor
-- does. So every page an editor made was, in practice, unreachable.
--
-- Three columns rather than a separate menu-builder table. A menu entry here is
-- a property of the page — "this one belongs in the footer" — not a record with
-- its own lifecycle that could drift out of step with the page it points at, or
-- outlive it.
--
-- `nav_label` exists because the title that reads well as a heading is often
-- too long for a menu: "Placement Assistance and Career Support" is a page
-- title and "Placements" is a menu item. Null falls back to the title.

ALTER TABLE pages
  -- Where the page is linked from. 'none' is the default: a page is not
  -- advertised until an editor decides it should be.
  ADD COLUMN nav_placement ENUM('none','header','footer') NOT NULL DEFAULT 'none' AFTER template,
  ADD COLUMN nav_label     VARCHAR(80) NULL AFTER nav_placement,
  -- Lower sorts first, so a menu can be arranged without renaming anything.
  ADD COLUMN nav_order     INT NOT NULL DEFAULT 0 AFTER nav_label;

CREATE INDEX idx_pages_nav ON pages (nav_placement, nav_order);
