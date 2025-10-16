-- SQL to create the 'rates' table with a single-row design
CREATE TABLE IF NOT EXISTS rates (
  id INTEGER PRIMARY KEY DEFAULT 1,
  vedhani NUMERIC,
  ornaments22k NUMERIC,
  ornaments18k NUMERIC,
  silver NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
VALUES (1, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;