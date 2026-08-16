-- AppConfig table: application-level feature flags and settings
-- Stores key-value pairs for things like registration_open

CREATE TABLE IF NOT EXISTS "AppConfig" (
  key         TEXT        PRIMARY KEY,
  value       JSONB       NOT NULL DEFAULT 'true'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the registration_open flag (default: open)
INSERT INTO "AppConfig" (key, value)
VALUES ('registration_open', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Auto-update updated_at on change
CREATE TRIGGER app_config_updated_at
  BEFORE UPDATE ON "AppConfig"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: anyone can read config, only authenticated users can update
ALTER TABLE "AppConfig" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app config"
  ON "AppConfig" FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update app config"
  ON "AppConfig" FOR UPDATE
  USING (auth.role() = 'authenticated');
