-- ============================================================
-- SBG Portal — Audit Log Migration
-- Run this in Supabase SQL Editor AFTER 002_rls_and_view.sql
-- ============================================================
-- This migration:
--   1. Creates the AuditLog table for tracking admin actions
--   2. Adds indexes for common query patterns
--   3. Enables RLS with INSERT and SELECT policies for authenticated role only
-- ============================================================

-- ── Step 1: Create AuditLog table ─────────────────────────────────────────────
CREATE TABLE "AuditLog" (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type         TEXT          NOT NULL,
  actor_email         TEXT          NOT NULL,
  actor_id            UUID          NOT NULL,
  target_member_id    UUID          REFERENCES "Member"(id) ON DELETE SET NULL,
  target_member_name  TEXT,
  details             JSONB,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Step 2: Indexes for common query patterns ─────────────────────────────────
CREATE INDEX idx_audit_log_action_type ON "AuditLog" (action_type);
CREATE INDEX idx_audit_log_created_at  ON "AuditLog" (created_at DESC);
CREATE INDEX idx_audit_log_actor       ON "AuditLog" (actor_id);

-- ── Step 3: Enable RLS — authenticated can INSERT and SELECT, anon has no access
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert audit logs"
  ON "AuditLog" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read audit logs"
  ON "AuditLog" FOR SELECT
  TO authenticated
  USING (true);
