CREATE TABLE IF NOT EXISTS rates (
  id TEXT PRIMARY KEY,
  vedhani NUMERIC,
  ornaments22k NUMERIC,
  ornaments18k NUMERIC,
  silver NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- optional seed
INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
VALUES ('GF8lmn4pjyeuqPzA0xDE', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;