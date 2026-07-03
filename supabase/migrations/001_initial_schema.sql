-- Art Deer initial schema for Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS data_collections (
  collection_key TEXT PRIMARY KEY,
  data_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entered_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  path TEXT,
  session_id TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_session_visited
  ON visitors (session_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitors_visited_at
  ON visitors (visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitors_entered_at
  ON visitors (entered_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
  ON analytics_events (event_type, created_at DESC);

-- Storage bucket (run in Supabase Dashboard → Storage if SQL insert fails)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
-- ON CONFLICT (id) DO NOTHING;
