-- ============================================================
-- SBG Portal — Renewal Verification View
-- Allows anonymous users to verify their SBG ID for renewal
-- Only exposes inactive members' data needed for the renewal form
-- ============================================================

CREATE OR REPLACE VIEW member_renewal_view AS
SELECT
  id,
  full_name,
  student_number,
  email,
  scholar_email,
  course,
  year_level,
  section,
  gender,
  skills,
  why_join,
  expectations,
  sbg_id,
  status
FROM "Member"
WHERE status = 'inactive' AND sbg_id IS NOT NULL;

-- Grant anon read access to the renewal view
GRANT SELECT ON member_renewal_view TO anon;
