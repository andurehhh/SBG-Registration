-- ============================================================
-- SBG Portal — Supabase Schema
-- Paste this into the Supabase SQL Editor and run it
-- ============================================================

-- Enums
CREATE TYPE "MemberStatus" AS ENUM ('pending', 'approved', 'rejected', 'inactive', 'removed');
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'NonBinary', 'PreferNotToSay');

-- Members table
CREATE TABLE "Member" (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  student_number      TEXT          NOT NULL UNIQUE,
  full_name           TEXT          NOT NULL,
  email               TEXT          NOT NULL,
  scholar_email       TEXT,
  year_level          INTEGER       NOT NULL,
  section             TEXT          NOT NULL,
  course              TEXT,
  gender              "Gender",
  skills              TEXT[]        NOT NULL DEFAULT '{}',
  why_join            TEXT,
  expectations        TEXT,
  cor_url             TEXT,
  proof_of_share_url  TEXT,
  sticker_id          TEXT,
  status              "MemberStatus" NOT NULL DEFAULT 'pending',
  sbg_id              TEXT          UNIQUE,
  school_year         TEXT,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_member_student_number ON "Member" (student_number);
CREATE INDEX idx_member_status         ON "Member" (status);
CREATE INDEX idx_member_course         ON "Member" (course);
CREATE INDEX idx_member_gender         ON "Member" (gender);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER member_updated_at
  BEFORE UPDATE ON "Member"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- SchoolYear table
CREATE TABLE "SchoolYear" (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT        NOT NULL UNIQUE,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
