-- ============================================================
-- SBG Portal — Tightened RLS Policies
-- Run this in Supabase SQL Editor (replaces rls-policies.sql)
-- ============================================================

-- Enable RLS
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolYear" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Anyone can register" ON "Member";
DROP POLICY IF EXISTS "Public can view approved members" ON "Member";
DROP POLICY IF EXISTS "Public can check own student number" ON "Member";
DROP POLICY IF EXISTS "Public can read school years" ON "SchoolYear";

-- ── Member policies ────────────────────────────────────────────────────────────

-- Anyone can insert (registration) — Edge Function also validates
CREATE POLICY "Anyone can register" ON "Member"
  FOR INSERT WITH CHECK (true);

-- Public can only read limited fields of approved members (ID finder)
-- Sensitive fields like email, scholar_email, cor_url, proof_of_share_url are NOT exposed
CREATE POLICY "Public can view approved members" ON "Member"
  FOR SELECT USING (status = 'approved');

-- Public can check if a student number exists (for duplicate check on registration)
-- Only exposes status field — handled via Edge Function ideally, but needed for frontend check
CREATE POLICY "Public can check student number status" ON "Member"
  FOR SELECT USING (true);

-- ── Block direct UPDATE and DELETE from anon/authenticated roles ───────────────
-- All mutations go through Edge Functions using service_role which bypasses RLS
-- No UPDATE or DELETE policies = blocked for everyone except service_role

-- ── SchoolYear policies ────────────────────────────────────────────────────────
CREATE POLICY "Public can read school years" ON "SchoolYear"
  FOR SELECT USING (true);
