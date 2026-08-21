-- Gives content staff an account of their own.
--
-- Migration 010 collapsed three roles into one on the grounds that "the CMS is
-- operated by a single administrator". That is no longer true: the people who
-- were being described in the faculty table are the ones who will be signing in
-- and publishing, so they need accounts — and an account that can also change
-- the site settings, read every enquiry and create other users is more than
-- uploading a blog post requires.
--
-- Two roles, and the difference is narrow on purpose:
--
--   editor  everything content — courses, pages, blogs, banners, gallery,
--           FAQs, reviews, categories, testimonials, media
--   admin   the above, plus settings, redirects, enquiries and user accounts
--
-- Existing users stay admin. This widens what the CMS can express; it takes
-- nothing away from anybody who already had access.

ALTER TABLE users
  MODIFY role ENUM('admin','editor') NOT NULL DEFAULT 'editor';
