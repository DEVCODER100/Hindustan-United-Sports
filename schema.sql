-- Hindustan United Sports — 30-Day Training Program
-- Run this ONCE in the Neon SQL editor (https://console.neon.tech).

CREATE TABLE IF NOT EXISTS players (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  whatsapp       TEXT NOT NULL,
  position       TEXT,
  start_date     DATE        DEFAULT CURRENT_DATE,
  completed_days INT[]       DEFAULT '{}',     -- finished day numbers, e.g. {1,2,3}
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Quick views for the academy owner:
--   SELECT id, name, phone, whatsapp, position,
--          cardinality(completed_days) AS days_done, created_at
--   FROM players ORDER BY created_at DESC;
