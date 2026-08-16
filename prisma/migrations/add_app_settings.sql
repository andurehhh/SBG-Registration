-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  cor_required BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert the default row
INSERT INTO app_settings (id, cor_required)
VALUES ('default', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for registration form)
CREATE POLICY "Anyone can read app_settings"
  ON app_settings FOR SELECT
  USING (true);

-- Only authenticated users (admins) can update settings
CREATE POLICY "Authenticated users can update app_settings"
  ON app_settings FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
