-- Where a public enquiry came from.
--
-- The website records these today and uses them to refuse duplicate
-- submissions (same phone within a day, same address within an hour). Once the
-- CMS is the system of record that check has to run against the CMS's rows, so
-- the columns move here with the data.
--
-- Distinct from the existing `source` enum, which is how staff classify an
-- enquiry (website / walk-in / phone / referral / social). These describe the
-- specific submission.

ALTER TABLE enquiries
  -- Which form: "Call Request" (site-wide popup) or "Course Enquiry".
  ADD COLUMN form_type  VARCHAR(32)  NULL AFTER source,
  -- The page it was submitted from.
  ADD COLUMN source_url VARCHAR(500) NULL AFTER form_type,
  -- 45 characters holds an IPv6 address in full.
  ADD COLUMN ip         VARCHAR(45)  NULL AFTER source_url,
  ADD COLUMN user_agent VARCHAR(255) NULL AFTER ip;

-- The duplicate check filters on these, and on a busy site it runs for every
-- submission.
CREATE INDEX idx_enquiries_phone_created ON enquiries (phone, created_at);
CREATE INDEX idx_enquiries_ip_created    ON enquiries (ip, created_at);
