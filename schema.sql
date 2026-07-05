-- Hindustan United Sports — 30-Day Training Program
-- Run this ONCE in the Neon SQL editor (https://console.neon.tech).

CREATE TABLE IF NOT EXISTS players (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  dob               DATE,               -- date of birth
  city              TEXT,
  whatsapp          TEXT,               -- legacy / optional
  position          TEXT,               -- legacy / optional
  start_date        DATE        DEFAULT CURRENT_DATE,
  completed_days    INT[]       DEFAULT '{}',   -- finished day numbers, e.g. {1,2,3}
  last_completed_at TIMESTAMPTZ,               -- drives the 4-hour cooldown between days
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Quick views for the academy owner:
--   SELECT id, name, phone, whatsapp, position,
--          cardinality(completed_days) AS days_done, created_at
--   FROM players ORDER BY created_at DESC;


-- ── Player Test Reports (fitness/skill assessment tool) ──
CREATE TABLE IF NOT EXISTS player_reports (
  id           BIGSERIAL PRIMARY KEY,
  player_name  TEXT NOT NULL,
  age_group    TEXT,
  position     TEXT,               -- FWD | MID | DEF
  test_date    DATE,
  ground       TEXT,
  -- raw test inputs
  sprint10     NUMERIC,            -- 10m sprint (s)
  sprint30     NUMERIC,            -- 30m sprint (s)
  illinois     NUMERIC,            -- Illinois agility (s)
  ttest        NUMERIC,            -- T-Test (s)
  slalom       NUMERIC,            -- slalom dribble (s)
  fig8         INT,                -- figure-8 laps
  wallpass     INT,                -- wall passes in 30s
  target       INT,                -- passing accuracy %
  yoyo         INT,                -- Yo-Yo level
  -- computed ratings (1..99)
  pace         INT,
  agility      INT,
  dribbling    INT,
  passing      INT,
  stamina      INT,
  ovr          INT,
  band         TEXT,               -- Elite | Advanced | Academy | Developing | Foundation
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Owner view:
--   SELECT id, player_name, position, age_group, ovr, band, test_date, created_at
--   FROM player_reports ORDER BY created_at DESC;
