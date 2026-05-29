-- ============================================================
-- Urentracker — Supabase schema
-- Uitvoeren via: Supabase dashboard → SQL Editor → New query
-- ============================================================

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id                  TEXT PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  color               TEXT NOT NULL DEFAULT '#4a9eff',
  client              TEXT,
  client_address      TEXT,
  client_vat          TEXT,
  hourly_rate         NUMERIC DEFAULT 0,
  max_hours_per_month NUMERIC,
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eigen projecten" ON projects
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Entries
CREATE TABLE IF NOT EXISTS entries (
  id                    TEXT PRIMARY KEY,
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description           TEXT,
  project_id            TEXT,           -- geen FK: app beheert relatie zelf
  tags                  JSONB DEFAULT '[]',
  start_time            BIGINT NOT NULL,
  end_time              BIGINT,
  rate_at_time_of_entry NUMERIC DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eigen entries" ON entries
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id             TEXT PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id     TEXT,
  month          TEXT,
  invoice_number TEXT,
  generated_at   BIGINT,
  status         TEXT DEFAULT 'niet-gefactureerd',
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eigen facturen" ON invoices
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- App settings (key-value: currency, running_timer, invoice_settings, invoice_counter)
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT NOT NULL,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value      JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (key, user_id)
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eigen instellingen" ON app_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
