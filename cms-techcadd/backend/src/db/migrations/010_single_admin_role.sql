-- Collapse the three roles into one.
--
-- The CMS is operated by a single administrator, so `super-admin`, `admin` and
-- `editor` described a hierarchy nobody was climbing. Everyone becomes `admin`
-- with full access.
--
-- Existing editors gain user and settings access as a result. That is the
-- point of the change, but it is a widening of permissions rather than a
-- narrowing, so it is worth stating plainly rather than leaving to be
-- discovered.

-- Widen the column first so the old values and the new one can coexist for the
-- duration of the UPDATE; MySQL would otherwise reject rows that no longer
-- match the enum.
ALTER TABLE users
  MODIFY role ENUM('super-admin','admin','editor') NOT NULL DEFAULT 'admin';

UPDATE users SET role = 'admin';

ALTER TABLE users
  MODIFY role ENUM('admin') NOT NULL DEFAULT 'admin';
