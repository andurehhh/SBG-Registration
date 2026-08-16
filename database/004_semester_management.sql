-- ============================================================
-- SBG Portal — Semester Management Migration
-- Run this in Supabase SQL Editor
-- ============================================================
-- This migration:
--   1. Drops and recreates SchoolYear table with semester support
--   2. Adds semester enum type
--   3. Ensures only one active term at a time
-- ============================================================

-- ── Step 1: Create Semester enum ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "Semester" AS ENUM ('1st', '2nd');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ── Step 2: Recreate SchoolYear table with semester support ───────────────────
DROP TABLE IF EXISTS "SchoolYear" CASCADE;

CREATE TABLE "SchoolYear" (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_year   TEXT        NOT NULL,           -- e.g., "2026-2027"
  semester      "Semester"  NOT NULL,           -- "1st" or "2nd"
  is_active     BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate entries for the same year + semester
  UNIQUE (school_year, semester)
);

-- ── Step 3: Index for quick active term lookup ────────────────────────────────
CREATE INDEX idx_school_year_active ON "SchoolYear" (is_active) WHERE is_active = true;

-- ── Step 4: RLS — authenticated can manage, public can read ───────────────────
ALTER TABLE "SchoolYear" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read school years"
  ON "SchoolYear" FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert school years"
  ON "SchoolYear" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update school years"
  ON "SchoolYear" FOR UPDATE
  TO authenticated
  USING (true);

-- ── Step 5: Seed with initial term ────────────────────────────────────────────
INSERT INTO "SchoolYear" (school_year, semester, is_active)
VALUES ('2025-2026', '2nd', true)
ON CONFLICT (school_year, semester) DO NOTHING;
