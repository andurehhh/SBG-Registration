-- ============================================================
-- SBG Portal — RLS Hardening & Public View Migration
-- Run this in Supabase SQL Editor AFTER schema.sql and 001_app_config.sql
-- ============================================================
-- This migration:
--   1. Creates a member_public_view VIEW exposing only safe columns for approved members
--   2. Grants anon SELECT on the view (not the base table)
--   3. Revokes anon direct SELECT on "Member"
--   4. Ensures authenticated role retains full SELECT on "Member"
--   5. Enables RLS on "Member" with appropriate policies
--   6. Service_Role bypasses RLS by default (Supabase built-in) — no explicit policy needed
-- ============================================================

-- ── Step 1: Enable RLS on "Member" ────────────────────────────────────────────
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;

-- ── Step 2: Drop existing policies to start clean ─────────────────────────────
DROP POLICY IF EXISTS "Anyone can register" ON "Member";
DROP POLICY IF EXISTS "Public can view approved members" ON "Member";
DROP POLICY IF EXISTS "Public can check own student number" ON "Member";
DROP POLICY IF EXISTS "Public can check student number status" ON "Member";
DROP POLICY IF EXISTS "Public can read school years" ON "SchoolYear";
DROP POLICY IF EXISTS "Authenticated full read access" ON "Member";
DROP POLICY IF EXISTS "Anon insert for registration" ON "Member";
DROP POLICY IF EXISTS "Anon select denied" ON "Member";

-- ── Step 3: Create member_public_view ─────────────────────────────────────────
-- Exposes only ID_Lookup_Fields for approved members.
-- Excludes: email, scholar_email, gender, why_join, expectations,
--           cor_url, proof_of_share_url, updated_at
CREATE OR REPLACE VIEW member_public_view AS
SELECT
  id,
  student_number,
  full_name,
  sbg_id,
  course,
  year_level,
  section,
  school_year,
  skills,
  sticker_id,
  status,
  created_at
FROM "Member"
WHERE status = 'approved';

-- ── Step 4: Grant/Revoke permissions ──────────────────────────────────────────
-- Anon can only SELECT from the view (not the base table)
GRANT SELECT ON member_public_view TO anon;

-- Revoke direct SELECT on "Member" from anon
REVOKE SELECT ON "Member" FROM anon;

-- Authenticated role retains full SELECT on "Member"
GRANT SELECT ON "Member" TO authenticated;

-- ── Step 5: RLS Policies on "Member" ──────────────────────────────────────────

-- Authenticated users get full read access (all columns, all statuses)
CREATE POLICY "Authenticated full read access"
  ON "Member"
  FOR SELECT
  TO authenticated
  USING (true);

-- Anon INSERT allowed (registration flow via Edge Functions passing anon context)
CREATE POLICY "Anon insert for registration"
  ON "Member"
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- No UPDATE policy for anon = UPDATE denied
-- No DELETE policy for anon = DELETE denied
-- Service_Role bypasses RLS entirely (Supabase default behavior)

-- ── Step 6: SchoolYear RLS (unchanged from previous) ──────────────────────────
ALTER TABLE "SchoolYear" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read school years" ON "SchoolYear";

CREATE POLICY "Public can read school years"
  ON "SchoolYear"
  FOR SELECT
  USING (true);
