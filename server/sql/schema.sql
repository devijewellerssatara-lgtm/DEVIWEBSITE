-- Schema for jewellery-server (PostgreSQL)

-- Rates table stores a single document-equivalent row migrated from Firestore.
-- The default ID mirrors the Firestore document ID, but can be overridden via RATES_ID.
CREATE TABLE IF NOT EXISTS rates (
  id TEXT PRIMARY KEY,
  vedhani NUMERIC,
  ornaments22k NUMERIC,
  ornaments18k NUMERIC,
  silver NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed a default row to mirror the Firestore doc if needed.
INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
VALUES ('GF8lmn4pjyeuqPzA0xDE', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;